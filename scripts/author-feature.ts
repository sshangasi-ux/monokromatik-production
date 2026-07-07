#!/usr/bin/env node
/**
 * Author a flagship FEATURE (the depth tier) credit-free. When the AI pipeline
 * is unavailable, a human (or an in-session agent) researches deeply and writes
 * a long-form feature to a JSON file; this validates the depth floor + sourcing
 * and appends it to data/articles.json marked format:'feature', for a review PR.
 *
 *   npm run feature:author -- --file scratchpad/feature.json --dry
 *   npm run feature:author -- --file scratchpad/feature.json
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import type { Article } from '../lib/articles';

const ARTICLES_PATH = join(process.cwd(), 'data', 'articles.json');
const DRY = process.argv.includes('--dry');
const fileArg = process.argv.find((a) => a.startsWith('--file='))?.split('=')[1]
  ?? (process.argv.includes('--file') ? process.argv[process.argv.indexOf('--file') + 1] : '');
const FLOOR = 1800;

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 90);
const words = (s: string) => (s || '').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
const links = (s: string) => (s.match(/\]\((https?:\/\/[^)]+)\)/g) || []).length;

interface FeatureDraft {
  title: string; content: string; excerpt: string; category: string; tags: string[];
  sourceLink: string; sourceName: string;
  imageUrl?: string; imageCredit?: string; imageSourceUrl?: string;
  videoUrl?: string; videoType?: 'embed' | 'file'; videoCredit?: string; videoSourceUrl?: string;
}

function main() {
  if (!fileArg) { console.error('Provide --file <feature.json>'); process.exit(1); }
  const drafts = JSON.parse(readFileSync(fileArg, 'utf-8')) as FeatureDraft[];
  const existing = JSON.parse(readFileSync(ARTICLES_PATH, 'utf-8')) as Article[];
  const slugs = new Set(existing.map((a) => a.slug));
  const stamp = new Date().toISOString();

  console.log(`# Author feature · ${drafts.length} draft(s)${DRY ? ' · DRY RUN' : ''}\n${existing.length} articles already.\n`);

  const staged: Article[] = [];
  for (const d of drafts) {
    const w = words(d.content), l = links(d.content), slug = slugify(d.title);
    const reasons: string[] = [];
    if (!d.title) reasons.push('missing title');
    if (w < FLOOR) reasons.push(`content is ${w}w (< ${FLOOR} flagship floor)`);
    if (l < 3) reasons.push(`only ${l} inline source links (need >=3)`);
    if (!d.excerpt) reasons.push('missing excerpt');
    if (!d.sourceLink || !d.sourceName) reasons.push('missing primary source');
    if (slugs.has(slug)) reasons.push(`slug already exists: ${slug}`);
    if (reasons.length) { console.log(`  ❌ ${d.title || '(untitled)'} — ${reasons.join('; ')}`); continue; }

    slugs.add(slug);
    staged.push({
      title: d.title, slug, content: d.content, excerpt: d.excerpt,
      category: d.category, tags: d.tags ?? [], format: 'feature',
      imageUrl: d.imageUrl, imageCredit: d.imageCredit, imageSourceUrl: d.imageSourceUrl,
      videoUrl: d.videoUrl, videoType: d.videoType, videoCredit: d.videoCredit, videoSourceUrl: d.videoSourceUrl,
      sourceLink: d.sourceLink, sourceName: d.sourceName, publishedAt: stamp,
    });
    console.log(`  ✅ ${d.title} — ${w} words · ${l} sources · FEATURE`);
  }

  if (!staged.length) { console.log('\nNothing valid to stage.'); return; }
  if (DRY) { console.log(`\n(DRY RUN — ${staged.length} would be staged; data unchanged.)`); return; }
  writeFileSync(ARTICLES_PATH, JSON.stringify([...existing, ...staged], null, 2) + '\n');
  console.log(`\n✅ Appended ${staged.length} feature(s) to data/articles.json (now ${existing.length + staged.length}).`);
}

main();
