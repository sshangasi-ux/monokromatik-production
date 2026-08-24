#!/usr/bin/env node
// Re-auth with the broader `youtube` (manage) scope so the pipeline can set
// video privacy / update videos (videos.update), not just upload.
// Pure Node built-ins only (no googleapis) — robust on slow module loads.
//   set -a; . ./.env; set +a; node build/youtube-reauth.mjs
// Prints a consent URL; approve as the channel owner on the SAME machine.
// On success it rewrites YT_REFRESH_TOKEN in video/.env in place.
import http from 'node:http';
import https from 'node:https';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const { YT_CLIENT_ID, YT_CLIENT_SECRET } = process.env;
if (!YT_CLIENT_ID || !YT_CLIENT_SECRET) { console.error('Set YT_CLIENT_ID and YT_CLIENT_SECRET'); process.exit(1); }

const ENV_PATH = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '.env');
const DONE = '/tmp/yt_reauth_done.txt';
const PORT = 53682;
const REDIRECT = `http://localhost:${PORT}`;
const SCOPES = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube',
  'https://www.googleapis.com/auth/youtube.readonly',
];

const authUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams({
  client_id: YT_CLIENT_ID,
  redirect_uri: REDIRECT,
  response_type: 'code',
  scope: SCOPES.join(' '),
  access_type: 'offline',
  prompt: 'consent',
  include_granted_scopes: 'true',
}).toString();

function exchange(code) {
  const body = new URLSearchParams({
    code, client_id: YT_CLIENT_ID, client_secret: YT_CLIENT_SECRET,
    redirect_uri: REDIRECT, grant_type: 'authorization_code',
  }).toString();
  return new Promise((resolve, reject) => {
    const req = https.request('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) },
    }, (res) => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch (e) { reject(new Error(d)); } });
    });
    req.on('error', reject); req.write(body); req.end();
  });
}

function patchEnv(refreshToken) {
  let txt = ''; try { txt = readFileSync(ENV_PATH, 'utf8'); } catch {}
  const line = `YT_REFRESH_TOKEN=${refreshToken}`;
  if (/^YT_REFRESH_TOKEN=.*$/m.test(txt)) txt = txt.replace(/^YT_REFRESH_TOKEN=.*$/m, line);
  else txt = txt.replace(/\n?$/, '\n') + line + '\n';
  writeFileSync(ENV_PATH, txt);
}

const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, REDIRECT);
  const code = u.searchParams.get('code');
  const err = u.searchParams.get('error');
  if (err) { res.end('Auth error: ' + err); console.error('AUTH_ERROR=' + err); return; }
  if (!code) { res.statusCode = 204; res.end(); return; }
  res.setHeader('Content-Type', 'text/html');
  res.end('<h2>Authorized ✓</h2><p>You can close this tab and return to Claude.</p>');
  server.close();
  try {
    const t = await exchange(code);
    if (t.error) { console.error('TOKEN_ERROR=' + t.error + ' ' + (t.error_description || '')); process.exit(3); }
    if (!t.refresh_token) { console.error('NO_REFRESH_TOKEN'); process.exit(2); }
    patchEnv(t.refresh_token);
    writeFileSync(DONE, 'ok ' + new Date().toISOString() + '\n');
    console.log('=== SUCCESS ===');
    console.log('SCOPES_GRANTED=' + (t.scope || '(unknown)'));
    console.log('YT_REFRESH_TOKEN written to video/.env');
    process.exit(0);
  } catch (e) { console.error('EXCHANGE_FAILED=' + (e?.message || e)); process.exit(4); }
});
server.on('error', (e) => { console.error('SERVER_ERROR=' + e.message); process.exit(5); });
server.listen(PORT, () => {
  console.log('AUTH_URL=' + authUrl);
  console.log('Listening on ' + REDIRECT + ' for the OAuth callback...');
});
