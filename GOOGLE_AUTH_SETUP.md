# Setting up Google Sign-In for CampusPay

## How it works

1. Student clicks **Continue with Google** and signs in
2. We receive a Google credential (JWT) containing their stable `sub` ID
3. We derive a **deterministic Stellar keypair** in-browser using HKDF-SHA256:
   `seed = HKDF(key=google_sub, salt=APP_SALT, info="stellar-keypair")`
4. The Stellar account is funded via Friendbot (testnet)
5. All transactions are **signed locally** — the private key never leaves the browser

## Security properties

| Property | Status |
|---|---|
| Works on mobile | ✅ No extension needed |
| Non-custodial | ✅ Private key in browser memory only |
| Deterministic recovery | ✅ Same Google account = same wallet, always |
| Key loss risk | ⚠️ If Google account is lost, wallet is lost (acceptable for testnet/MVP) |

## Setup steps

### 1. Google Cloud Console

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (or use existing)
3. **APIs & Services → OAuth consent screen**
   - User type: External
   - App name: CampusPay
   - Add scopes: `email`, `profile`, `openid`
4. **APIs & Services → Credentials → Create Credentials → OAuth client ID**
   - Application type: **Web application**
   - Authorized JavaScript origins:
     - `http://localhost:3000`
     - `https://campus-pay-umber.vercel.app` (your Vercel URL)
   - **No redirect URIs needed** (Google Identity Services uses popup/One Tap)
5. Copy the **Client ID** (looks like `123456-abc.apps.googleusercontent.com`)

### 2. Local development

```bash
cp .env.local.example .env.local
# Edit .env.local and paste your Client ID
npm run dev
```

### 3. Vercel deployment

In Vercel dashboard → your project → **Settings → Environment Variables**:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Your client ID from step 1 |
| `NEXT_PUBLIC_APP_SALT` | A long random string (keep it secret) |

Then redeploy: `git push` triggers an automatic redeploy.

## For production (mainnet)

Before moving to mainnet, consider upgrading to:
- **Server-side credential verification** (verify Google JWT signature)
- **Encrypted key backup** (encrypt the keypair with a PIN, store cipher in DB)
- This keeps the non-custodial model while adding account recovery
