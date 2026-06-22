// Cultural-Signal Index — Phase 3 batch scorer.
//
// Drafts the four-axis decode for case studies and writes them to
// output/decode-drafts/<slug>.json for HUMAN REVIEW. It never edits
// data/case-studies.json — an editor applies (or rejects) each draft.
//
//   npx tsx scripts/score-case-studies.ts            # only cases missing a decode
//   npx tsx scripts/score-case-studies.ts --all      # re-draft every case (review)
//   npx tsx scripts/score-case-studies.ts --slug foo # a single case

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// Load .env.local so ANTHROPIC_API_KEY is present (mirrors run-pipeline.ts).
const envPath = join(process.cwd(), '.env.local');
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

async function main() {
  const { getAllCaseStudies } = await import('../lib/case-studies');
  const { draftDecode } = await import('../lib/score-case-study');
  const { compositeScore } = await import('../lib/signal-index');

  const args = process.argv.slice(2);
  const slugFlag = args.indexOf('--slug') >= 0 ? args[args.indexOf('--slug') + 1] : null;
  const all = getAllCaseStudies();

  let targets = all;
  if (slugFlag) targets = all.filter((c) => c.slug === slugFlag);
  else if (!args.includes('--all')) targets = all.filter((c) => !c.decode || c.decode.length === 0);

  if (targets.length === 0) {
    console.log('No case studies to score (all have a decode — pass --all to re-draft for review).');
    return;
  }

  const outDir = join(process.cwd(), 'output', 'decode-drafts');
  mkdirSync(outDir, { recursive: true });
  console.log(`✍️  Drafting decodes for ${targets.length} case stud${targets.length === 1 ? 'y' : 'ies'} → output/decode-drafts/\n`);

  let ok = 0;
  for (const c of targets) {
    const draft = await draftDecode(c);
    if (!draft) {
      console.log(`   ✗ ${c.slug} — draft failed/invalid (score by hand)`);
      continue;
    }
    const draftScore = compositeScore(draft.decode);
    const existingScore = c.decode && c.decode.length ? compositeScore(c.decode) : null;
    writeFileSync(
      join(outDir, `${c.slug}.json`),
      JSON.stringify(
        {
          slug: c.slug,
          brand: c.brand,
          status: 'DRAFT — requires human approval before applying to data/case-studies.json',
          generatedAt: new Date().toISOString(),
          draftScore,
          existingScore,
          draft,
          existing: c.decode ?? null,
        },
        null,
        2,
      ),
    );
    ok += 1;
    console.log(`   ✓ ${c.slug} → draft ${draftScore}${existingScore !== null ? ` (existing ${existingScore})` : ' (new)'}`);
  }

  console.log(`\n${ok}/${targets.length} drafts written. Review them and apply by hand — nothing was auto-applied (case-study scoring is human-gated).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
