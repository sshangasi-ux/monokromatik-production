#!/usr/bin/env node
// Loopback OAuth to grant READ access to GA4 (Data API) + Search Console.
// Reuses the same Google Desktop OAuth client as the YouTube tooling
// (YT_CLIENT_ID / YT_CLIENT_SECRET in video/.env). Writes GA_REFRESH_TOKEN
// into video/.env. Pure Node built-ins (no googleapis) for a robust flow.
//   set -a; . ./.env; set +a; node build/ga-auth.mjs
// Requires these APIs enabled in the same GCP project:
//   - Google Analytics Data API
//   - Google Search Console API
import http from 'node:http';
import https from 'node:https';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const { YT_CLIENT_ID: CID, YT_CLIENT_SECRET: SEC } = process.env;
if (!CID || !SEC) { console.error('Set YT_CLIENT_ID and YT_CLIENT_SECRET (reused from the YouTube client)'); process.exit(1); }

const ENV_PATH = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '.env');
const DONE = '/tmp/ga_auth_done.txt';
const PORT = 53682;
const REDIRECT = `http://localhost:${PORT}`;
const SCOPES = [
  'https://www.googleapis.com/auth/analytics.readonly',
  'https://www.googleapis.com/auth/webmasters.readonly',
];

const authUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams({
  client_id: CID, redirect_uri: REDIRECT, response_type: 'code',
  scope: SCOPES.join(' '), access_type: 'offline', prompt: 'consent', include_granted_scopes: 'true',
}).toString();

function exchange(code) {
  const body = new URLSearchParams({ code, client_id: CID, client_secret: SEC, redirect_uri: REDIRECT, grant_type: 'authorization_code' }).toString();
  return new Promise((resolve, reject) => {
    const req = https.request('https://oauth2.googleapis.com/token', { method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) } },
      (res) => { let d = ''; res.on('data', c => d += c); res.on('end', () => { try { resolve(JSON.parse(d)); } catch { reject(new Error(d)); } }); });
    req.on('error', reject); req.write(body); req.end();
  });
}
function patchEnv(tok) {
  let txt = ''; try { txt = readFileSync(ENV_PATH, 'utf8'); } catch {}
  const line = `GA_REFRESH_TOKEN=${tok}`;
  txt = /^GA_REFRESH_TOKEN=.*$/m.test(txt) ? txt.replace(/^GA_REFRESH_TOKEN=.*$/m, line) : txt.replace(/\n?$/, '\n') + line + '\n';
  writeFileSync(ENV_PATH, txt);
}

const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, REDIRECT);
  const code = u.searchParams.get('code'); const err = u.searchParams.get('error');
  if (err) { res.end('Auth error: ' + err); console.error('AUTH_ERROR=' + err); return; }
  if (!code) { res.statusCode = 204; res.end(); return; }
  res.setHeader('Content-Type', 'text/html');
  res.end('<h2>Analytics access granted ✓</h2><p>You can close this tab and return to Claude.</p>');
  server.close();
  try {
    const t = await exchange(code);
    if (t.error) { console.error('TOKEN_ERROR=' + t.error + ' ' + (t.error_description || '')); process.exit(3); }
    if (!t.refresh_token) { console.error('NO_REFRESH_TOKEN'); process.exit(2); }
    patchEnv(t.refresh_token);
    writeFileSync(DONE, 'ok\n');
    console.log('=== SUCCESS ===');
    console.log('SCOPES_GRANTED=' + (t.scope || '(unknown)'));
    console.log('GA_REFRESH_TOKEN written to video/.env');
    process.exit(0);
  } catch (e) { console.error('EXCHANGE_FAILED=' + (e?.message || e)); process.exit(4); }
});
server.on('error', (e) => { console.error('SERVER_ERROR=' + e.message); process.exit(5); });
server.listen(PORT, () => { console.log('AUTH_URL=' + authUrl); console.log('Listening on ' + REDIRECT); });
