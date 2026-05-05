#!/usr/bin/env tsx
/**
 * Refresh existing articles through the MonoKromatik voice profile.
 *
 * Usage:
 *   tsx scripts/refresh-voice.ts            # rewrite all articles
 *   tsx scripts/refresh-voice.ts --dry      # show what would change without writing
 *   tsx scripts/refresh-voice.ts --slug=X   # rewrite just one article by slug
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { stylizeBatch, DraftArticle, StylizedArticle } from '../lib/stylist';

const envPath = join(__dirname, '../.env.local');
if (existsSync(envPath)) {
  readFileSync(envPath, 'utf-8').split('\n').forEach((line) => {
    const m = line.match(/^([^#=][^=]*)=(.+)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  });
}

const REPO_ROOT = join(__dirname, '..');
const ARTICLES_PATH = join(REPO_ROOT, 'data/articles.json');

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry');
const ONE_SLUG = args.find((a) => a.startsWith('--slug='))?.split('=')[1];

interface ExistingArticle extends DraftArticle {
  slug: string;
  publishedAt: string;
  imageUrl?: string;
  videoUrl?: string;
  [key: string]: unknown;
}

function log(msg: string) {
  console.log(`[${new Date().toISOString().slice(11, 19)}] ${msg}`);
}

function preview(text: string, len = 80): string {
  const oneline = text.replace(/\s+/g, ' ').trim();
  return oneline.length <= len ? oneline : oneline.slice(0, len - 1) + '…';
}

async function main() {
  log('🎤 MonoKromatik Voice Refresh — beginning');
  log(`   Mode: ${DRY_RUN ? 'DRY RUN (no writes)' : 'LIVE'}`);
  if (ONE_SLUG) log(`   Filter: only slug "${ONE_SLUG}"`);

  const all: ExistingArticle[] = JSON.parse(readFileSync(ARTICLES_PATH, 'utf-8'));
  log(`   Loaded ${all.length} articles from data/articles.json`);

  const toRefresh = ONE_SLUG ? all.filter((a) => a.slug === ONE_SLUG) : all;
  if (ONE_SLUG && toRefresh.length === 0) {
    throw new Error(`No article found with slug "${ONE_SLUG}"`);
  }
  log(`   Will refresh ${toRefresh.length} article${toRefresh.length === 1 ? '' : 's'}`);

  const drafts: DraftArticle[] = toRefresh.map((a) => ({
    title: a.title,
    excerpt: a.excerpt,
    content: a.content,
    category: a.category,
    tags: a.tags,
    sourceLink: a.sourceLink as string | undefined,
    sourceName: a.sourceName as string | undefined,
  }));

  log('');
  log('🤖 Running Stylist agent (concurrency=3, prompt-caching enabled)…');

  const startTime = Date.now();
  const stylized = await stylizeBatch(drafts, {
    concurrency: 3,
    onProgress: (done, total, latest) => {
      const status = latest.stylistNote?.startsWith('STYLIST FAILED') ? '❌' : '✅';
      log(`   [${done}/${total}] ${status} ${preview(latest.title, 65)}`);
    },
  });
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  log('');
  log(`⏱  Completed in ${elapsed}s`);

  log('');
  log('📝 BEFORE / AFTER SUMMARY:');
  log('');
  for (let i = 0; i < stylized.length; i++) {
    const s = stylized[i];
    const orig = drafts[i];
    log(`#${i + 1} — ${orig.category.toUpperCase()}`);
    log(`   BEFORE  title:   ${preview(orig.title, 80)}`);
    log(`   AFTER   title:   ${preview(s.title, 80)}`);
    log(`   BEFORE  excerpt: ${preview(orig.excerpt, 100)}`);
    log(`   AFTER   excerpt: ${preview(s.excerpt, 100)}`);
    if (s.stylistNote) log(`   STYLIST: ${preview(s.stylistNote, 200)}`);
    log('');
  }

  if (DRY_RUN) {
    log('🟡 DRY RUN — not writing changes. Re-run without --dry to apply.');
    return;
  }

  const updated = all.map((article) => {
    const idx = toRefresh.findIndex((t) => t.slug === article.slug);
    if (idx === -1) return article;
    const s = stylized[idx];
    if (s.stylistNote?.startsWith('STYLIST FAILED')) {
      log(`⚠️  Keeping original for ${article.slug} — stylist failed`);
      return article;
    }
    return {
      ...article,
      title: s.title,
      excerpt: s.excerpt,
      content: s.content,
      voiceRefreshedAt: new Date().toISOString(),
      stylistNote: s.stylistNote,
    };
  });

  writeFileSync(ARTICLES_PATH, JSON.stringify(updated, null, 2));
  log(`💾 Wrote ${updated.length} articles back to data/articles.json`);
  log('');
  log('✅ Voice refresh complete.');
}

main().catch((err) => {
  console.error('\n❌ Voice refresh failed:', err);
  process.exit(1);
});
