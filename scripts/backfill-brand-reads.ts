// Backfill the Brand Read (the dual-read strategic layer) onto existing
// articles in data/articles.json, using the same Strategist → Brand Read
// Editor pair the live pipeline runs post-EIC.
//
// This is how the monetisable layer goes from one hand-built proof-of-concept
// (Dave) to a real product surface across the catalogue. It is FAIL-CLOSED
// and ADDITIVE end to end: the Strategist writes a read, the Editor scores and
// gates it, and a brandRead is attached ONLY when both clear. Any decline,
// error, or sub-bar score leaves the article exactly as it was. A missing
// Brand Read is a non-event; a weak or ungrounded one is the failure we refuse.
//
// Governance: this script only WRITES data/articles.json in your working tree.
// It performs NO git operations. Under the review-gated model, you commit the
// result via GitHub Desktop (or the agents workflow opens a PR), so every
// backfilled read passes through human sign-off before it is public — exactly
// like agent-generated articles.
//
// Run where ANTHROPIC_API_KEY + network exist (NOT the build sandbox):
//   npx tsx scripts/backfill-brand-reads.ts                 # generate + write
//   npx tsx scripts/backfill-brand-reads.ts --dry-run       # report only, no write
//   npx tsx scripts/backfill-brand-reads.ts --only-missing  # skip articles that already have a brandRead
//   npx tsx scripts/backfill-brand-reads.ts --limit 5       # first N candidates only
//   npx tsx scripts/backfill-brand-reads.ts --category culture   # restrict to one category
//
// --only-missing is recommended for re-runs: it makes the script converge
// (already-attached reads are left untouched) so you can backfill in batches
// and review each PR without re-spending on articles already done.

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { generateBrandRead } from '../lib/strategist';
import { editBrandRead } from '../lib/brand-read-editor';
import type { Article } from '../lib/articles';

// Load .env.local so the script works locally (CI provides env via secrets).
const ENV_PATH = join(process.cwd(), '.env.local');
if (existsSync(ENV_PATH)) {
  readFileSync(ENV_PATH, 'utf-8')
    .split('\n')
    .forEach((line) => {
      const m = line.match(/^([^#=][^=]*)=(.+)$/);
      if (m) process.env[m[1].trim()] = m[2].trim();
    });
}

const ARTICLES_PATH = join(process.cwd(), 'data', 'articles.json');

function flagValue(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}
const DRY = process.argv.includes('--dry-run');
const ONLY_MISSING = process.argv.includes('--only-missing');
const LIMIT = Number(flagValue('--limit') || '0') || Infinity;
const CATEGORY = flagValue('--category')?.toLowerCase();

async function main() {
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY.startsWith('your_')) {
    throw new Error('ANTHROPIC_API_KEY not set. Add it to .env.local or the environment.');
  }

  const articles: Article[] = JSON.parse(readFileSync(ARTICLES_PATH, 'utf-8'));

  let processed = 0;
  let attached = 0;
  let strategistDeclined = 0;
  let editorDropped = 0;

  console.log(
    `Backfilling Brand Reads over ${articles.length} articles` +
      `${ONLY_MISSING ? ' (only-missing)' : ''}${CATEGORY ? ` (category=${CATEGORY})` : ''}` +
      `${DRY ? ' [DRY RUN]' : ''}\n`
  );

  for (let i = 0; i < articles.length && processed < LIMIT; i++) {
    const a = articles[i];

    if (ONLY_MISSING && a.brandRead && a.brandRead.take?.trim()) continue;
    if (CATEGORY && a.category?.toLowerCase() !== CATEGORY) continue;

    processed++;
    const tag = `[${i + 1}/${articles.length}] ${a.title.slice(0, 52)}`;

    // 1. Strategist — write the Brand Read (fail-closed: may decline).
    const strategy = await generateBrandRead({
      slug: a.slug,
      title: a.title,
      excerpt: a.excerpt,
      content: a.content,
      category: a.category,
      tags: a.tags,
      sourceName: a.sourceName,
    });

    if (!strategy.brandRead) {
      strategistDeclined++;
      console.log(`  — ${tag} :: strategist declined (${strategy.declineReason ?? 'no reason'})`);
      continue;
    }

    // 2. Brand Read Editor — score + gate (fail-closed: may drop).
    const edit = await editBrandRead(strategy.brandRead, {
      slug: a.slug,
      title: a.title,
      excerpt: a.excerpt,
      content: a.content,
      category: a.category,
    });

    if (!edit.brandRead) {
      editorDropped++;
      console.log(
        `  🚫 ${tag} :: editor dropped score=${edit.verdict.score}/10 (${edit.verdict.dropReason ?? edit.verdict.notes})`
      );
      continue;
    }

    // 3. Attach — additive, nothing else on the article changes.
    articles[i] = { ...a, brandRead: edit.brandRead };
    attached++;
    console.log(`  ✅ ${tag} :: brand read attached score=${edit.verdict.score}/10`);
  }

  console.log(
    `\nProcessed ${processed} | attached ${attached} | strategist declined ${strategistDeclined} | editor dropped ${editorDropped}`
  );

  if (DRY) {
    console.log('Dry run — data/articles.json not written.');
    return;
  }
  if (attached === 0) {
    console.log('No Brand Reads attached — data/articles.json not written.');
    return;
  }
  writeFileSync(ARTICLES_PATH, JSON.stringify(articles, null, 2));
  console.log(`Wrote ${ARTICLES_PATH}. Review the diff, then stage via PR / GitHub Desktop.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
