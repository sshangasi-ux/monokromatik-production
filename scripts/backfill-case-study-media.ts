#!/usr/bin/env node
/**
 * Backfill credited, self-hosted hero media onto case studies that have none
 * (or whose media is broken). Uses the same reputable-first sourcer as the article
 * pipeline: it pulls the case study's OWN primary source page image (on-topic +
 * credited) and self-hosts it under public/article-media so it can't hotlink-rot;
 * falls back to credited stock only if the source has no usable image.
 *
 * Usage:
 *   npx tsx scripts/backfill-case-study-media.ts --dry        # report, no write
 *   npx tsx scripts/backfill-case-study-media.ts              # fill empty media
 *   npx tsx scripts/backfill-case-study-media.ts --force a,b  # also re-source a,b
 *
 * Requires network (+ PEXELS_API_KEY for the stock fallback).
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { sourceMedia } from '../lib/source-media';

const envPath = join(process.cwd(), '.env.local');
if (existsSync(envPath)) {
  readFileSync(envPath, 'utf-8').split('\n').forEach((line) => {
    const m = line.match(/^([^#=][^=]*)=(.+)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  });
}

const PATH = join(process.cwd(), 'data', 'case-studies.json');
const DRY = process.argv.includes('--dry');
const forceArg = process.argv.find((a) => a.startsWith('--force='))?.split('=')[1];
const FORCE = new Set((forceArg || '').split(',').map((s) => s.trim()).filter(Boolean));

// Map a case study to a stock-query category for the fallback (OG-from-source is
// primary; this only matters if the source page has no usable image).
function categoryFor(c: { tags?: string[]; collection?: string }): string {
  const t = [...(c.tags || []), c.collection || ''].join(' ').toLowerCase();
  if (/sport|football|olympic|athlet|nba|world cup/.test(t)) return 'sports';
  if (/music|afrobeat|amapiano|album|song|artist/.test(t)) return 'music';
  return 'culture';
}

async function main() {
  const studies = JSON.parse(readFileSync(PATH, 'utf-8'));
  let updated = 0;

  for (let i = 0; i < studies.length; i++) {
    const c = studies[i];
    const empty = !c.media || c.media.length === 0;
    if (!empty && !FORCE.has(c.slug)) continue;

    // Primary source: the first listed (canonically the official/primary one).
    const primary = (c.sources && c.sources[0]) || undefined;
    try {
      const media = await sourceMedia({
        sourceLink: primary?.href,
        sourceName: primary?.publisher,
        slug: `cs-${c.slug}`,
        title: c.title,
        excerpt: c.standfirst || '',
        category: categoryFor(c),
      });
      const entry = {
        src: media.image.url,
        alt: `${c.brand} — ${c.title}`.slice(0, 140),
        credit: media.image.credit,
        sourceLabel: primary?.publisher || media.image.provider,
        sourceHref: media.image.sourceUrl,
      };
      console.log(`[${i + 1}/${studies.length}] ${c.slug} → ${media.image.provider} (${media.image.credit}) ${media.image.url}`);
      if (!DRY) {
        studies[i] = { ...c, media: [entry] };
        updated++;
      }
    } catch (err) {
      console.warn(`[${i + 1}] ${c.slug} FAILED: ${(err as Error).message}`);
    }
  }

  if (!DRY && updated) {
    writeFileSync(PATH, JSON.stringify(studies, null, 2) + '\n');
    console.log(`\nUpdated ${updated} case study/studies.`);
  } else {
    console.log(`\n${DRY ? 'Dry run — no writes.' : 'No updates.'}`);
  }
}

main().catch((e) => {
  console.error('backfill failed:', e);
  process.exit(1);
});
