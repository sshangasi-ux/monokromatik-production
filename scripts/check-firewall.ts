#!/usr/bin/env node
/**
 * Editorial firewall guard (the moat, as code).
 *
 * MonoKromatik's whole value rests on one rule: a sponsor never sits on or near
 * an Index score. This check enforces it mechanically so a future edit can't
 * quietly break it — it runs in CI on every PR.
 *
 * It asserts:
 *   1. No <SponsorSlot> is rendered on an Index / scoring route (the signal-index
 *      tree, a case-study decode, the score badge). A commercial placement on a
 *      page that carries a score is the exact thing the firewall forbids.
 *   2. Every live sponsor is properly disclosed in DATA (name + url) and attached
 *      only to known editorial-distribution placements — never an Index surface.
 *
 * Exit 1 on any violation (fails the PR); exit 0 when clean. Read-only.
 *
 *   npx tsx scripts/check-firewall.ts
 */

import { readdirSync, readFileSync, statSync } from 'fs';
import { join, relative } from 'path';
import { SPONSORS } from '../lib/sponsors';

const ROOT = process.cwd();
const APP = join(ROOT, 'app');

// Routes that display an Index score or a case-study decode — a sponsor must
// NEVER appear here. Matched against the file path of any SponsorSlot usage.
const FORBIDDEN_ROUTE_PATTERNS: RegExp[] = [
  /intelligence\/signal-index/i, // the Index, per-brand pages, methodology, api
  /intelligence\/case-studies\/\[/i, // a case-study decode page (carries scores)
  /\/badge\//i, // the score badge endpoint
];

interface SlotUse {
  file: string;
  placements: string[];
  forbidden: boolean;
}

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(tsx|ts)$/.test(name)) out.push(p);
  }
  return out;
}

function findSlots(): SlotUse[] {
  const uses: SlotUse[] = [];
  for (const file of walk(APP)) {
    const src = readFileSync(file, 'utf-8');
    if (!src.includes('<SponsorSlot')) continue;
    const placements = [...src.matchAll(/<SponsorSlot[^>]*\bplacement=["']([^"']+)["']/g)].map((m) => m[1]);
    uses.push({
      file: relative(ROOT, file),
      placements,
      forbidden: FORBIDDEN_ROUTE_PATTERNS.some((re) => re.test(file)),
    });
  }
  return uses;
}

function main() {
  const violations: string[] = [];
  const slots = findSlots();

  // 1. No sponsor slot on an Index / scoring route.
  const allowedPlacements = new Set<string>();
  for (const s of slots) {
    if (s.forbidden) {
      violations.push(`SponsorSlot on a forbidden Index/scoring route: ${s.file} (placements: ${s.placements.join(', ') || '—'})`);
    } else {
      s.placements.forEach((p) => allowedPlacements.add(p));
    }
  }

  // 2. Every live sponsor: disclosed (name + url) + only known, non-forbidden placements.
  for (const sp of SPONSORS) {
    if (!sp.name?.trim()) violations.push(`Sponsor missing name: ${JSON.stringify(sp)}`);
    if (!/^https?:\/\//i.test(sp.url || '')) violations.push(`Sponsor "${sp.name}" missing a valid url (disclosure).`);
    if (!sp.placements?.length) violations.push(`Sponsor "${sp.name}" has no placements.`);
    for (const p of sp.placements || []) {
      if (!allowedPlacements.has(p))
        violations.push(`Sponsor "${sp.name}" claims placement "${p}" that no editorial slot renders (typo, or a forbidden/removed surface).`);
    }
  }

  console.log('# Editorial firewall check');
  console.log(`\nSponsorSlot usages: ${slots.length}`);
  for (const s of slots) console.log(`  - ${s.file} [${s.placements.join(', ') || 'no placement attr'}]${s.forbidden ? '  ⛔ FORBIDDEN ROUTE' : ''}`);
  console.log(`Allowed (editorial) placements: ${[...allowedPlacements].join(', ') || '(none)'}`);
  console.log(`Live sponsors: ${SPONSORS.length}`);

  if (violations.length) {
    console.error(`\n🔴 FIREWALL VIOLATIONS (${violations.length}):`);
    for (const v of violations) console.error(`  - ${v}`);
    console.error('\nThe firewall is the product. Fix before merging.');
    process.exit(1);
  }
  console.log('\n✅ Firewall intact — no sponsor on or near an Index score.');
}

main();
