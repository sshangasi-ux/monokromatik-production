#!/usr/bin/env node
// One-time: get a YouTube refresh token via a loopback OAuth flow.
//   YT_CLIENT_ID=... YT_CLIENT_SECRET=... node build/youtube-auth.mjs
// Opens a consent URL; approve as the channel owner; it prints YT_REFRESH_TOKEN.
import http from 'node:http';
import { google } from 'googleapis';

const { YT_CLIENT_ID, YT_CLIENT_SECRET } = process.env;
if (!YT_CLIENT_ID || !YT_CLIENT_SECRET) { console.error('Set YT_CLIENT_ID and YT_CLIENT_SECRET'); process.exit(1); }

const PORT = 53682;
const redirect = `http://localhost:${PORT}`;
const oauth2 = new google.auth.OAuth2(YT_CLIENT_ID, YT_CLIENT_SECRET, redirect);
const url = oauth2.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: ['https://www.googleapis.com/auth/youtube.upload', 'https://www.googleapis.com/auth/youtube.readonly'],
});

const server = http.createServer(async (req, res) => {
  const code = new URL(req.url, redirect).searchParams.get('code');
  if (!code) { res.end('No code.'); return; }
  res.end('Authorized — you can close this tab and return to the terminal.');
  server.close();
  const { tokens } = await oauth2.getToken(code);
  console.log('\n=== SUCCESS ===');
  console.log('YT_REFRESH_TOKEN=' + tokens.refresh_token);
  console.log('\nAdd that to your video/.env (with YT_CLIENT_ID / YT_CLIENT_SECRET). Keep it secret.');
  process.exit(0);
});
server.listen(PORT, () => {
  console.log('Open this URL, approve as the channel owner:\n\n' + url + '\n');
});
