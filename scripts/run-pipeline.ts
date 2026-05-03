#!/usr/bin/env node

/**
 * MonoKromatik Master Pipeline
 *
 * Single entry point that runs the entire agent fleet:
 *   Scout → PreFilter → Curator → Writer → ImageSourcer → SEOOptimizer → Publisher → Distributor → Analytics
 *
 * Usage:
 *   npm run pipeline                    # full run, publishes to git
 *   npm run pipeline -- --dry-run       # generate everything, don't commit
 *   npm run pipeline -- --limit 3       # only generate 3 articles
 *   npm run pipeline -- --no-publish    # skip git commit/push
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fetchMonoKromatikStories, getMediaStats } from '../lib/fetch-stories';
import { preFilterStories, curateStories } from '../lib/curate-stories';
import { generateArticles } from '../lib/generate-article';
import { sourceImage } from '../lib/source-image';
import { optimizeSEO } from '../lib/optimize-seo';
import { publishArticles } from '../lib/publish-article';
import { distributeArticles } from '../lib/distribute-social';
import { generatePerformanceReport } from '../lib/analyze-performance';

// ─── Env loader ───────────────────────────────────────────────────────────
const envPath = join(process.cwd(), '.env.local');
if (existsSync(envPath)) {
  const envFile = readFileSync(envPath, 'utf-8');
  envFile.split('\n').forEach((line) => {
    const m = line.match(/^([^#][^=]+)=(.+)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  });
}

// ─── Args ─────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const NO_PUBLISH = args.includes('--no-publish') || DRY_RUN;
const limitFlag = args.indexOf('--limit');
const LIMIT = limitFlag >= 0 ? parseInt(args[limitFlag + 1] || '3', 10) : 3;

// ─── Output dir ───────────────────────────────────────────────────────────
const outputDir = join(process.cwd(), 'output');
if (!existsSync(outputDir)) mkdirSync(outputDir);

// ─── Logger ───────────────────────────────────────────────────────────────
const log = {
  step: (n: number, total: number, label: string) => {
    console.log(`\n${'━'.repeat(60)}`);
    console.log(`STEP ${n}/${total}: ${label}`);
    console.log(`${'━'.repeat(60)}`);
  },
  done: (msg: string) => console.log(`   ✅ ${msg}`),
  warn: (msg: string) => console.log(`   ⚠️  ${msg}`),
  err: (msg: string) => console.log(`   ❌ ${msg}`),
};

// ─── Main ─────────────────────────────────────────────────────────────────
async function main() {
  const startTime = Date.now();

  console.log(`
╔════════════════════════════════════════════════════════════╗
║         🤖  MONOKROMATIK AGENT PIPELINE                    ║
║         Mode: ${DRY_RUN ? 'DRY-RUN' : NO_PUBLISH ? 'NO-PUBLISH' : 'FULL-PUBLISH'.padEnd(11)} · Limit: ${String(LIMIT).padEnd(2)} articles               ║
╚════════════════════════════════════════════════════════════╝`);

  if (!process.env.ANTHROPIC_API_KEY) {
    log.err('ANTHROPIC_API_KEY missing in .env.local');
    process.exit(1);
  }

  const TOTAL_STEPS = 8;

  // ─── 1. Scout ──────────────────────────────────────────────────────
  log.step(1, TOTAL_STEPS, 'SCOUT — fetch RSS feeds');
  const allStories = await fetchMonoKromatikStories();
  if (allStories.length === 0) {
    log.err('No stories fetched. Aborting.');
    process.exit(1);
  }
  const stats = getMediaStats(allStories);
  log.done(`${allStories.length} stories · ${stats.imagePercentage}% with images`);

  // ─── 2. Pre-filter ─────────────────────────────────────────────────
  log.step(2, TOTAL_STEPS, 'PRE-FILTER — remove negative/conflict content');
  const filtered = preFilterStories(allStories);
  log.done(`${filtered.length} stories survived (filtered ${allStories.length - filtered.length})`);

  // ─── 3. Curate ─────────────────────────────────────────────────────
  log.step(3, TOTAL_STEPS, 'CURATOR — Claude scores diaspora relevance');
  const curated = await curateStories(filtered, LIMIT);
  if (curated.length === 0) {
    log.err('Curator returned 0 stories. Aborting.');
    process.exit(1);
  }
  writeFileSync(join(outputDir, 'curated-stories.json'), JSON.stringify(curated, null, 2));
  log.done(`${curated.length} stories curated`);

  // ─── 4. Write ──────────────────────────────────────────────────────
  log.step(4, TOTAL_STEPS, 'WRITER — Claude drafts full articles');
  const articles = await generateArticles(curated.slice(0, LIMIT));
  if (articles.length === 0) {
    log.err('Writer returned 0 articles. Aborting.');
    process.exit(1);
  }
  log.done(`${articles.length} articles drafted`);

  // ─── 5. Source images ──────────────────────────────────────────────
  log.step(5, TOTAL_STEPS, 'IMAGE SOURCER — fill missing hero images');
  for (const article of articles) {
    article.imageUrl = await sourceImage({
      existingUrl: article.imageUrl,
      title: article.title,
      excerpt: article.excerpt,
      category: article.category,
    });
  }
  log.done(`${articles.length} articles have images`);

  // ─── 6. SEO ────────────────────────────────────────────────────────
  log.step(6, TOTAL_STEPS, 'SEO OPTIMIZER — slugs, meta, headlines');
  for (const article of articles) {
    const seo = await optimizeSEO({
      title: article.title,
      excerpt: article.excerpt,
      content: article.content,
      category: article.category,
      tags: article.tags,
    });
    if (seo.optimizedSlug) article.slug = seo.optimizedSlug;
    if (seo.metaDescription) article.excerpt = seo.metaDescription;
    // We keep the original title (the writer agent already optimised tone). SEO variants
    // are saved separately for A/B testing.
  }
  writeFileSync(join(outputDir, 'generated-articles.json'), JSON.stringify(articles, null, 2));
  log.done(`SEO pass complete`);

  // ─── 7. Publish ────────────────────────────────────────────────────
  log.step(7, TOTAL_STEPS, `PUBLISHER — merge + ${NO_PUBLISH ? 'SKIP commit (no-publish)' : 'commit + push'}`);
  const result = publishArticles(articles, NO_PUBLISH);
  log.done(`${result.merged} new · ${result.skipped} dedup-skipped · ${result.total} total in store`);
  if (result.pushed) log.done('Pushed to GitHub. Vercel building.');

  // ─── 8. Distribute ─────────────────────────────────────────────────
  log.step(8, TOTAL_STEPS, 'DISTRIBUTION — generate social posts');
  const newArticles = articles.slice(0, result.merged);
  if (newArticles.length > 0) {
    await distributeArticles(newArticles);
    log.done(`Social queue updated`);
  } else {
    log.warn('No new articles to distribute (all were duplicates).');
  }

  // ─── Bonus: refresh perf report (no-op until GA4 wired) ────────────
  console.log('\n   🔁 Refreshing performance report...');
  await generatePerformanceReport(7);

  // ─── Summary ───────────────────────────────────────────────────────
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`
╔════════════════════════════════════════════════════════════╗
║         ✅  PIPELINE COMPLETE                              ║
║         Elapsed: ${elapsed.padStart(5)}s · Published: ${String(result.merged).padStart(2)} · Skipped: ${String(result.skipped).padStart(2)}        ║
╚════════════════════════════════════════════════════════════╝
`);
}

main().catch((e) => {
  console.error('\n❌ PIPELINE FAILED:', e instanceof Error ? e.stack : e);
  process.exit(1);
});
