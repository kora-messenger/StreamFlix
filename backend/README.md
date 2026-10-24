# StreamMax Auth API (Node + MongoDB)

The StreamMax backend, fully independent of Base44: MongoDB Atlas (free M0 tier)
stores users and email codes, Brevo delivers the codes, and Google verifies
ID tokens directly. The app speaks the same JSON contract it always did
(`POST / { action, ... }`), so switching the app over is a one-constant change.

## Actions

| action | payload | result |
|---|---|---|
| `precheck` | `fullName, email, password, confirm` | `{ ok, field?, message? }` |
| `register` | `fullName, email, password, confirm` | `{ ok, user?, field?, message? }` |
| `login` | `email, password` | `{ ok, user?, field?, message? }` |
| `sendCode` | `email, type` (`signup`/`login`/`reset`/`google`) | `{ ok, message? }` |
| `verifyCode` | `email, type, code` | `{ ok, message? }` |
| `googleVerify` | `idToken` | `{ ok, email, name, user }` |
| `googleSession` | `email` | `{ ok, user }` (after a verified Google email code) |
| `completeReset` | `email, password, confirm` | `{ ok, field?, message? }` |
| `emailExists` | `email` | `{ ok, exists }` |
| `migrate` | `accounts: [{fullName,email,salt,hash}]` | `{ ok, imported }` (one-time import of old device-local accounts) |

Passwords are hashed with scrypt (per-user random salt). Accounts imported from
the old device-local era keep their legacy sha256 hash and are upgraded to
scrypt automatically on their first successful login. Codes are 6 digits,
expire in 10 minutes, allow 5 attempts, and are rate-limited to 5 per email
per hour; code documents auto-delete after 24h via a TTL index.

## Deploy (free tier, no card)

1. **MongoDB Atlas** — cloud.mongodb.com → free M0 cluster → Database Access:
   create a user (username + password) → Network Access: allow `0.0.0.0/0`
   (Render's outbound IPs vary) → Connect → "Drivers" → copy the connection
   string. It looks like
   `mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`.
2. **Render** — render.com → New → **Web Service** → connect the
   `kora-messenger/StreamMax` GitHub repo → set **Root Directory** to `backend`
   → Build command: `npm install` → Start command: `npm start` → Instance type:
   Free. Name the service `streammax-api` so the URL is
   `https://streammax-api.onrender.com`.
3. **Environment variables** (Render → Environment):
   - `MONGODB_URI` — the Atlas connection string (append `/streammax` database or leave default; the code creates a `streammax` database)
   - `BREVO_API_KEY` — from brevo.com → SMTP & API → API Keys
   - `EMAIL_FROM` — `ijeziegoodluck4@gmail.com` (must be added and validated
     under Brevo → Senders; until a real domain exists)
   - `GOOGLE_WEB_CLIENT_ID` — `463127766110-cugua4mmvf9mrj2mgpdp05iat3f8vr07.apps.googleusercontent.com`
     (defaults to this value if omitted)
4. Deploy, then check `https://YOUR-RENDER-URL/` returns `{"ok":true}`.

Every push to `main` auto-redeploys the backend on Render.

## Swapping the app over

In the app, `src/core/auth/authService.ts` holds the backend URL in one
constant (`API_BASE`). Change it to the Render URL and the app is fully off
Base44. Sessions stay on-device (AsyncStorage) exactly as before; only
accounts and codes move to MongoDB.

## Free-tier notes

- Render free services sleep after ~15 minutes without traffic; the first
  request after sleep takes a few extra seconds. Acceptable for auth calls.
- Atlas M0: 512MB storage, shared CPU — far more than StreamMax auth needs.
- Brevo free: 300 emails/day.
