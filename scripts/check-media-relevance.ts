#!/usr/bin/env node
/**
 * Media relevance guard — the thing that keeps imagery specific and true to the
 * topic as content grows.
 *
 * The sourcing script (refresh-images.ts) already PREFERS topical imagery: it
 * hotlinks from each piece's own source article and scores candidates against
 * the title. But a preference is not a guarantee. This is the gate. It exists so
 * that generic stock imagery, or an image nobody can trace to the topic, cannot
 * ship silently — now or in any future edition.
 *
 * Three failure classes, in descending certainty:
 *
 *   STOCK  — the image is from a stock-photo library. Generic by definition.
 *            Pexels, Unsplash, Shutterstock and the like exist to be reused
 *            across unrelated topics; that is the opposite of what we want.
 *            Hard fail, no exceptions.
 *
 *   ORPHAN — an image with no provenance: no credit and no source URL, and not
 *            a token-anchored owned asset. We cannot establish it is about the
 *            topic, so we do not publish it as though it were.
 *
 *   REUSE  — the same image on more than one piece. The single strongest signal
 *            that an image is generic filler rather than specific to a story.
 *
 * And one warning class:
 *
 *   OPAQUE — an owned asset whose filename carries no topic token (e.g. a CMS
 *            number). It has provenance, so it is probably fine, but a human
 *            should confirm it is the right picture. Warned, not failed.
 *
 * Exit 1 on any failure (not warnings), so CI blocks a merge that would ship
 * untraceable or generic imagery.
 *
 *   npm run media:relevance
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const load = (f: string) => JSON.parse(readFileSync(join(process.cwd(), 'data', f), 'utf8'));

// Stock-photo and generic-illustration hosts. If any appears in the URL or the
// saved filename, the image is generic by construction.
const STOCK = [
  'pexels', 'unsplash', 'shutterstock', 'istockphoto', 'istock', 'gettyimages/generic',
  'pixabay', 'freepik', '123rf', 'dreamstime', 'depositphotos', 'stock.adobe', 'canva',
  'placeholder', 'placehold', 'lorempixel', 'picsum',
];

const STOP = new Set([
  'the', 'and', 'for', 'with', 'from', 'that', 'this', 'just', 'africa', 'african',
  'new', 'how', 'who', 'why', 'are', 'was', 'his', 'her', 'has', 'you', 'our',
  '2026', '2025', '2024', 'jpg', 'jpeg', 'webp', 'png', 'image', 'photo', 'img',
]);
const toks = (s: string): string[] =>
  String(s || '').toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 3 && !STOP.has(w));

interface Media {
  src: string;
  credit?: string;
  sourceUrl?: string;
  alt?: string;
  /** slug/title/brand/tags of the owning piece, joined — the topic. */
  topic: string;
  where: string; // "article:slug" etc — for the report
}

const failures: string[] = [];
const warnings: string[] = [];

const filenameOf = (url: string) => (url.split('/').pop() || '').split('?')[0];
const isOwned = (url: string) => url.startsWith('/');
const isStock = (url: string) => STOCK.some((h) => url.toLowerCase().includes(h));

// Reuse detection across every piece. We keep each user's topic tokens so we can
// tell legitimate reuse (an article and its companion case study on the SAME
// subject sharing the definitive image) from generic filler (the same image on
// unrelated stories). The former is exactly what we want; the latter is the tell.
const bySrc = new Map<string, { where: string; topic: Set<string> }[]>();

function check(m: Media) {
  const { src, where } = m;
  if (!src) return;
  bySrc.set(src, [...(bySrc.get(src) ?? []), { where, topic: new Set(toks(m.topic)) }]);

  // STOCK — hard fail.
  if (isStock(src)) {
    failures.push(`STOCK   ${where} — ${filenameOf(src)} is from a stock library. Generic by definition; re-source from the story's own reporting.`);
    return;
  }

  const hasProvenance = Boolean((m.credit && m.credit.trim()) || (m.sourceUrl && m.sourceUrl.trim()));
  const file = filenameOf(src);
  const topicTokens = new Set(toks(m.topic));
  const anchored =
    toks(file).some((t) => topicTokens.has(t)) ||
    [...topicTokens].some((t) => file.toLowerCase().includes(t)) ||
    toks(m.alt ?? '').some((t) => topicTokens.has(t));

  // ORPHAN — no provenance and not anchored to the topic.
  if (!hasProvenance && !anchored) {
    failures.push(`ORPHAN  ${where} — ${file} has no credit, no source URL, and no topic anchor. Cannot establish it is about the story.`);
    return;
  }

  // OPAQUE — has provenance but the filename tells us nothing. Probably fine, check it.
  if (!anchored && isOwned(src)) {
    warnings.push(`OPAQUE  ${where} — ${file} carries provenance but no topic token in the filename. Confirm it is the right picture.`);
  }
}

// ---- Articles ----
const articles = load('articles.json') as Record<string, unknown>[];
for (const a of articles) {
  const url = a.imageUrl as string | undefined;
  if (!url) continue; // no image is a valid editorial choice (we won't fake one)
  check({
    src: url,
    credit: a.imageCredit as string,
    sourceUrl: a.imageSourceUrl as string,
    topic: [a.slug, a.title, ...((a.tags as string[]) ?? [])].join(' '),
    where: `article:${a.slug}`,
  });
}

// ---- Case studies ----
const caseStudies = load('case-studies.json') as Record<string, unknown>[];
for (const c of caseStudies) {
  const media = (c.media as Record<string, unknown>[]) ?? [];
  media.forEach((m, i) => {
    check({
      src: m.src as string,
      credit: m.credit as string,
      sourceUrl: m.sourceHref as string,
      alt: m.alt as string,
      topic: [c.slug, c.title, c.brand, ...((c.tags as string[]) ?? [])].join(' '),
      where: `case-study:${c.slug}[${i}]`,
    });
  });
}

// ---- Reuse across pieces ----
// Reuse is only a problem when the sharing pieces are about DIFFERENT subjects.
// An article and its companion case study on the same event sharing the
// definitive image is correct, not generic — so we only flag reuse where the
// users share no meaningful topic token.
for (const [src, users] of bySrc) {
  const uniqWhere = [...new Set(users.map((u) => u.where))];
  if (uniqWhere.length < 2) continue;
  const common = users.reduce<Set<string> | null>((acc, u) => {
    if (acc === null) return new Set(u.topic);
    return new Set([...acc].filter((t) => u.topic.has(t)));
  }, null);
  const related = (common?.size ?? 0) > 0;
  if (!related) {
    failures.push(`REUSE   ${filenameOf(src)} appears on ${uniqWhere.length} UNRELATED pieces (${uniqWhere.slice(0, 3).join(', ')}…). Generic filler — one image, one story.`);
  }
}

// ---- Report ----
const total = articles.filter((a) => a.imageUrl).length + caseStudies.reduce((n, c) => n + ((c.media as unknown[]) ?? []).length, 0);
console.log(`Media relevance — ${total} images checked.\n`);

if (failures.length) {
  console.log(`🔴 ${failures.length} failure(s) — generic or untraceable imagery:`);
  for (const f of failures) console.log('  ' + f);
  console.log('');
}
if (warnings.length) {
  console.log(`🟡 ${warnings.length} warning(s) — provenance ok, relevance unconfirmed:`);
  for (const w of warnings) console.log('  ' + w);
  console.log('');
}
if (!failures.length && !warnings.length) console.log('✅ Every image is traceable and topic-anchored.');
else if (!failures.length) console.log('✅ No generic or untraceable imagery. Warnings are advisory.');

mkdirSync(join(process.cwd(), 'output'), { recursive: true });
writeFileSync(
  join(process.cwd(), 'output/media-relevance.json'),
  JSON.stringify({ generatedAt: new Date().toISOString(), checked: total, failures, warnings }, null, 2),
);

if (failures.length && process.env.MEDIA_STRICT !== 'false') process.exit(1);
