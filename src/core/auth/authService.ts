/**
 * StreamMax device-local authentication service.
 *
 * Real accounts: salted SHA-256 password hashes, per-field validation errors,
 * sessions with optional persistence ("Remember me"), password reset.
 *
 * The layer is deliberately isolated behind this interface so the storage can
 * later be swapped for a remote backend without touching the screens.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sha256 } from 'js-sha256';

/* Remote email-verification backend (domain-swappable when StreamMax migrates
   to its own .com infrastructure — this is the only place the URL lives). */
const API_BASE = 'https://solas-463874c8.base44.app';
const AUTH_FN = `${API_BASE}/functions/streammaxAuth`;
export type CodeType = 'signup' | 'login' | 'reset' | 'google';
export interface CodeResult { ok: boolean; message?: string; }

async function callAuth(payload: Record<string, unknown>): Promise<CodeResult> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 15000);
    const res = await fetch(AUTH_FN, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    const data = (await res.json().catch(() => ({}))) as CodeResult;
    return { ok: !!data.ok, message: data.message };
  } catch {
    return { ok: false, message: 'Could not reach the email service. Check your connection and try again.' };
  }
}

/** Send a real 6-digit code to the user's inbox (10 min expiry, 5 attempts, rate-limited). */
export async function requestCode(email: string, type: CodeType): Promise<CodeResult> {
  const e = email.trim().toLowerCase();
  if (!emailOk(e)) return { ok: false, message: 'Enter a valid email address' };
  return callAuth({ action: 'sendCode', email: e, type });
}

/** Check a code the user typed against the backend. */
export async function checkCode(email: string, type: CodeType, code: string): Promise<CodeResult> {
  const e = email.trim().toLowerCase();
  return callAuth({ action: 'verifyCode', email: e, type, code: code.trim() });
}

export interface AuthUser { id: string; fullName: string; email: string; }
interface Account extends AuthUser { salt: string; hash: string; createdAt: number; }
interface Session { userId: string; token: string; remember: boolean; }
export type Field = 'name' | 'email' | 'password' | 'confirm' | 'code';
export interface AuthResult { ok: boolean; field?: Field; message?: string; user?: AuthUser; }

const ACCOUNTS_KEY = 'sm.accounts';
const SESSION_KEY = 'sm.session';

let accounts: Account[] | null = null;
let memorySession: Session | null = null;

const randomHex = (n: number) => Array.from({ length: n }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('');
const hashPassword = (pw: string, salt: string) => sha256(`${salt}:${pw}`);
const emailOk = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);

async function loadAccounts(): Promise<Account[]> {
  if (accounts) return accounts;
  const raw = await AsyncStorage.getItem(ACCOUNTS_KEY);
  accounts = raw ? (JSON.parse(raw) as Account[]) : [];
  return accounts;
}

async function persist(list: Account[]) {
  await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(list));
}

async function openSession(account: Account, remember: boolean) {
  memorySession = { userId: account.id, token: randomHex(24), remember };
  if (remember) await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(memorySession));
  else await AsyncStorage.removeItem(SESSION_KEY);
}

/** Validate registration input without creating the account (used before emailing the signup code). */
export async function precheckRegister(input: {
  fullName: string; email: string; password: string; confirm: string;
}): Promise<AuthResult> {
  const fullName = input.fullName.trim();
  const email = input.email.trim().toLowerCase();
  if (!fullName) return { ok: false, field: 'name', message: 'Please enter your full name' };
  if (!emailOk(email)) return { ok: false, field: 'email', message: 'Enter a valid email address' };
  if (input.password.length < 6) return { ok: false, field: 'password', message: 'Password must be at least 6 characters' };
  if (input.password !== input.confirm) return { ok: false, field: 'confirm', message: 'Passwords do not match' };
  const list = await loadAccounts();
  if (list.some(a => a.email === email)) return { ok: false, field: 'email', message: 'An account with this email already exists' };
  return { ok: true };
}

/** Check credentials without opening a session (password step of the two-step login). */
export async function checkPassword(email: string, password: string): Promise<AuthResult> {
  const e = email.trim().toLowerCase();
  if (!emailOk(e)) return { ok: false, field: 'email', message: 'Enter a valid email address' };
  const list = await loadAccounts();
  const account = list.find(a => a.email === e);
  if (!account) return { ok: false, field: 'email', message: 'No account found with this email' };
  if (hashPassword(password, account.salt) !== account.hash) {
    return { ok: false, field: 'password', message: 'Incorrect password' };
  }
  return { ok: true, user: { id: account.id, fullName: account.fullName, email: account.email } };
}

/**
 * Google direct sign-in (MarketScope AI pattern): the backend verifies the
 * Google ID token with Google itself and returns the confirmed email/name;
 * then we open the existing account or create one keyed to that email.
 * No emailed code is involved.
 */
export async function googleTokenLogin(idToken: string): Promise<AuthResult> {
  try {
    const res = await fetch(AUTH_FN, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'googleVerify', idToken }),
    });
    const v = await res.json();
    if (!res.ok || !v.ok) return { ok: false, message: v.message || 'Google could not verify that sign-in. Try again.' };
    return googleVerifiedVerified(v.email, v.name || '');
  } catch {
    return { ok: false, message: 'Could not reach the sign-in service. Check your connection.' };
  }
}

/** Finish a Google email-code sign-in: open the existing account, or create one keyed to the email. */
export async function googleVerified(email: string): Promise<AuthResult> {
  return googleVerifiedVerified(email, '');
}

async function googleVerifiedVerified(email: string, googleName: string): Promise<AuthResult> {
  const e = email.trim().toLowerCase();
  if (!emailOk(e)) return { ok: false, field: 'email', message: 'Enter a valid email address' };
  const list = await loadAccounts();
  let account = list.find(a => a.email === e);
  if (!account) {
    const salt = randomHex(16);
    // random local password the user never sees — they own the email and can reset anytime
    const generated = randomHex(12);
    account = { id: randomHex(12), fullName: (googleName || e.split('@')[0]).trim(), email: e, salt, hash: hashPassword(generated, salt), createdAt: Date.now() };
    list.push(account);
    await persist(list);
  }
  await openSession(account, true);
  return { ok: true, user: { id: account.id, fullName: account.fullName, email: account.email } };
}

/** Create an account, log it in, and remember it. */
export async function register(input: {
  fullName: string; email: string; password: string; confirm: string;
}): Promise<AuthResult> {
  const fullName = input.fullName.trim();
  const email = input.email.trim().toLowerCase();
  if (!fullName) return { ok: false, field: 'name', message: 'Please enter your full name' };
  if (!emailOk(email)) return { ok: false, field: 'email', message: 'Enter a valid email address' };
  if (input.password.length < 6) return { ok: false, field: 'password', message: 'Password must be at least 6 characters' };
  if (input.password !== input.confirm) return { ok: false, field: 'confirm', message: 'Passwords do not match' };

  const list = await loadAccounts();
  if (list.some(a => a.email === email)) return { ok: false, field: 'email', message: 'An account with this email already exists' };

  const salt = randomHex(16);
  const account: Account = { id: randomHex(12), fullName, email, salt, hash: hashPassword(input.password, salt), createdAt: Date.now() };
  list.push(account);
  await persist(list);
  await openSession(account, true);
  return { ok: true, user: { id: account.id, fullName: account.fullName, email: account.email } };
}

/** Validate credentials and open a session (persisted only if remember). */
export async function login(input: { email: string; password: string; remember: boolean }): Promise<AuthResult> {
  const email = input.email.trim().toLowerCase();
  if (!emailOk(email)) return { ok: false, field: 'email', message: 'Enter a valid email address' };
  const list = await loadAccounts();
  const account = list.find(a => a.email === email);
  if (!account) return { ok: false, field: 'email', message: 'No account found with this email' };
  if (hashPassword(input.password, account.salt) !== account.hash) {
    return { ok: false, field: 'password', message: 'Incorrect password' };
  }
  await openSession(account, input.remember);
  return { ok: true, user: { id: account.id, fullName: account.fullName, email: account.email } };
}

/** Restore a remembered session at launch. Returns the user, or null. */
export async function resumeSession(): Promise<AuthUser | null> {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const s = JSON.parse(raw) as Session;
    const account = (await loadAccounts()).find(a => a.id === s.userId);
    if (!account) { await AsyncStorage.removeItem(SESSION_KEY); return null; }
    memorySession = s;
    return { id: account.id, fullName: account.fullName, email: account.email };
  } catch {
    return null;
  }
}

/** The currently signed-in user, if any (memory or restored session). */
export async function getCurrentUser(): Promise<AuthUser | null> {
  if (!memorySession) return null;
  const account = (await loadAccounts()).find(a => a.id === memorySession!.userId);
  return account ? { id: account.id, fullName: account.fullName, email: account.email } : null;
}

export async function logout() {
  memorySession = null;
  await AsyncStorage.removeItem(SESSION_KEY);
}

/** Does an account exist for this email? */
export async function emailExists(email: string): Promise<boolean> {
  const e = email.trim().toLowerCase();
  return (await loadAccounts()).some(a => a.email === e);
}

/** Set a new password after the emailed reset code was verified on the Enter Code screen. */
export async function completeReset(input: { email: string; password: string; confirm: string }): Promise<AuthResult> {
  const email = input.email.trim().toLowerCase();
  const list = await loadAccounts();
  const account = list.find(a => a.email === email);
  if (!account) return { ok: false, field: 'email', message: 'No account found with this email' };
  if (input.password.length < 6) return { ok: false, field: 'password', message: 'Password must be at least 6 characters' };
  if (input.password !== input.confirm) return { ok: false, field: 'confirm', message: 'Passwords do not match' };
  const salt = randomHex(16);
  account.salt = salt;
  account.hash = hashPassword(input.password, salt);
  await persist(list);
  return { ok: true };
}
