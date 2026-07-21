#!/usr/bin/env node
/**
 * Generates the pre-publication notification pack for every rated work.
 *
 * Edition 01 offers every rated brand a right of reply BEFORE publication. That
 * is already published policy on the methodology page ("If you are a rated brand,
 * you can respond"), so this makes good on a commitment rather than inventing one.
 * It is also the single strongest credibility act available to a small independent
 * index — and basic fairness, given some works are rated at AUTHORSHIP 1.
 *
 * Writes output/brand-notifications.{json,csv} for mail-merge. It SENDS NOTHING —
 * the operator sends, reviews replies, and decides. See
 * docs/collateral/brand-notification-edition-01.md for the copy and the policy.
 *
 *   npm run notify:brands
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { scoredWorks, EDITION } from '../lib/edition-01';
import { signalBand } from '../lib/signal-index';
import { getCaseStudyBySlug } from '../lib/case-studies';

const SITE = 'https://www.monokromatik.com';
const works = scoredWorks();

const rows = works.map((w) => {
  const study = getCaseStudyBySlug(w.slug);
  const band = signalBand(w.score);
  const axisLine = (['IDEA', 'AUTHORSHIP', 'EXECUTION', 'CONSEQUENCE'] as const)
    .map((a) => `${a} ${w.levels[a]}/5`)
    .join(' · ');
  return {
    brand: w.brand,
    workTitle: w.title,
    slug: w.slug,
    url: `${SITE}/intelligence/case-studies/${w.slug}`,
    score: w.score,
    band: band?.band ?? '',
    bandLabel: band?.label ?? '',
    axisLine,
    idea: w.levels.IDEA,
    authorship: w.levels.AUTHORSHIP,
    execution: w.levels.EXECUTION,
    consequence: w.levels.CONSEQUENCE,
    /** The published note for each axis — the brand should see our reasoning, not just a number. */
    notes: (study?.decode ?? []).map((d) => `${d.label}: ${d.note}`),
    sources: (study?.sources ?? []).length,
    verification: w.verification,
    /** Flags the notifications that need the operator's closest attention. */
    sensitive: w.levels.AUTHORSHIP <= 2,
    rubric: EDITION.rubric,
    edition: EDITION.number,
  };
});

const sensitive = rows.filter((r) => r.sensitive);

mkdirSync(join(process.cwd(), 'output'), { recursive: true });
writeFileSync(
  join(process.cwd(), 'output/brand-notifications.json'),
  JSON.stringify({ generatedAt: new Date().toISOString(), edition: EDITION, count: rows.length, rows }, null, 2),
);

const esc = (v: unknown) => `"${String(v).replace(/"/g, '""')}"`;
const cols = ['brand', 'workTitle', 'url', 'score', 'band', 'axisLine', 'verification', 'sources', 'sensitive'] as const;
const csv = [
  cols.join(','),
  ...rows.map((r) => cols.map((c) => esc(r[c])).join(',')),
].join('\n');
writeFileSync(join(process.cwd(), 'output/brand-notifications.csv'), csv + '\n');

console.log(`Notification pack — Edition ${EDITION.number}, rubric ${EDITION.rubric}`);
console.log(`  ${rows.length} works across ${new Set(rows.map((r) => r.brand)).size} brands`);
console.log(`  ${sensitive.length} flagged sensitive (AUTHORSHIP ≤ 2) — read these before sending:`);
for (const r of sensitive) console.log(`    ${r.band.padEnd(4)} ${String(r.score).padStart(3)}  ${r.brand}`);
console.log('\nWrote output/brand-notifications.json + .csv');
console.log('This script sends nothing. See docs/collateral/brand-notification-edition-01.md');
