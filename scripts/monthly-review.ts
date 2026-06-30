#!/usr/bin/env node
/**
 * Monthly Strategy Review — writes an internal-telemetry assessment of the site
 * (depth, Index scale, proof, GA4 performance, GSC opportunities) scored against
 * the strategic bars in docs/STRATEGY-REVIEW.md, in the house voice, to
 * docs/reviews/YYYY-MM.md. Opened as a review PR by the monthly workflow.
 *
 * No-op-safe: with no ANTHROPIC_API_KEY it still emits the full data section.
 *
 *   npm run review:monthly            # write this month's review
 *   npm run review:monthly -- --month 2026-07
 */

import { writeFileSync, mkdirSync, appendFileSync, existsSync } from 'fs';
import { join } from 'path';
import { generateMonthlyReview } from '../lib/monthly-review';

function monthArg(): { slug: string; label: string } {
  const i = process.argv.indexOf('--month');
  const raw = i >= 0 ? process.argv[i + 1] : '';
  const d = /^\d{4}-\d{2}$/.test(raw) ? new Date(`${raw}-01T00:00:00Z`) : new Date();
  const slug = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
  const label = d.toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  return { slug, label };
}

async function main() {
  const { slug, label } = monthArg();
  console.log(`# Monthly review — ${label}`);

  const markdown = await generateMonthlyReview(label);

  const dir = join(process.cwd(), 'docs', 'reviews');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const path = join(dir, `${slug}.md`);
  writeFileSync(path, markdown);
  console.log(`\n✅ Wrote ${path} (${markdown.length} chars)`);

  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, `Monthly review written to \`docs/reviews/${slug}.md\`.\n\n${markdown}\n`);
  }
}

main().catch((e) => {
  console.error('monthly-review failed:', e);
  process.exit(1);
});
