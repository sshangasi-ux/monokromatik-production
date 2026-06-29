#!/usr/bin/env node
/**
 * Accessibility watchdog.
 *
 * Runs the axe-core ruleset against the LIVE rendered HTML of key page types
 * (loaded into jsdom — no browser binary needed). Catches real, structural a11y
 * regressions: images without alt text, controls without accessible names, form
 * fields without labels, invalid ARIA, bad heading/landmark structure, etc.
 *
 * Honest scope: jsdom can't compute layout, so COLOR-CONTRAST is not evaluated
 * here (it needs a real browser — a separate, heavier pass). This covers the
 * large render-independent subset, which is where most regressions land.
 *
 * Actionable alerts are gated to serious/critical impact so the watchdog doesn't
 * cry wolf on broad, known structural items (e.g. landmark regions); moderate/
 * minor are reported as informational.
 *
 * Read-only. Targets production by default; SEO_BASE_URL overrides for a preview.
 *
 *   npx tsx scripts/check-a11y.ts
 */

import { JSDOM } from 'jsdom';
import { writeFileSync, mkdirSync, appendFileSync } from 'fs';
import { join } from 'path';

const BASE = (process.env.SEO_BASE_URL || 'https://www.monokromatik.com').replace(/\/$/, '');
const UA = 'Mozilla/5.0 MonoKromatikA11yWatchdog';
const ACTIONABLE = new Set(['serious', 'critical']);

const report: string[] = [];
const log = (s: string) => {
  console.log(s);
  report.push(s);
};

async function fetchHtml(path: string): Promise<string | null> {
  try {
    const r = await fetch(`${BASE}${path}`, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(15_000) });
    if (!r.ok) return null;
    return await r.text();
  } catch {
    return null;
  }
}

interface Finding {
  route: string;
  id: string;
  impact: string;
  help: string;
  count: number;
}

async function main() {
  // axe-core needs window/document globals to exist before it initialises, so it
  // is imported dynamically after the jsdom realm is in place. (CJS interop puts
  // the axe object on .default.)
  type AxeViolation = { id: string; impact: string | null; help: string; nodes: unknown[] };
  type AxeRunner = { run: (ctx: unknown, opts: unknown) => Promise<{ violations: AxeViolation[] }> };
  let axe: AxeRunner | null = null;

  // Sitemap gives us a real article + case study to sample alongside the static templates.
  let article = '/article';
  let caseStudy = '/intelligence/case-studies';
  const sm = await fetchHtml('/sitemap.xml');
  if (sm) {
    const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    const a = locs.find((u) => u.includes('/article/'));
    const c = locs.find((u) => u.includes('/case-studies/') && !u.endsWith('/case-studies'));
    if (a) article = new URL(a).pathname;
    if (c) caseStudy = new URL(c).pathname;
  }

  const routes: [string, string][] = [
    ['/', 'home'],
    ['/intelligence/signal-index', 'index'],
    ['/intelligence/case-studies', 'case-studies'],
    ['/breaking', 'wire'],
    ['/weekly', 'weekly'],
    ['/work-with-us', 'work-with-us (form)'],
    [article, 'article'],
    [caseStudy, 'case-study'],
  ];

  log(`# Accessibility watchdog — ${BASE}`);
  log(`_axe-core via jsdom · color-contrast excluded (needs a browser) · actionable = serious/critical_\n`);

  const actionable: Finding[] = [];
  const informational: Finding[] = [];

  // One jsdom realm for the whole run — axe binds to the window it first sees, so
  // each page is loaded by rewriting THIS document rather than making a new one.
  const dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>');
  const g = global as unknown as Record<string, unknown>;
  g.window = dom.window;
  g.document = dom.window.document;
  g.Node = dom.window.Node;
  g.NodeList = dom.window.NodeList;
  g.Element = dom.window.Element;
  g.getComputedStyle = dom.window.getComputedStyle;
  const mod = (await import('axe-core')) as unknown as Record<string, unknown>;
  axe = (mod.default ?? mod) as AxeRunner;

  for (const [path, label] of routes) {
    const html = await fetchHtml(path);
    if (!html) {
      log(`- ⚠️ ${label} (${path}) — could not fetch`);
      continue;
    }
    try {
      const doc = dom.window.document;
      doc.open();
      doc.write(html);
      doc.close();
      const results = await axe!.run(doc.documentElement, {
        resultTypes: ['violations'],
        rules: { 'color-contrast': { enabled: false } },
      });
      const serious = results.violations.filter((v) => ACTIONABLE.has(v.impact || ''));
      const other = results.violations.filter((v) => !ACTIONABLE.has(v.impact || ''));
      for (const v of serious) actionable.push({ route: label, id: v.id, impact: v.impact || '?', help: v.help, count: v.nodes.length });
      for (const v of other) informational.push({ route: label, id: v.id, impact: v.impact || '?', help: v.help, count: v.nodes.length });
      log(`- ${label}: ${serious.length} actionable, ${other.length} informational`);
    } catch (e) {
      log(`- ⚠️ ${label} — axe failed: ${e instanceof Error ? e.message : e}`);
    }
  }

  log('');
  if (actionable.length) {
    log(`## 🔴 Actionable (serious/critical) — ${actionable.length}`);
    for (const f of actionable) log(`- **[${f.impact}] ${f.id}** ×${f.count} — ${f.route} — ${f.help}`);
  } else {
    log(`## ✅ No serious/critical a11y violations`);
  }
  if (informational.length) {
    log(`\n## ℹ️ Informational (moderate/minor) — ${informational.length}`);
    for (const f of informational.slice(0, 20)) log(`- [${f.impact}] ${f.id} ×${f.count} — ${f.route} — ${f.help}`);
  }
  log(`\n**Summary: ${actionable.length} actionable · ${informational.length} informational.**`);

  mkdirSync(join(process.cwd(), 'output'), { recursive: true });
  writeFileSync(
    join(process.cwd(), 'output/a11y-health.json'),
    JSON.stringify({ generatedAt: new Date().toISOString(), base: BASE, actionable, informational }, null, 2),
  );
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, report.join('\n') + '\n');
}

main().catch((e) => {
  console.error('check-a11y failed:', e);
  process.exit(1);
});
