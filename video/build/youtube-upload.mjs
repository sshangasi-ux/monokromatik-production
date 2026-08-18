#!/usr/bin/env node
// Upload a rendered article video to YouTube, with metadata + citations pulled
// from the article (honours the cited-media rule). Optionally loops the watch
// URL back into the article's videoUrl.
//
//   YT_CLIENT_ID=.. YT_CLIENT_SECRET=.. YT_REFRESH_TOKEN=.. \
//   node build/youtube-upload.mjs --file out/xxx.mp4 --slug <slug> [--privacy unlisted] [--set-video-url]
import { createReadStream, readFileSync, writeFileSync } from 'node:fs';
import { google } from 'googleapis';

const args = Object.fromEntries(process.argv.slice(2).flatMap((a, i, arr) =>
  a.startsWith('--') ? [[a.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true]] : []));
const { file, slug } = args;
const privacy = args.privacy || 'unlisted';
if (!file || !slug) { console.error('usage: --file <mp4> --slug <slug> [--privacy unlisted|public|private] [--set-video-url]'); process.exit(1); }

const { YT_CLIENT_ID, YT_CLIENT_SECRET, YT_REFRESH_TOKEN } = process.env;
if (!YT_CLIENT_ID || !YT_CLIENT_SECRET || !YT_REFRESH_TOKEN) { console.error('Set YT_CLIENT_ID / YT_CLIENT_SECRET / YT_REFRESH_TOKEN (see docs/ops/youtube-upload-setup.md)'); process.exit(1); }

const REPO = new URL('../../', import.meta.url).pathname;
const artPath = `${REPO}data/articles.json`;
const A = JSON.parse(readFileSync(artPath, 'utf8'));
const a = A.find((x) => x.slug === slug);
if (!a) { console.error('article not found: ' + slug); process.exit(1); }

const articleUrl = `https://www.monokromatik.com/article/${a.slug}`;
const publishers = [...new Set((a.sources || []).map((s) => s.publisher))];
const description = [
  a.excerpt || '',
  '',
  `Full piece → ${articleUrl}`,
  '',
  publishers.length ? 'Sources: ' + publishers.join(' · ') : '',
  '',
  'MonoKromatik — African & diaspora brand intelligence.',
].filter((l) => l !== undefined).join('\n');

const oauth2 = new google.auth.OAuth2(YT_CLIENT_ID, YT_CLIENT_SECRET);
oauth2.setCredentials({ refresh_token: YT_REFRESH_TOKEN });
const youtube = google.youtube({ version: 'v3', auth: oauth2 });

console.log(`Uploading ${file} as "${a.title}" (${privacy})…`);
const res = await youtube.videos.insert({
  part: ['snippet', 'status'],
  requestBody: {
    snippet: {
      title: a.title.slice(0, 100),
      description: description.slice(0, 5000),
      tags: (a.tags || []).slice(0, 15),
      categoryId: a.category === 'sports' ? '17' : '22',
    },
    status: { privacyStatus: privacy, selfDeclaredMadeForKids: false },
  },
  media: { body: createReadStream(file) },
});

const id = res.data.id;
const watch = `https://www.youtube.com/watch?v=${id}`;
console.log(`\n✓ Uploaded: ${watch}  (${privacy})`);

if (args['set-video-url']) {
  a.videoUrl = `https://www.youtube.com/embed/${id}`;
  a.videoType = 'embed';
  a.videoCredit = 'MonoKromatik';
  writeFileSync(artPath, JSON.stringify(A, null, 2) + '\n');
  console.log(`✓ Wrote videoUrl into data/articles.json for ${slug} — commit via a PR.`);
}
