// Backfill official/relevant video onto already-published articles.
//
//   npx tsx scripts/backfill-video.ts [--since N] [--limit N] [--force] [--dry-run]
//
// The live pipeline already attaches video at generation time (publisher embed →
// YouTube → Pexels stock). This applies the same chain to the existing back
// catalogue now that YOUTUBE_API_KEY / PEXELS_API_KEY are set. Idempotent: skips
// articles that already have a videoUrl unless --force. --dry-run reports what it
// would attach without writing, so you can review relevance before committing.

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { sourceArticleVideo } from '../lib/source-media';

const ARTICLES = join(process.cwd(), 'data', 'articles.json');

interface Article {
  title: string;
  slug: string;
  category: string;
  sourceLink: string;
  sourceName: string;
  publishedAt: string;
  videoUrl?: string;
  videoType?: 'embed' | 'file';
  videoCredit?: string;
  videoSourceUrl?: string;
  [k: string]: unknown;
}

function arg(name: string, fallback?: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : fallback;
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const force = process.argv.includes('--force');
  const sinceDays = arg('since') ? parseInt(arg('since')!, 10) : undefined;
  const limit = arg('limit') ? parseInt(arg('limit')!, 10) : Infinity;

  if (!process.env.YOUTUBE_API_KEY && !process.env.PEXELS_API_KEY) {
    console.log('\n⚠️  Neither YOUTUBE_API_KEY nor PEXELS_API_KEY set — nothing to source. No-op.\n');
    return;
  }

  const articles = JSON.parse(readFileSync(ARTICLES, 'utf-8')) as Article[];
  const cutoff = sinceDays ? Date.now() - sinceDays * 24 * 60 * 60 * 1000 : 0;

  const candidates = articles
    .filter((a) => force || !a.videoUrl)
    .filter((a) => !sinceDays || new Date(a.publishedAt).getTime() >= cutoff)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, limit);

  console.log(`\n🎬 Backfill video${dryRun ? ' (dry-run)' : ''} — ${candidates.length} candidate article(s)\n`);
  if (candidates.length === 0) {
    console.log('ℹ️  Every article already has a video (use --force to re-source).\n');
    return;
  }

  let attached = 0;
  for (const a of candidates) {
    const video = await sourceArticleVideo({
      sourceLink: a.sourceLink,
      sourceName: a.sourceName,
      title: a.title,
      category: a.category,
    });
    if (!video) {
      console.log(`   – ${a.slug}: no video found`);
      continue;
    }
    const videoType = video.kind === 'file' ? 'file' : 'embed';
    console.log(`   ✓ ${a.slug}: [${video.provider}] ${video.url.slice(0, 60)}`);
    if (!dryRun) {
      a.videoUrl = video.url;
      a.videoType = videoType;
      a.videoCredit = video.credit;
      a.videoSourceUrl = video.sourceUrl;
    }
    attached++;
    // Stay well under the YouTube 10k-unit/day quota (~100 units/search).
    await new Promise((r) => setTimeout(r, 400));
  }

  if (!dryRun && attached > 0) {
    writeFileSync(ARTICLES, JSON.stringify(articles, null, 2) + '\n');
    console.log(`\n✅ Attached video to ${attached} article(s). Commit data/articles.json.\n`);
  } else {
    console.log(`\nℹ️  ${dryRun ? `Dry-run: ${attached} would be attached.` : 'No videos attached.'}\n`);
  }
}

main().catch((err) => {
  console.error('❌ backfill-video failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
