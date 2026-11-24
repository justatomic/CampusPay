/**
 * Google OAuth + Client-side Stellar keypair
 *
 * Flow:
 * 1. User signs in with Google → we get a credential (JWT id_token)
 * 2. We derive a deterministic seed from: SHA-256(google_sub + app_secret)
 * 3. We generate a Stellar keypair from that seed
 * 4. The keypair lives in memory only — never sent to any server
 * 5. We fund the account via Friendbot on first login (testnet)
 *
 * Security model:
 * - The seed is derived from the user's stable Google `sub` ID
 * - APP_SALT adds a domain separation — without it, the keypair is worthless
 * - Private key never leaves the browser
 * - User loses access if they lose their Google account (acceptable for testnet/MVP)
 */

import { Keypair } from '@stellar/stellar-sdk';

// Salt — set NEXT_PUBLIC_APP_SALT in .env.local for production
// For testnet/demo a constant is fine
const APP_SALT = process.env.NEXT_PUBLIC_APP_SALT ?? 'campuspay-stellar-testnet-v1';

/**
 * Derive a deterministic Stellar keypair from a Google sub (user ID).
 * Uses Web Crypto SubtleCrypto — no server call, runs in browser only.
 */
export async function deriveKeypairFromGoogle(googleSub: string): Promise<Keypair> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(googleSub),
    { name: 'HKDF' },
    false,
    ['deriveBits'],
  );

  const derived = await crypto.subtle.deriveBits(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: enc.encode(APP_SALT),
      info: enc.encode('stellar-keypair'),
    },
    keyMaterial,
    256, // 32 bytes = Stellar seed size
  );

  const seedBytes = new Uint8Array(derived);
  return Keypair.fromRawEd25519Seed(Buffer.from(seedBytes));
}

/**
 * Decode a Google credential (JWT) to extract the sub and profile info.
 * We only decode — we do NOT verify the signature here (that happens
 * server-side in production; for testnet/demo this is acceptable).
 */
export function decodeGoogleCredential(credential: string): {
  sub: string;
  email: string;
  name: string;
  picture: string;
} {
  const payload = credential.split('.')[1];
  const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  return {
    sub:     decoded.sub     ?? '',
    email:   decoded.email   ?? '',
    name:    decoded.name    ?? '',
    picture: decoded.picture ?? '',
  };
}
