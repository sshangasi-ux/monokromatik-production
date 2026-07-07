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
const QUEUE_PATH = join(process.cwd(), 'data', 'case-study-queue.json');
const SUMMARY_DIR = join(process.cwd(), 'output', 'case-study-cycle');
const SUMMARY_PATH = join(SUMMARY_DIR, 'STAGED.md');

interface QueueSubject {
  subject: string;
  brand: string;
  lane: string;
  angle: string;
  priority: number;
  access: 'premium' | 'public';
  status: string;
  rationale: string;
}
interface Queue {
  updated: string;
  note: string;
  subjects: QueueSubject[];
}

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

  // The commission queue drives the run: directed, premium subjects lead (top
  // priority first); self-sourced public drafts fill any remainder to COUNT.
  let queue: Queue | null = null;
  try { queue = JSON.parse(readFileSync(QUEUE_PATH, 'utf-8')) as Queue; } catch { queue = null; }
  const queued = (queue?.subjects ?? [])
    .filter((s) => s.status === 'queued')
    .sort((a, b) => a.priority - b.priority);
  const jobs: { subject?: string; access: 'public' | 'premium'; ref: QueueSubject | null }[] = Array.from(
    { length: COUNT },
    (_, i) =>
      i < queued.length
        ? { subject: queued[i].subject, access: queued[i].access, ref: queued[i] }
        : { subject: undefined, access: 'public', ref: null }
  );
  if (queued.length) log(`Commission queue: ${queued.length} subject(s) waiting — drafting the top ${Math.min(COUNT, queued.length)} (directed, premium).\n`);

  const stamp = new Date().toISOString();
  const staged: CaseStudy[] = [];
  const rows: string[] = [];
  let noKey = false;

  for (const job of jobs) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      const res = await draftCaseStudy({ avoidBrands, stamp, subject: job.subject, access: job.access, maxSearches: SEARCHES });
      if (!res.ok || !res.caseStudy) {
        log(`  · ${job.subject ?? 'self-sourced'} (try ${attempt}): rejected — ${res.reasons.join('; ') || 'no draft'}`);
        if (res.reasons.includes('ANTHROPIC_API_KEY not set')) { noKey = true; break; }
        continue;
      }
      const cs = res.caseStudy;
      staged.push(cs);
      avoidBrands.push(cs.brand); // don't draft the same brand twice this run
      if (job.ref) job.ref.status = 'drafted'; // consume the queue slot (persisted below)
      const evTier = tierOf(res.evidenceScore ?? 0);
      rows.push(`| ${cs.brand} | ${cs.access} | ${res.score} | ${res.evidenceScore} (${evTier}) | ${cs.sources.length} |`);
      log(`  ✅ ${cs.brand} — ${cs.access} · signal ${res.score}/100 · evidence ${res.evidenceScore} (${evTier}) · ${cs.sources.length} sources`);
      break;
    }
    if (noKey) break;
  }

  if (staged.length === 0) {
    log('\nNothing staged this run (no valid drafts). The Index is unchanged.');
    flush(out.join('\n'));
    return;
  }

  log(`\n## Staged ${staged.length} for review\n`);
  log('| Brand | Access | Signal | Evidence | Sources |');
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
  if (queue) {
    queue.updated = stamp.slice(0, 10);
    writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2) + '\n');
    const left = queue.subjects.filter((s) => s.status === 'queued').length;
    log(`\n📋 Commission queue updated — ${left} subject(s) still waiting. Top up data/case-study-queue.json to keep the pipeline fed.`);
  }
  log(`\n✅ Appended ${staged.length} case studies to data/case-studies.json (now ${existing.length + staged.length}).`);
  flush(out.join('\n'));
}

function flush(summary: string) {
  if (!existsSync(SUMMARY_DIR)) mkdirSync(SUMMARY_DIR, { recursive: true });
  writeFileSync(SUMMARY_PATH, summary + '\n');
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary + '\n');
}

main().catch((e) => { console.error('case-study cycle failed:', e); process.exit(1); });
