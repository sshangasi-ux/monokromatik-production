// Generate a research-grade case study from a brief, staged for human review.
//
//   ANTHROPIC_API_KEY=… npx tsx scripts/generate-case-study.ts briefs/my-brief.json
//
// The brief is a JSON CaseStudyBrief (see lib/generate-case-study.ts). Output is
// written to data/case-studies/<slug>.json with status:"review". A human reviews
// it, flips status to "published" (or merges the staging PR), and only then does
// it surface at /issues/case-study/<slug>. Same review gate as articles.

import fs from 'fs';
import path from 'path';
import { generateCaseStudy, type CaseStudyBrief } from '../lib/generate-case-study';

async function main() {
  const briefPath = process.argv[2];
  if (!briefPath) {
    console.error('Usage: tsx scripts/generate-case-study.ts <brief.json>');
    process.exit(1);
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY is required.');
    process.exit(1);
  }

  const brief = JSON.parse(fs.readFileSync(briefPath, 'utf-8')) as CaseStudyBrief;
  const study = await generateCaseStudy(brief);

  const outDir = path.join(process.cwd(), 'data', 'case-studies');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${study.slug}.json`);
  fs.writeFileSync(outPath, JSON.stringify(study, null, 2) + '\n');

  console.log(`\n📝 Staged for review (status: ${study.status}):`);
  console.log(`   ${path.relative(process.cwd(), outPath)}`);
  console.log(`   Review it, then set "status": "published" to go live at /issues/case-study/${study.slug}\n`);
}

main().catch((err) => {
  console.error('❌ Case-study generation failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
