#!/usr/bin/env node
/**
 * Discover gap-filling story leads — Planner v2's "commission" step.
 *
 * Builds the coverage plan from what's been published, picks the thinnest
 * Region × Franchise cells, and actively web-searches for REAL, citable leads to
 * fill them. Writes a commission brief (output/gap-candidates.{json,md}) of cited
 * leads for the Curator/editor — nothing is published.
 *
 * Usage:
 *   npm run coverage:discover            # top cells (default 4)
 *   npm run coverage:discover -- --cells=6 --searches=4
 *   npm run coverage:discover -- --dry   # show selected cells only, no search
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { getAllArticles } from '../lib/articles';
import { buildCoveragePlan, type CoverageItem } from '../lib/coverage-planner';
import { selectGapCells, discoverForCell, type GapCellResult } from '../lib/gap-discovery';

const envPath = join(__dirname, '../.env.local');
if (existsSync(envPath)) {
  readFileSync(envPath, 'utf-8')
    .split('\n')
    .forEach((line) => {
      const m = line.match(/^([^#=][^=]*)=(.+)$/);
      if (m) process.env[m[1].trim()] = m[2].trim();
    });
}

const ts = () => new Date().toISOString();
const log = (m: string) => console.log(`[${ts()}] ${m}`);

function brief(results: GapCellResult[], stamp: string): string {
  const lines: string[] = [];
  lines.push('# Coverage gap — commission brief');
  lines.push('');
  lines.push(`_Generated ${stamp}. Real, web-sourced leads for the thinnest Region × Franchise cells._`);
  lines.push('');
  lines.push('**These are LEADS to commission, not published content.** Each is a real,');
  lines.push('citable story for the cell it fills — hand to the Writer or an editor.');
  lines.push('');
  for (const r of results) {
    lines.push(`## ${r.region} × ${r.category}${r.sourced ? '' : '  _(no feed — newly sourced via search)_'}`);
    if (r.error) {
      lines.push(`> search failed: ${r.error}`);
      lines.push('');
      continue;
    }
    if (!r.leads.length) {
      lines.push('> No real leads found this run (honest emptiness — better than padding).');
      lines.push('');
      continue;
    }
    for (const l of r.leads) {
      lines.push(`- **${l.title}** — ${l.summary} [${l.source || 'source'}](${l.url})`);
      if (l.why) lines.push(`  - _Fit:_ ${l.why}`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY not set.');
    process.exit(1);
  }
  const args = process.argv.slice(2);
  const dry = args.includes('--dry');
  const cells = parseInt(args.find((a) => a.startsWith('--cells='))?.split('=')[1] || '4', 10);
  const searches = parseInt(args.find((a) => a.startsWith('--searches='))?.split('=')[1] || '4', 10);

  const items: CoverageItem[] = getAllArticles().map((a) => ({
    category: a.category,
    source: a.sourceName,
    publishedAt: a.publishedAt,
  }));
  const plan = buildCoveragePlan(items);
  const picked = selectGapCells(plan, cells);

  log(`Plan: ${plan.gaps.length} gap cell(s). Commissioning top ${picked.length}: ${picked.map((g) => `${g.region}×${g.category}`).join(', ')}`);

  if (dry) {
    log('Dry run — selected cells only, no search performed.');
    return;
  }

  const results: GapCellResult[] = [];
  for (const cell of picked) results.push(await discoverForCell(cell, { maxSearches: searches }));

  const outDir = join(__dirname, '../output');
  mkdirSync(outDir, { recursive: true });
  const stamp = ts();
  writeFileSync(join(outDir, 'gap-candidates.json'), JSON.stringify({ generatedAt: stamp, plan: { gaps: plan.gaps }, results }, null, 2));
  writeFileSync(join(outDir, 'gap-candidates.md'), brief(results, stamp));

  const totalLeads = results.reduce((n, r) => n + r.leads.length, 0);
  log(`Wrote output/gap-candidates.{json,md} — ${totalLeads} lead(s) across ${results.length} cell(s).`);
}

main().catch((err) => {
  console.error('❌ discover-gaps crashed:', err);
  process.exit(1);
});
