#!/usr/bin/env node
/**
 * SEO & structured-data integrity check.
 *
 * SEO is the moat for a depth-led publication, so a silent regression here is
 * expensive. This validates the LIVE site (what crawlers actually see):
 *   1. every URL in sitemap.xml resolves 200 (a 404 in the sitemap is SEO poison)
 *   2. key page types carry valid, parseable JSON-LD structured data
 *   3. key pages have an og:image and a canonical link
 *   4. robots.txt and llms.txt resolve
 *
 * Read-only. Targets production by default; override with SEO_BASE_URL to point
 * at a preview deploy.
 *
 *   npx tsx scripts/check-seo.ts
 *   SEO_BASE_URL=https://preview.example.com npx tsx scripts/check-seo.ts
 *   npx tsx scripts/check-seo.ts --sample 25   # cap sitemap URL checks (quick run)
 */

import { writeFileSync, mkdirSync, appendFileSync } from 'fs';
import { join } from 'path';

const BASE = (process.env.SEO_BASE_URL || 'https://www.monokromatik.com').replace(/\/$/, '');
const UA = 'Mozilla/5.0 MonoKromatikSeoWatchdog';
const CONCURRENCY = 10;
const sampleArg = process.argv.indexOf('--sample');
const SAMPLE = sampleArg >= 0 ? Number(process.argv[sampleArg + 1]) || 0 : 0;

const problems: string[] = [];
const report: string[] = [];
const log = (s: string) => {
  console.log(s);
  report.push(s);
};

async function get(url: string, method: 'GET' | 'HEAD' = 'GET') {
  return fetch(url, { method, headers: { 'User-Agent': UA }, redirect: 'follow', signal: AbortSignal.timeout(15_000) });
}

async function checkSitemap(): Promise<string[]> {
  const res = await get(`${BASE}/sitemap.xml`);
  if (!res.ok) {
    problems.push(`sitemap.xml did not resolve (HTTP ${res.status})`);
    return [];
  }
  const xml = await res.text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  log(`Sitemap: ${locs.length} URLs`);
  return locs;
}

async function checkUrlsResolve(urls: string[]) {
  let checked = urls;
  if (SAMPLE > 0) checked = urls.slice(0, SAMPLE);
  let ok = 0;
  const broken: { url: string; status: string }[] = [];
  for (let i = 0; i < checked.length; i += CONCURRENCY) {
    const batch = checked.slice(i, i + CONCURRENCY);
    await Promise.all(
      batch.map(async (u) => {
        try {
          const r = await get(u);
          if (r.ok) ok++;
          else broken.push({ url: u, status: `HTTP ${r.status}` });
        } catch (e) {
          broken.push({ url: u, status: e instanceof Error ? e.message : 'unreachable' });
        }
      }),
    );
  }
  log(`\nSitemap URL resolution: ${ok} ok · ${broken.length} broken`);
  for (const b of broken) {
    problems.push(`sitemap URL broken (${b.status}): ${b.url}`);
    log(`- 🔴 ${b.status} — ${b.url}`);
  }
}

async function checkPageSeo(path: string, label: string) {
  try {
    const r = await get(`${BASE}${path}`);
    if (!r.ok) {
      problems.push(`${label} (${path}) did not resolve: HTTP ${r.status}`);
      return;
    }
    const html = await r.text();
    // JSON-LD: every block must parse.
    const blocks = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]);
    if (blocks.length === 0) {
      problems.push(`${label}: no JSON-LD structured data`);
    } else {
      for (const b of blocks) {
        try {
          JSON.parse(b);
        } catch {
          problems.push(`${label}: invalid JSON-LD (parse failed)`);
          break;
        }
      }
    }
    if (!/<meta[^>]+property=["']og:image["']/i.test(html)) problems.push(`${label}: missing og:image`);
    if (!/<link[^>]+rel=["']canonical["']/i.test(html)) problems.push(`${label}: missing canonical`);
    log(`- ${label}: ${blocks.length} JSON-LD block(s), og:image ${/og:image/i.test(html) ? '✓' : '✗'}, canonical ${/rel=["']canonical/i.test(html) ? '✓' : '✗'}`);
  } catch (e) {
    problems.push(`${label} (${path}) check threw: ${e instanceof Error ? e.message : e}`);
  }
}

async function main() {
  log(`# SEO & structured-data check — ${BASE}`);

  const locs = await checkSitemap();
  if (locs.length) await checkUrlsResolve(locs);

  // Sample one of each major page type for structured-data + meta checks.
  log(`\n## Structured data + meta (sampled page types)`);
  const samples: [string, string][] = [
    ['/', 'home'],
    ['/intelligence/signal-index', 'index'],
    ['/intelligence/case-studies', 'case-studies'],
  ];
  // First real article + case study from the sitemap, if present.
  const firstArticle = locs.find((u) => u.includes('/article/'));
  const firstCase = locs.find((u) => u.includes('/case-studies/') && !u.endsWith('/case-studies'));
  const firstReport = locs.find((u) => /\/reports\/[^/]+$/.test(u));
  if (firstArticle) samples.push([new URL(firstArticle).pathname, 'article']);
  if (firstCase) samples.push([new URL(firstCase).pathname, 'case-study']);
  if (firstReport) samples.push([new URL(firstReport).pathname, 'report']);
  for (const [p, label] of samples) await checkPageSeo(p, label);

  // Crawl-control files.
  log(`\n## Crawl files`);
  for (const f of ['/robots.txt', '/llms.txt']) {
    try {
      const r = await get(`${BASE}${f}`);
      if (!r.ok) problems.push(`${f} did not resolve: HTTP ${r.status}`);
      log(`- ${f}: ${r.ok ? '✓' : '🔴 ' + r.status}`);
    } catch {
      problems.push(`${f} unreachable`);
    }
  }

  log(`\n**Summary: ${problems.length} problem(s).**`);
  mkdirSync(join(process.cwd(), 'output'), { recursive: true });
  writeFileSync(
    join(process.cwd(), 'output/seo-health.json'),
    JSON.stringify({ generatedAt: new Date().toISOString(), base: BASE, problems }, null, 2),
  );
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, report.join('\n') + '\n');
}

main().catch((e) => {
  console.error('check-seo failed:', e);
  process.exit(1);
});
