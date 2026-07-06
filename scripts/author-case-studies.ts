#!/usr/bin/env node
/**
 * Author-staged case studies — the credit-free path to feed the Index. When the
 * API is unavailable, a human (or an in-session agent) researches real, sourced
 * brand moves and writes them as raw drafts to a JSON file; this runs them
 * through the SAME assemble + fail-closed validation as the automated cycle
 * (lib/draft-case-study), then appends the valid ones to data/case-studies.json.
 * verification stays 'partial' — the analyst upgrades to 'verified' on review.
 *
 *   npm run casestudy:author -- --file scratchpad/drafts.json --dry
 *   npm run casestudy:author -- --file scratchpad/drafts.json
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { assembleCaseStudy, validateDraft } from '../lib/draft-case-study';
import { compositeScore, brandSlug } from '../lib/signal-index';
import { brandEvidence } from '../lib/evidence-strength';
import type { CaseStudy } from '../lib/case-studies';

const CASE_STUDIES_PATH = join(process.cwd(), 'data', 'case-studies.json');
const DRY = process.argv.includes('--dry');
const fileArg = process.argv.find((a) => a.startsWith('--file='))?.split('=')[1]
  ?? (process.argv.includes('--file') ? process.argv[process.argv.indexOf('--file') + 1] : '');

const tierOf = (s: number) => (s >= 75 ? 'Strong' : s >= 45 ? 'Moderate' : 'Developing');

function main() {
  if (!fileArg) { console.error('Provide --file <drafts.json>'); process.exit(1); }
  const raws = JSON.parse(readFileSync(fileArg, 'utf-8')) as unknown[];
  const existing = JSON.parse(readFileSync(CASE_STUDIES_PATH, 'utf-8')) as CaseStudy[];
  const avoid = new Set(existing.map((c) => brandSlug(c.brand)));
  const stamp = new Date().toISOString();

  console.log(`# Author case studies · ${raws.length} draft(s)${DRY ? ' · DRY RUN' : ''}`);
  console.log(`${existing.length} already on the Index.\n`);

  const staged: CaseStudy[] = [];
  for (const raw of raws) {
    const cs = assembleCaseStudy(raw, stamp);
    const v = validateDraft(cs, avoid);
    if (!v.ok || !cs) {
      console.log(`  ❌ ${cs?.brand || '(unparseable)'} — ${v.reasons.join('; ')}`);
      continue;
    }
    avoid.add(brandSlug(cs.brand)); // block intra-batch dups
    const sig = compositeScore(cs.decode)!;
    const ev = brandEvidence([cs]);
    staged.push(cs);
    console.log(`  ✅ ${cs.brand} — signal ${sig}/100 · evidence ${ev.score} (${tierOf(ev.score)}) · ${cs.sources.length} sources · ${cs.evidence.confirmed.length}c/${cs.evidence.reported.length}r`);
  }

  if (staged.length === 0) { console.log('\nNothing valid to stage.'); return; }
  if (DRY) { console.log(`\n(DRY RUN — ${staged.length} would be staged; data unchanged.)`); return; }

  writeFileSync(CASE_STUDIES_PATH, JSON.stringify([...existing, ...staged], null, 2) + '\n');
  console.log(`\n✅ Appended ${staged.length} to data/case-studies.json (now ${existing.length + staged.length}).`);
}

main();
