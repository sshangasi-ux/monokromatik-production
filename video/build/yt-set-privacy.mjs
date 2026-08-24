#!/usr/bin/env node
// Set a YouTube video's privacy (public|unlisted|private) via videos.update.
// Pure Node built-ins (no googleapis). Needs the `youtube` (manage) scope.
//   set -a; . ./.env; set +a
//   node build/yt-set-privacy.mjs --id VIDEO_ID --privacy public
import https from 'node:https';

const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, arr) => {
  if (v.startsWith('--')) a.push([v.slice(2), arr[i + 1]]); return a;
}, []));
const VIDEO_ID = args.id;
const PRIVACY = args.privacy || 'public';
const { YT_CLIENT_ID, YT_CLIENT_SECRET, YT_REFRESH_TOKEN } = process.env;
if (!VIDEO_ID) { console.error('Missing --id'); process.exit(1); }
if (!YT_CLIENT_ID || !YT_CLIENT_SECRET || !YT_REFRESH_TOKEN) { console.error('Missing YT_ env vars'); process.exit(1); }
if (!['public', 'unlisted', 'private'].includes(PRIVACY)) { console.error('--privacy must be public|unlisted|private'); process.exit(1); }

function req(method, url, headers, body) {
  return new Promise((resolve, reject) => {
    const r = https.request(url, { method, headers }, (res) => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject); if (body) r.write(body); r.end();
  });
}

async function accessToken() {
  const body = new URLSearchParams({
    client_id: YT_CLIENT_ID, client_secret: YT_CLIENT_SECRET,
    refresh_token: YT_REFRESH_TOKEN, grant_type: 'refresh_token',
  }).toString();
  const r = await req('POST', 'https://oauth2.googleapis.com/token',
    { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) }, body);
  const j = JSON.parse(r.body);
  if (!j.access_token) throw new Error('token refresh failed: ' + r.body);
  return j.access_token;
}

(async () => {
  const at = await accessToken();
  const auth = { Authorization: 'Bearer ' + at };

  // 1) read current snippet+status (so we preserve fields, and title for the log)
  const g = await req('GET',
    `https://youtube.googleapis.com/youtube/v3/videos?part=status,snippet&id=${VIDEO_ID}`, auth);
  const gj = JSON.parse(g.body);
  if (g.status !== 200 || !gj.items || !gj.items.length) {
    console.error('videos.list failed (' + g.status + '): ' + g.body); process.exit(2);
  }
  const item = gj.items[0];
  const title = item.snippet?.title || '(untitled)';
  const before = item.status?.privacyStatus;
  const status = { ...item.status, privacyStatus: PRIVACY };

  // 2) update status
  const payload = JSON.stringify({ id: VIDEO_ID, status });
  const u = await req('PUT',
    'https://youtube.googleapis.com/youtube/v3/videos?part=status',
    { ...auth, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }, payload);
  const uj = JSON.parse(u.body);
  if (u.status !== 200) { console.error('videos.update failed (' + u.status + '): ' + u.body); process.exit(3); }

  console.log('OK  "' + title + '"');
  console.log('    privacy: ' + before + ' -> ' + uj.status.privacyStatus);
  console.log('    https://www.youtube.com/watch?v=' + VIDEO_ID);
})().catch(e => { console.error('ERR ' + (e?.message || e)); process.exit(9); });
