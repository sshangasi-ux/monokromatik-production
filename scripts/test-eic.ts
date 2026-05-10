#!/usr/bin/env tsx
/**
 * Run the Editor-in-Chief agent against the existing articles in
 * data/articles.json. Useful for:
 *   1. Calibrating EIC strictness (would I agree with these kill verdicts?)
 *   2. Testing the digest email end-to-end (use --send-digest)
 *   3. Spot-checking which articles in the catalog are weakest
 *
 * Usage:
 *   tsx scripts/test-eic.ts                              # review all, no email
 *   tsx scripts/test-eic.ts --slug=X                     # review one
 *   tsx scripts/test-eic.ts --limit=5                    # review last 5
 *   tsx scripts/test-eic.ts --send-digest                # also email digest
 *   tsx scripts/test-eic.ts --slug=X --send-digest       # both
 *
 * Note: this is read-only — it never modifies data/articles.json. EIC
 * verdicts are printed to stdout. Pass --send-digest to fire the email.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { reviewBatch } from '../lib/editor-in-chief';
import { sendDigest } from '../lib/eic-digest';

// ─── Env loader ───────────────────────────────────────────────────────────
const envPath = join(__dirname, '../.env.local');
if (existsSync(envPath)) {
  readFileSync(envPath, 'utf-8')
    .split('\n')
    .forEach((line) => {
      const m = line.match(/^([^#=][^=]*)=(.+)$/);
      if (m) process.env[m[1].trim()] = m[2].trim();
    });
}

// ─── Args ─────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const ONE_SLUG = args.find((a) => a.startsWith('--slug='))?.split('=')[1];
const LIMIT = parseInt(
  args.find((a) => a.startsWith('--limit='))?.split('=')[1] ?? '0',
  10
);
const SEND_DIGEST = args.includes('--send-digest');

const log = (msg: string) =>
  console.log(`[${new Date().toISOString().slice(11, 19)}] ${msg}`);

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY missing in .env.local');
  }

  const articles: any[] = JSON.parse(
    readFileSync(join(__dirname, '../data/articles.json'), 'utf-8')
  );

  // Pick the subset
  let subset = articles;
  if (ONE_SLUG) {
    subset = articles.filter((a) => a.slug === ONE_SLUG);
    if (subset.length === 0) throw new Error(`No article with slug "${ONE_SLUG}"`);
  } else if (LIMIT > 0) {
    subset = articles.slice(0, LIMIT);
  }

  log(`📝 Editor-in-Chief test run`);
  log(`   Reviewing ${subset.length} of ${articles.length} articles`);
  log(`   Send digest email: ${SEND_DIGEST}`);
  log('');

  const reviewed = await reviewBatch(subset, {
    concurrency: 3,
    onProgress: (done, total, latest) => {
      const icon = latest.review.verdict === 'approved' ? '✅' : '🚫';
      log(
        `   [${done}/${total}] ${icon} ${latest.review.verdict.padEnd(8)} score=${latest.review.score}/10 — ${latest.title.slice(
          0,
          55
        )}`
      );
      if (latest.review.verdict === 'killed') {
        log(`         why: ${latest.review.killReason}`);
      }
    },
  });

  log('');
  log('═══ DETAILED VERDICTS ═══');
  log('');

  for (const r of reviewed) {
    const status = r.review.verdict === 'approved' ? '✅ APPROVED' : '🚫 KILLED';
    log(`${status}  ${r.title}`);
    log(`   Score: ${r.review.score}/10`);
    log(`   Dimensions:`);
    log(`     editorial_value:    ${r.review.dimensions.editorial_value}/10`);
    log(`     voice_integrity:    ${r.review.dimensions.voice_integrity}/10`);
    log(`     factual_coherence:  ${r.review.dimensions.factual_coherence}/10`);
    log(`     tone_fit:           ${r.review.dimensions.tone_fit}/10`);
    log(`     lede_strength:      ${r.review.dimensions.lede_strength}/10`);
    log(`     length_appropriate: ${r.review.dimensions.length_appropriate}/10`);
    log(`   Notes: ${r.review.notes}`);
    if (r.review.killReason) {
      log(`   Kill reason: ${r.review.killReason}`);
    }
    if (r.review.bestLine) {
      log(`   Best line: "${r.review.bestLine}"`);
    }
    log('');
  }

  const killed = reviewed.filter((r) => r.review.verdict === 'killed');
  const approved = reviewed.filter((r) => r.review.verdict === 'approved');

  log('═══ SUMMARY ═══');
  log(`   ${approved.length} approved`);
  log(`   ${killed.length} killed`);
  log(
    `   Avg score: ${(
      reviewed.reduce((s, r) => s + r.review.score, 0) / reviewed.length
    ).toFixed(1)}/10`
  );
  log('');

  if (SEND_DIGEST) {
    log('📧 Sending digest email...');
    const ok = await sendDigest({
      killed,
      approved,
      runAt: new Date().toISOString(),
    });
    log(ok ? '   ✅ Digest sent' : '   ❌ Digest failed (check logs above)');
  } else {
    log('🟡 --send-digest not passed; no email sent.');
  }
}

main().catch((err) => {
  console.error('\n❌ Test run failed:', err);
  process.exit(1);
});
