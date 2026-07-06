#!/usr/bin/env node
/**
 * Case-study cycle — the content engine feeding the Cultural-Signal Index.
 * Drafts N schema-complete, web-grounded case studies (fail-closed validation),
 * dedup'd against the brands already scored, and appends the valid ones to
 * data/case-studies.json. The workflow opens a review PR — merging it is the
 * analyst's sign-off (the model drafts; the human reviews and signs the scores).
 *
 *   npm run casestudy:cycle -- --count=3          # draft + stage 3 for review
 *   npm run casestudy:cycle -- --count=2 --dry    # draft + print, write nothing
 *
 * No-op-safe: with no ANTHROPIC_API_KEY it exits cleanly having staged nothing.
 */

import { readFileSync, writeFileSync, mkdirSync, appendFileSync, existsSync } from 'fs';
import { join } from 'path';
import { draftCaseStudy } from '../lib/draft-case-study';
import type { CaseStudy } from '../lib/case-studies';

const CASE_STUDIES_PATH = join(process.cwd(), 'data', 'case-studies.json');
const SUMMARY_DIR = join(process.cwd(), 'output', 'case-study-cycle');
const SUMMARY_PATH = join(SUMMARY_DIR, 'STAGED.md');

const arg = (name: string, def: number): number => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  const n = hit ? parseInt(hit.split('=')[1], 10) : NaN;
  return Number.isFinite(n) ? n : def;
};
const DRY = process.argv.includes('--dry');
const COUNT = Math.max(1, Math.min(10, arg('count', 3)));
const SEARCHES = Math.max(1, Math.min(10, arg('searches', 6)));

const tierOf = (s: number) => (s >= 75 ? 'Strong' : s >= 45 ? 'Moderate' : 'Developing');

async function main() {
  const out: string[] = [];
  const log = (s: string) => { console.log(s); out.push(s); };

  const existing = JSON.parse(readFileSync(CASE_STUDIES_PATH, 'utf-8')) as CaseStudy[];
  const avoidBrands = [...new Set(existing.map((c) => c.brand).filter(Boolean))];
  log(`# Case-study cycle · target ${COUNT}${DRY ? ' · DRY RUN' : ''}`);
  log(`\n${existing.length} case studies already on the Index across ${avoidBrands.length} brands.\n`);

  const stamp = new Date().toISOString();
  const staged: CaseStudy[] = [];
  const rows: string[] = [];
  const maxAttempts = COUNT * 2; // bounded — never loop-and-burn the API
  let attempts = 0;

  while (staged.length < COUNT && attempts < maxAttempts) {
    attempts++;
    const res = await draftCaseStudy({ avoidBrands, stamp, maxSearches: SEARCHES });
    if (!res.ok || !res.caseStudy) {
      log(`  · attempt ${attempts}: rejected — ${res.reasons.join('; ') || 'no draft'}`);
      if (res.reasons.includes('ANTHROPIC_API_KEY not set')) break;
      continue;
    }
    const cs = res.caseStudy;
    staged.push(cs);
    avoidBrands.push(cs.brand); // don't draft the same brand twice this run
    const evTier = tierOf(res.evidenceScore ?? 0);
    rows.push(`| ${cs.brand} | ${res.score} | ${res.evidenceScore} (${evTier}) | ${cs.sources.length} | ${cs.evidence.confirmed.length}c/${cs.evidence.reported.length}r |`);
    log(`  ✅ ${cs.brand} — signal ${res.score}/100 · evidence ${res.evidenceScore} (${evTier}) · ${cs.sources.length} sources`);
  }

  if (staged.length === 0) {
    log('\nNothing staged this run (no valid drafts). The Index is unchanged.');
    flush(out.join('\n'));
    return;
  }

  log(`\n## Staged ${staged.length} for review\n`);
  log('| Brand | Signal | Evidence | Sources | Evidence ledger |');
  log('|---|---|---|---|---|');
  rows.forEach((r) => log(r));
  log('\n**Verification is `partial` on every draft** — the analyst upgrades to `verified` on review after checking the sources (which is what climbs its Evidence Strength). Merging this PR signs the scores into the Index.');

  if (DRY) {
    log('\n(DRY RUN — data/case-studies.json unchanged.)');
    console.log('\n----- drafts -----\n' + JSON.stringify(staged, null, 2));
    flush(out.join('\n'));
    return;
  }

  writeFileSync(CASE_STUDIES_PATH, JSON.stringify([...existing, ...staged], null, 2) + '\n');
  log(`\n✅ Appended ${staged.length} case studies to data/case-studies.json (now ${existing.length + staged.length}).`);
  flush(out.join('\n'));
}

function flush(summary: string) {
  if (!existsSync(SUMMARY_DIR)) mkdirSync(SUMMARY_DIR, { recursive: true });
  writeFileSync(SUMMARY_PATH, summary + '\n');
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary + '\n');
}

main().catch((e) => { console.error('case-study cycle failed:', e); process.exit(1); });
