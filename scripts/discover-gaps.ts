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
import { getAllCaseStudies } from '../lib/case-studies';
import { getAllReports } from '../lib/reports';
import { getAllIssues } from '../lib/issues';
import { buildCoveragePlan, type CoverageItem } from '../lib/coverage-planner';
import { fetchMonoKromatikStories } from '../lib/fetch-stories';
import { selectGapCells, discoverForCell, discoverForFranchise, discoverGapsFromPool, discoverForFranchiseFromPool, type GapCellResult } from '../lib/gap-discovery';
import type { Story } from '../lib/rss-feeds';
import { classifyFranchise } from '../lib/editorial-franchises';
import { buildFranchisePlan, describeFranchisePlan, type FranchiseItem, type FranchisePlan } from '../lib/franchise-coverage';

/** Aggregate every published item into a franchise-tagged timeline. */
function collectFranchiseItems(): FranchiseItem[] {
  const items: FranchiseItem[] = [];
  for (const a of getAllArticles()) {
    items.push({
      franchise: classifyFranchise({ kind: 'article', title: a.title, category: a.category, tags: a.tags, hasBrandRead: Boolean(a.brandRead?.take) }),
      publishedAt: a.publishedAt,
    });
  }
  for (const c of getAllCaseStudies()) {
    items.push({
      franchise: classifyFranchise({ kind: 'case-study', title: c.title, collection: c.collection, tags: c.tags }),
      publishedAt: c.publishedAt,
    });
  }
  for (const r of getAllReports()) {
    if (!r.publishedAt) continue; // only live reports have a date
    items.push({ franchise: classifyFranchise({ kind: 'report', title: r.title, series: r.series, tags: r.tags }), publishedAt: r.publishedAt });
  }
  for (const i of getAllIssues()) {
    if (!i.publishedAt) continue;
    for (const f of i.features || []) {
      items.push({ franchise: classifyFranchise({ kind: 'issue-feature', title: f.title, franchise: f.franchise }), publishedAt: i.publishedAt });
    }
  }
  return items;
}

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

function renderResult(lines: string[], heading: string, r: GapCellResult) {
  lines.push(heading);
  if (r.error) {
    lines.push(`> search failed: ${r.error}`);
    lines.push('');
    return;
  }
  if (!r.leads.length) {
    lines.push('> No real leads found this run (honest emptiness — better than padding).');
    lines.push('');
    return;
  }
  for (const l of r.leads) {
    lines.push(`- **${l.title}** — ${l.summary} [${l.source || 'source'}](${l.url})`);
    if (l.why) lines.push(`  - _Fit:_ ${l.why}`);
  }
  lines.push('');
}

function brief(
  regionResults: GapCellResult[],
  franchiseResults: GapCellResult[],
  franchisePlan: FranchisePlan,
  stamp: string
): string {
  const lines: string[] = [];
  lines.push('# Coverage gap — commission brief');
  lines.push('');
  lines.push(`_Generated ${stamp}. Real, web-sourced leads for the thinnest coverage cells across all three axes._`);
  lines.push('');
  lines.push('**These are LEADS to commission, not published content.** Each is a real,');
  lines.push('citable story for the cell it fills — hand to the Writer or an editor.');
  lines.push('');
  lines.push('## Region × Category gaps');
  lines.push('');
  for (const r of regionResults) {
    renderResult(lines, `### ${r.region} × ${r.category}${r.sourced ? '' : '  _(no feed — newly sourced via search)_'}`, r);
  }
  lines.push('## Editorial franchise gaps');
  lines.push('');
  lines.push(`_${describeFranchisePlan(franchisePlan)}._`);
  lines.push('');
  for (const r of franchiseResults) {
    renderResult(lines, `### ${r.region}  _(franchise)_`, r);
  }
  return lines.join('\n');
}

async function main() {
  const args = process.argv.slice(2);
  const dry = args.includes('--dry');
  const cells = parseInt(args.find((a) => a.startsWith('--cells='))?.split('=')[1] || '4', 10);
  const franchises = parseInt(args.find((a) => a.startsWith('--franchises='))?.split('=')[1] || '2', 10);
  const searches = parseInt(args.find((a) => a.startsWith('--searches='))?.split('=')[1] || '4', 10);

  // Axis 1+2: Region × Category.
  const items: CoverageItem[] = getAllArticles().map((a) => ({
    category: a.category,
    source: a.sourceName,
    publishedAt: a.publishedAt,
  }));
  const plan = buildCoveragePlan(items);
  const pickedCells = selectGapCells(plan, cells);

  // Axis 3: editorial franchise.
  const franchisePlan = buildFranchisePlan(collectFranchiseItems());
  const pickedFranchises = franchisePlan.gaps.slice(0, franchises).map((g) => g.franchise);

  log(`Region×Category: ${plan.gaps.length} gap(s) → commissioning ${pickedCells.map((g) => `${g.region}×${g.category}`).join(', ')}`);
  log(`Franchise: ${describeFranchisePlan(franchisePlan)} → commissioning ${pickedFranchises.join(', ') || '(none thin)'}`);

  if (dry) {
    log('Dry run — selected cells/franchises only, no search performed.');
    return;
  }

  // Auto-fallback: web-search via AI when a key works; on absence or the FIRST
  // API error, switch to the deterministic RSS pool for the rest — so the brief
  // is always produced, credit-free when needed. The pool is fetched lazily and
  // only once (it's free but ~feed-latency, so we skip it while AI is healthy).
  //
  // The deterministic path can't chase the AI-selected cells (they're the thinnest
  // — often UNSOURCED cells no feed carries). Instead it fills the SOURCED gaps the
  // pool can actually serve, so the brief still carries real, commissionable leads.
  let useRules = !process.env.ANTHROPIC_API_KEY;
  if (useRules) log('No ANTHROPIC_API_KEY — sourcing leads from the RSS pool (credit-free).');
  let pool: Story[] | null = null;
  const getPool = async (): Promise<Story[]> => (pool ??= await fetchMonoKromatikStories());

  const results: GapCellResult[] = [];
  if (!useRules) {
    for (const cell of pickedCells) {
      const r = await discoverForCell(cell, { maxSearches: searches });
      if (r.error) { log(`AI discovery failed (${r.error.slice(0, 100)}) — switching to deterministic RSS pool.`); useRules = true; break; }
      results.push(r);
    }
  }
  if (useRules) {
    const have = new Set(results.map((r) => `${r.region}|${r.category}`));
    for (const r of discoverGapsFromPool(plan, await getPool(), cells)) {
      if (!have.has(`${r.region}|${r.category}`)) results.push(r);
    }
  }

  const franchiseResults: GapCellResult[] = [];
  if (!useRules) {
    for (const f of pickedFranchises) {
      const r = await discoverForFranchise(f, { maxSearches: searches });
      if (r.error) { log(`AI discovery failed (${r.error.slice(0, 100)}) — switching to deterministic RSS pool.`); useRules = true; break; }
      franchiseResults.push(r);
    }
  }
  if (useRules) {
    const pl = await getPool();
    for (const f of pickedFranchises) {
      if (!franchiseResults.some((x) => x.region === f)) franchiseResults.push(discoverForFranchiseFromPool(f, pl));
    }
  }

  const outDir = join(__dirname, '../output');
  mkdirSync(outDir, { recursive: true });
  const stamp = ts();
  writeFileSync(
    join(outDir, 'gap-candidates.json'),
    JSON.stringify({ generatedAt: stamp, plan: { gaps: plan.gaps }, franchisePlan, results, franchiseResults }, null, 2)
  );
  writeFileSync(join(outDir, 'gap-candidates.md'), brief(results, franchiseResults, franchisePlan, stamp));

  const totalLeads = [...results, ...franchiseResults].reduce((n, r) => n + r.leads.length, 0);
  log(`Wrote output/gap-candidates.{json,md} — ${totalLeads} lead(s) across ${results.length} cell(s) + ${franchiseResults.length} franchise(s).`);
}

main().catch((err) => {
  console.error('❌ discover-gaps crashed:', err);
  process.exit(1);
});
