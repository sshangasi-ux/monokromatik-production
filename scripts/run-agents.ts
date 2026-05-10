#!/usr/bin/env node
/**
 * MonoKromatik Agent Orchestrator
 * The "always-on" newsroom. Runs Scout → Curator → Writer → Publisher.
 *
 * Usage:
 *   npm run agents                # Run with default settings (3 articles)
 *   npm run agents -- --count=5   # Generate 5 articles
 *   npm run agents -- --dry       # Skip the git commit + deploy
 *   npm run agents -- --no-push   # Commit but don't push (local test)
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import { fetchMonoKromatikStories, getMediaStats } from '../lib/fetch-stories';
import { preFilterStories, curateStories } from '../lib/curate-stories';
import { dedupeAgainstPublished } from '../lib/dedupe-stories';
import { generateArticles } from '../lib/generate-article';
import type { GeneratedArticle } from '../lib/generate-article';
import { stylizeBatch } from '../lib/stylist';
import { sourceImage } from '../lib/source-image';

// Load .env.local (so this script works locally)
// In CI, the env is provided by GitHub Actions secrets
const envPath = join(__dirname, '../.env.local');
if (existsSync(envPath)) {
  readFileSync(envPath, 'utf-8')
    .split('\n')
    .forEach((line) => {
      const m = line.match(/^([^#=][^=]*)=(.+)$/);
      if (m) process.env[m[1].trim()] = m[2].trim();
    });
}

// CLI flags
const args = process.argv.slice(2);
const COUNT = parseInt(
  args.find((a) => a.startsWith('--count='))?.split('=')[1] || '3',
  10
);
const DRY_RUN = args.includes('--dry');
const NO_PUSH = args.includes('--no-push');

const REPO_ROOT = join(__dirname, '..');
const ARTICLES_PATH = join(REPO_ROOT, 'data/articles.json');

// Helpers
const ts = () => new Date().toISOString();
const log = (msg: string) => console.log(`[${ts()}] ${msg}`);
const sh = (cmd: string) =>
  execSync(cmd, { cwd: REPO_ROOT, stdio: ['inherit', 'pipe', 'pipe'] }).toString().trim();

interface ExistingArticle extends GeneratedArticle {}

async function main() {
  log('🚀 MonoKromatik Agent Pipeline Starting');
  log(`   Target: ${COUNT} new articles | Dry run: ${DRY_RUN} | No push: ${NO_PUSH}`);

  // Sanity: API key
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY.startsWith('your_')) {
    throw new Error('ANTHROPIC_API_KEY not set. Add it to .env.local or GitHub secrets.');
  }

  // 1. Load existing articles for dedupe
  const existing: ExistingArticle[] = existsSync(ARTICLES_PATH)
    ? JSON.parse(readFileSync(ARTICLES_PATH, 'utf-8'))
    : [];
  const existingTitles = new Set(existing.map((a) => normalizeTitle(a.title)));
  const existingSlugs = new Set(existing.map((a) => a.slug));
  const existingSourceLinks = new Set(existing.map((a) => a.sourceLink));
  log(`   Currently published: ${existing.length} articles`);

  // 2. Scout — fetch from RSS
  log('\n📡 [SCOUT] Fetching stories from 20+ African RSS feeds...');
  const allStories = await fetchMonoKromatikStories();
  if (allStories.length === 0) throw new Error('Scout returned 0 stories — check RSS feeds');
  const stats = getMediaStats(allStories);
  log(
    `   Found ${stats.total} stories | ${stats.imagePercentage}% with images, ${stats.videoPercentage}% with videos`
  );

  // 3. Pre-filter — drop obvious negatives
  log('\n🔍 [SCOUT] Pre-filtering negative narratives...');
  const filtered = preFilterStories(allStories);
  log(`   ${allStories.length - filtered.length} stories filtered out (negative keywords)`);

  // 4. Dedupe — drop stories we already covered (lexical: title/source-link match)
  const fresh = filtered.filter(
    (s) =>
      !existingTitles.has(normalizeTitle(s.title)) &&
      !existingSourceLinks.has(s.link)
  );
  log(`   ${filtered.length - fresh.length} duplicates skipped | ${fresh.length} fresh stories`);

  if (fresh.length === 0) {
    log('   ⚠️  No fresh stories today. Exiting cleanly.');
    return;
  }

  // 4b. Subject-level dedupe — Claude compares each fresh candidate against
  // the last 14 days of published articles and rejects same-subject coverage.
  // This catches the case where the agents would otherwise write a third
  // headline about the same album release / same match / same news cycle.
  log('\n🔁 [DEDUPER] Subject-level dedupe (last 14 days)...');
  const dedupe = await dedupeAgainstPublished(
    fresh,
    existing.map((a) => ({
      title: a.title,
      excerpt: a.excerpt,
      publishedAt: a.publishedAt,
      slug: a.slug,
    }))
  );
  const novel = dedupe.novel;

  if (novel.length === 0) {
    log('   ⚠️  All candidates were subject-level duplicates of recent articles. Exiting.');
    return;
  }

  // 5. Curator — Claude scores by diaspora relevance
  log('\n🤖 [CURATOR] Scoring stories with Claude...');
  // Get 2x the count to give Writer fallback options if some fail
  const curated = await curateStories(novel, COUNT * 2);
  log(`   Curator returned ${curated.length} ranked stories`);

  if (curated.length === 0) {
    log('   ⚠️  Curator found nothing worth covering. Exiting.');
    return;
  }

  // 6. Writer — Claude drafts articles
  log('\n✍️  [WRITER] Generating articles in MonoKromatik voice...');
  const generated = await generateArticles(curated.slice(0, COUNT));
  if (generated.length === 0) {
    throw new Error('Writer produced 0 articles — check Claude API logs');
  }
  log(`   Generated ${generated.length} articles`);

  // 6b. Stylist — rewrite drafts in MonoKromatik voice profile
  log('\n🎤 [STYLIST] Rewriting drafts through voice profile...');
  const stylized = await stylizeBatch(
    generated.map((g) => ({
      title: g.title,
      excerpt: g.excerpt,
      content: g.content,
      category: g.category,
      tags: g.tags,
      sourceLink: g.sourceLink,
      sourceName: g.sourceName,
    })),
    {
      concurrency: 3,
      onProgress: (done, total, latest) => {
        const status = latest.stylistNote?.startsWith('STYLIST FAILED') ? '❌' : '✅';
        log(`   [${done}/${total}] ${status} ${latest.title.slice(0, 70)}`);
      },
    }
  );

  // Merge Stylist output back onto Writer output. If Stylist failed for an
  // article, we ship the Writer's original (the Stylist preserves draft on
  // failure via _original). The article's slug, imageUrl, sourceLink etc.
  // come from the Writer; the title/excerpt/content come from the Stylist.
  const stylistFailures = stylized.filter((s) =>
    s.stylistNote?.startsWith('STYLIST FAILED')
  ).length;
  if (stylistFailures > 0) {
    log(`   ⚠️  ${stylistFailures} article(s) failed Stylist; will publish Writer drafts.`);
  }

  const written: GeneratedArticle[] = generated.map((draft, i) => {
    const s = stylized[i];
    if (s.stylistNote?.startsWith('STYLIST FAILED')) {
      return draft;
    }
    return {
      ...draft,
      title: s.title,
      excerpt: s.excerpt,
      content: s.content,
    };
  });

  // 6c. Image Sourcer — validate the existing image, then scrape the
  // sourceLink's og:image (real editorial photo from the source publication),
  // falling back to Pexels/Unsplash only if those fail. This keeps every
  // article visually rich with real subject photography rather than generic
  // stock that breaks the publication's editorial tone.
  log('\n🖼️  [IMAGE SOURCER] Validating + sourcing hero images...');
  for (let i = 0; i < written.length; i++) {
    const article = written[i];
    const result = await sourceImage({
      existingUrl: article.imageUrl,
      sourceLink: article.sourceLink,
      title: article.title,
      excerpt: article.excerpt,
      category: article.category,
    });
    written[i] = { ...article, imageUrl: result.url };
    log(`   [${i + 1}/${written.length}] ${result.source.padEnd(15)} → ${article.title.slice(0, 55)}`);
  }

  // 7. Publisher — slug uniqueness
  const newArticles: ExistingArticle[] = [];
  for (const article of written) {
    let slug = article.slug;
    let attempt = 1;
    while (existingSlugs.has(slug)) {
      slug = `${article.slug}-${attempt++}`;
    }
    existingSlugs.add(slug);
    // Annotate that this article was voice-refreshed at publish time —
    // matches the field used by scripts/refresh-voice.ts so retroactive
    // and live runs share the same schema.
    const stylized_i = stylized[written.indexOf(article)];
    const enriched: ExistingArticle = {
      ...article,
      slug,
      ...(stylized_i?.stylistNote && !stylized_i.stylistNote.startsWith('STYLIST FAILED')
        ? {
            voiceRefreshedAt: new Date().toISOString(),
            stylistNote: stylized_i.stylistNote,
          }
        : {}),
    } as ExistingArticle;
    newArticles.push(enriched);
  }

  // 8. Merge — newest first
  const merged = [...newArticles, ...existing];

  if (DRY_RUN) {
    log(`\n🟡 DRY RUN — articles staged in memory only. Skipping data/articles.json write.`);
    return summarize(newArticles);
  }

  writeFileSync(ARTICLES_PATH, JSON.stringify(merged, null, 2));
  log(`\n💾 [PUBLISHER] Wrote ${merged.length} total articles to data/articles.json`);

  // 9. Git commit + push (this triggers Vercel auto-deploy)

  log('\n🚀 [PUBLISHER] Committing to git...');
  try {
    sh('git config user.email "agents@monokromatik.com"');
    sh('git config user.name "MonoKromatik Agent"');
    sh('git add data/articles.json');

    // Check if there are actual changes to commit
    try {
      sh('git diff --cached --exit-code');
      log('   ⚠️  No changes to commit (file unchanged)');
      return summarize(newArticles);
    } catch {
      // exit code 1 means there ARE changes — that's what we want
    }

    const titles = newArticles.map((a) => `• ${a.title}`).join('\n');
    const commitMsg = `feat(agents): publish ${newArticles.length} new article${
      newArticles.length === 1 ? '' : 's'
    }\n\n${titles}\n\n🤖 Generated by MonoKromatik agent pipeline`;

    sh(`git commit -m ${JSON.stringify(commitMsg)}`);
    log('   ✅ Committed');

    if (NO_PUSH) {
      log('   🟡 NO PUSH — commit local only. Run `git push` to deploy.');
    } else {
      sh('git push origin main');
      log('   ✅ Pushed to origin/main. Vercel auto-deploy in ~2 minutes.');
    }
  } catch (err) {
    log(`   ❌ Git operation failed: ${err instanceof Error ? err.message : err}`);
    throw err;
  }

  summarize(newArticles);
}

function normalizeTitle(t: string): string {
  return t.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
}

function summarize(newArticles: ExistingArticle[]) {
  log('\n' + '='.repeat(60));
  log('✅ PIPELINE COMPLETE');
  log('='.repeat(60));
  newArticles.forEach((a, i) => {
    log(`   ${i + 1}. [${a.category}] ${a.title}`);
    log(`      → https://www.monokromatik.com/article/${a.slug}`);
  });
}

main().catch((err) => {
  console.error('\n❌ AGENT PIPELINE FAILED:', err);
  process.exit(1);
});
