#!/usr/bin/env node
// Weekly long-format selector — picks the week's leading, video-ready article and
// prints the one-command pipeline to turn it into a horizontal (-h) YouTube
// explainer. "Video-ready" honours the standing rule (memory: video-pipeline):
// the piece must carry verified sources[] and a numbers module, so every on-screen
// figure can cite its source. Illustrative visuals only; Bram VO; locked style.
//
//   node build/weekly-flagship.mjs            # last 7 days
//   node build/weekly-flagship.mjs 14         # widen the window to N days
//
// Selection today is recency + depth (most recent feature with sources + numbers).
// Upgrade path: swap the ranking for a GA/GSC read (build/ga-report.mjs) to pick
// the *best-performing* article of the week instead of the most recent.

import { readFileSync } from 'fs';

const days = Number(process.argv[2] || 7);
const REPO = new URL('../../', import.meta.url).pathname;
const arts = JSON.parse(readFileSync(`${REPO}data/articles.json`, 'utf8'));

const hasNumbers = (a) => (a.modules || []).some((m) => m.type === 'numbers');
const ready = (a) =>
  a.format === 'feature' && Array.isArray(a.sources) && a.sources.length >= 3 && hasNumbers(a);

const since = Date.now() - days * 86400_000;
const candidates = arts
  .filter(ready)
  .filter((a) => new Date(a.publishedAt).getTime() >= since)
  .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

if (candidates.length === 0) {
  console.log(`No video-ready feature published in the last ${days} days.`);
  console.log('Widen the window:  node build/weekly-flagship.mjs 14');
  process.exit(0);
}

const lead = candidates[0];
console.log(`\n★ THIS WEEK'S FLAGSHIP  (${candidates.length} video-ready in last ${days}d)\n`);
console.log(`  ${lead.title}`);
console.log(`  slug:    ${lead.slug}`);
console.log(`  sources: ${lead.sources.length}   stats: ${(lead.modules.find((m) => m.type === 'numbers').items || []).length}   published: ${lead.publishedAt.slice(0, 10)}\n`);

if (candidates.length > 1) {
  console.log('  runners-up:');
  for (const c of candidates.slice(1, 4)) console.log(`   · ${c.slug}`);
  console.log('');
}

console.log('  BUILD THE LONG-FORM (-h) EXPLAINER:');
console.log(`   1. node build/scene-data-from-article.mjs ${lead.slug}`);
console.log('   2. generate the scene visuals via the Higgsfield connector (image + clip per scene)  [credits]');
console.log('   3. node build/gen-audio.mjs                 # Bram VO');
console.log('   4. npm run render:h                          # -> out/explainer-h.mp4');
console.log(`   5. node build/youtube-upload.mjs ${lead.slug}   # upload + citations   [YouTube auth]`);
console.log('   6. set the article\'s videoUrl to the new embed  -> it appears on /watch\n');
