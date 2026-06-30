// Zero-dependency Google service-account auth. Signs a JWT with the service
// account's private key (Node crypto, RS256) and exchanges it for an OAuth2
// access token — so we can call Google REST APIs (Search Console, GA4 Data) with
// a plain fetch, no googleapis/@google-analytics/data dependency.
//
// Reuses the SAME credential the analytics agent already expects:
//   GA4_SERVICE_ACCOUNT_JSON — the service-account key JSON, base64-encoded
//   (single-line secret) or raw JSON. Grant that one service account access to
//   BOTH the GA4 property and the Search Console property.
//
// Returns null whenever the credential is absent/malformed — every caller treats
// that as "not configured" and no-ops gracefully.

import { createSign } from 'crypto';

interface ServiceAccount {
  client_email?: string;
  private_key?: string;
}

function decodeCredentials(): ServiceAccount | null {
  const raw = process.env.GA4_SERVICE_ACCOUNT_JSON || process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;
  try {
    const json = raw.trim().startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf-8');
    const creds = JSON.parse(json) as ServiceAccount;
    if (!creds.client_email || !creds.private_key) return null;
    return creds;
  } catch {
    return null;
  }
}

/** Is a usable Google service-account credential present? */
export function googleConfigured(): boolean {
  return decodeCredentials() !== null;
}

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const b64url = (s: string) => Buffer.from(s).toString('base64url');

/**
 * Mint an OAuth2 access token for the given scope via the service-account JWT
 * flow. Returns null when unconfigured or on any failure.
 */
export async function getGoogleAccessToken(scope: string): Promise<string | null> {
  const creds = decodeCredentials();
  if (!creds || !creds.private_key || !creds.client_email) return null;

  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = b64url(
    JSON.stringify({ iss: creds.client_email, scope, aud: TOKEN_URL, iat: now, exp: now + 3600 }),
  );
  const signingInput = `${header}.${claims}`;
  let jwt: string;
  try {
    const signature = createSign('RSA-SHA256').update(signingInput).sign(creds.private_key).toString('base64url');
    jwt = `${signingInput}.${signature}`;
  } catch {
    return null; // bad private key
  }

  try {
    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) {
      console.warn(`[google-auth] token exchange failed (${res.status})`);
      return null;
    }
    const json = (await res.json()) as { access_token?: string };
    return json.access_token ?? null;
  } catch (e) {
    console.warn(`[google-auth] token request error: ${e instanceof Error ? e.message : e}`);
    return null;
  }
}
