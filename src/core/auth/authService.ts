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

/** Six-digit reset codes, device-local until the mail service is connected. */
interface StoredResetCode { code: string; expiresAt: number; attempts: number; }
const RESET_CODES_KEY = 'sm.resetCodes';

async function readCodes(): Promise<Record<string, StoredResetCode>> {
  const raw = await AsyncStorage.getItem(RESET_CODES_KEY);
  return raw ? (JSON.parse(raw) as Record<string, StoredResetCode>) : {};
}

async function writeCodes(db: Record<string, StoredResetCode>) {
  await AsyncStorage.setItem(RESET_CODES_KEY, JSON.stringify(db));
}

/** Generate and store a 6-digit reset code for an email. Returns the code; the caller decides how to deliver it. */
export async function sendResetCode(email: string): Promise<string> {
  const e = email.trim().toLowerCase();
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const db = await readCodes();
  db[e] = { code, expiresAt: Date.now() + 10 * 60 * 1000, attempts: 0 };
  await writeCodes(db);
  return code;
}

/** Check a reset code (wrong attempts increment; 5 wrong tries invalidates it). */
export async function verifyResetCode(email: string, code: string): Promise<{ ok: boolean; message?: string }> {
  const e = email.trim().toLowerCase();
  const db = await readCodes();
  const rec = db[e];
  if (!rec) return { ok: false, message: 'No reset code was requested. Go back and request one.' };
  if (Date.now() > rec.expiresAt) return { ok: false, message: 'This code has expired. Request a new one.' };
  if (rec.code === code.trim()) return { ok: true };
  rec.attempts += 1;
  if (rec.attempts >= 5) { delete db[e]; await writeCodes(db); return { ok: false, message: 'Too many wrong attempts. Request a new code.' }; }
  await writeCodes(db);
  return { ok: false, message: 'Incorrect code. Please try again.' };
}

/** Does an account exist for this email? */
export async function emailExists(email: string): Promise<boolean> {
  const e = email.trim().toLowerCase();
  return (await loadAccounts()).some(a => a.email === e);
}

/** Device-local password reset by email (no mail infrastructure yet). */
export async function resetPassword(input: { email: string; code: string; password: string; confirm: string }): Promise<AuthResult> {
  const email = input.email.trim().toLowerCase();
  const v = await verifyResetCode(email, input.code);
  if (!v.ok) return { ok: false, field: 'code', message: v.message };
  const db = await readCodes();
  delete db[email];
  await writeCodes(db);
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
