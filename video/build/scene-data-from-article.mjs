#!/usr/bin/env node
// Generalizer: turn ANY enriched article into video scene-data (VO + image prompt
// + on-screen overlay), pulling facts + citations ONLY from the article's verified
// sources[] and numbers module. This is the "one command per piece" front end;
// the Higgsfield generations + Remotion assembly consume its output.
//
//   node build/scene-data-from-article.mjs <slug>
//   → writes build/generated/<slug>.scenes.json
//
// Honors the standing rule (memory: video-pipeline): factual + cited, illustrative
// visuals only (no fake faces), every figure carries its source.

import { readFileSync, writeFileSync, mkdirSync } from 'fs';

const slug = process.argv[2];
if (!slug) { console.error('usage: scene-data-from-article.mjs <slug>'); process.exit(1); }

const REPO = new URL('../../', import.meta.url).pathname; // repo root (video/ is under it)
const A = JSON.parse(readFileSync(`${REPO}data/articles.json`, 'utf8'));
const a = A.find((x) => x.slug === slug);
if (!a) { console.error(`article not found: ${slug}`); process.exit(1); }

const STYLE = 'Editorial Motion Graphics collage style, torn-paper and halftone newsprint textures, high-contrast near-black background with a single burnt-amber accent, cinematic depth and dramatic light, no text, no watermark, no real recognizable faces.';

const sources = a.sources || [];
const srcName = (n) => (n && sources[n - 1] ? sources[n - 1].publisher : undefined);
const numbers = (a.modules || []).find((m) => m.type === 'numbers');
const nums = (numbers?.items || []).slice(0, 5); // up to 5 stat scenes
const pull = a.brandRead?.pullQuote
  || (a.brandRead?.takeaways || []).map((t) => (typeof t === 'string' ? t : t.insight)).find(Boolean)
  || '';
const firstHookSentences = (a.linkedinHook || a.excerpt || '').split(/(?<=[.!?])\s+/).slice(0, 2).join(' ');

// keyword → an illustrative (never literal-person) image subject
const imgFor = (label) => {
  const t = (label || '').toLowerCase();
  if (/tv|broadcast|rights|stream|media/.test(t)) return 'a broadcast satellite dish and stacked glowing screens with cascading banknotes';
  if (/viewer|fan|audience|watch/.test(t)) return 'a hall of anonymous silhouetted viewers watching glowing screens';
  if (/player|talent|squad|team/.test(t)) return 'a grid of abstract cut-paper jerseys and boots, no faces';
  if (/deal|sponsor|shirt|brand|revenue|ipo|market|\$|£|bn|m\b/.test(t)) return 'stacked banknotes, coins and a rising bar chart in torn paper';
  if (/africa|continent|diaspora|nation/.test(t)) return 'a torn-paper map of the African continent with amber accents';
  return 'an abstract editorial collage of charts, banknotes and torn paper';
};

const scenes = [];
// 1 — title
scenes.push({ id: 1, kind: 'title',
  vo: firstHookSentences || a.title,
  imgPrompt: `A dramatic editorial establishing collage illustrating: ${a.title}. ${STYLE}`,
  overlay: { kicker: 'MONOKROMATIK · BRAND INTELLIGENCE', title: a.title } });
// 2..n — stats from the numbers module (each cited)
nums.forEach((it, i) => {
  scenes.push({ id: scenes.length + 1, kind: 'stat', accent: i === nums.length - 1,
    vo: `${it.label}. ${it.value}.`,
    imgPrompt: `Editorial motion-graphics collage of ${imgFor(it.label)}. ${STYLE}`,
    overlay: { value: it.value, label: it.label, source: srcName(it.source) } });
});
// pull line
if (pull) scenes.push({ id: scenes.length + 1, kind: 'pull',
  vo: pull, imgPrompt: `A minimalist bold editorial composition, oversized amber quotation marks on a dark field. ${STYLE}`,
  overlay: { line: pull.length > 90 ? pull.slice(0, 88) + '…' : pull } });
// sources + CTA
scenes.push({ id: scenes.length + 1, kind: 'sources',
  vo: 'Every figure here is sourced. The full breakdown is on MonoKromatik.',
  imgPrompt: `A clean editorial sources pinboard of blank cards with an amber accent bar. ${STYLE}`,
  overlay: { line: 'Every figure, sourced.', items: [...new Set(sources.map((s) => s.publisher))].slice(0, 6), url: 'monokromatik.com' } });

mkdirSync(new URL('./generated/', import.meta.url).pathname, { recursive: true });
const out = new URL(`./generated/${slug}.scenes.json`, import.meta.url).pathname;
writeFileSync(out, JSON.stringify({ slug, title: a.title, scenes }, null, 2) + '\n');
console.log(`✓ ${scenes.length} scenes → build/generated/${slug}.scenes.json`);
console.log(`  VO lines:`); scenes.forEach((s) => console.log(`   ${s.id}. [${s.kind}] ${s.vo.slice(0, 80)}`));
