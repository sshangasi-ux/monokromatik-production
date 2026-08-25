#!/usr/bin/env node
// Upload a vertical Short public. usage:
//   node build/upload-short.mjs --file out/x-short.mp4 --title "..." --slug <article-slug> --tags "a,b,c"
import { google } from 'googleapis';
import fs from 'node:fs';
const a = Object.fromEntries(process.argv.slice(2).reduce((o, v, i, arr) => (v.startsWith('--') ? o.push([v.slice(2), arr[i + 1]]) : 0, o), []));
const o = new google.auth.OAuth2(process.env.YT_CLIENT_ID, process.env.YT_CLIENT_SECRET);
o.setCredentials({ refresh_token: process.env.YT_REFRESH_TOKEN });
const yt = google.youtube({ version: 'v3', auth: o });
const SITE = 'https://www.monokromatik.com';
const tags = (a.tags || '').split(',').map(s => s.trim()).filter(Boolean);
const hashtags = tags.map(t => '#' + t.replace(/[^A-Za-z0-9]/g, '')).join(' ');
const desc = `${a.title.replace(/ #Shorts$/, '')}\n\nMonoKromatik is African & diaspora brand intelligence — who owns, monetizes, and captures the value.\n\n▸ Full breakdown → ${SITE}/article/${a.slug}\n▸ Subscribe → ${SITE}\n\n${hashtags} #Shorts`;
const ins = await yt.videos.insert({ part: ['snippet', 'status'], requestBody: {
  snippet: { title: a.title, description: desc, tags: [...tags, 'shorts'], categoryId: '27', defaultLanguage: 'en' },
  status: { privacyStatus: 'public', selfDeclaredMadeForKids: false } },
  media: { body: fs.createReadStream(a.file) } });
console.log('✓ Short: https://www.youtube.com/watch?v=' + ins.data.id);
