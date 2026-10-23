/**
 * Native Google Sign-In (Google SDK) for StreamMax.
 *
 * Setup (one-time, in Google Cloud Console):
 *   1. OAuth consent screen → External, app "StreamMax".
 *   2. OAuth client ID → Android → package `com.streamflix.app`,
 *      SHA-1 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
 *      (the committed keystore that debug AND release builds sign with).
 *   3. OAuth client ID → Web application → paste its value into
 *      GOOGLE_WEB_CLIENT_ID below. Until then the Google button falls back
 *      to the email-code flow.
 *
 * After the SDK returns the Google account email, the app still sends the
 * emailed verification code (streammaxAuth) before opening the session.
 */
import { GoogleSignin } from '@react-native-google-signin/google-signin';

/** Web OAuth client ID from Google Cloud Console (ends in .apps.googleusercontent.com). */
export const GOOGLE_WEB_CLIENT_ID = ''; // TODO: paste the Web client ID here

let configured = false;

export function isGoogleSdkReady(): boolean {
  return GOOGLE_WEB_CLIENT_ID.length > 0;
}

function configure() {
  if (configured || !isGoogleSdkReady()) return;
  GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID, offlineAccess: false });
  configured = true;
}

/**
 * Open the Google account picker and return the picked account's email.
 * Returns { ok: false } with an empty message if the user cancels.
 */
export async function googleSignInEmail(): Promise<{ ok: boolean; email?: string; message?: string }> {
  configure();
  try {
    await GoogleSignin.hasPlayServices();
    const result = (await GoogleSignin.signIn()) as any;
    const user = result?.user ?? result;
    const email = user?.email;
    if (!email) return { ok: false, message: 'That Google account has no email. Pick another one.' };
    return { ok: true, email };
  } catch (err: any) {
    if (err?.code === '-5' || err?.code === 'SIGN_IN_CANCELLED' || String(err?.message || '').includes('cancel')) {
      return { ok: false, message: '' };
    }
    return { ok: false, message: 'Google sign-in failed. Check your connection and try again.' };
  }
}
