// Auto-distribute recently published articles to social channels.
//
//   npx tsx scripts/distribute.ts [--since 2] [--limit N] [--dry-run]
//
// Picks articles published in the last `--since` days that haven't been posted
// yet (tracked in data/social-log.json), generates voice-matched posts via the
// Distribution agent, and delivers them through every configured channel
// (SOCIAL_WEBHOOK_URL and/or X_ACCESS_TOKEN — see lib/post-social.ts). With no
// channel configured it runs as a no-op, so it's safe to schedule before
// secrets are added. Idempotent: the log prevents re-posting.

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { getAllArticles } from '../lib/articles';
import { generateSocial } from '../lib/distribute-social';
import type { GeneratedArticle } from '../lib/generate-article';
import { deliverPost, configuredChannels } from '../lib/post-social';

const LOG_PATH = join(process.cwd(), 'data', 'social-log.json');

function arg(name: string, fallback?: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : fallback;
}

interface SocialLog {
  posted: { slug: string; at: string; channels: string[] }[];
}

function loadLog(): SocialLog {
  try {
    return JSON.parse(readFileSync(LOG_PATH, 'utf-8')) as SocialLog;
  } catch {
    return { posted: [] };
  }
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const sinceDays = parseInt(arg('since', '2')!, 10);
  const limit = arg('limit') ? parseInt(arg('limit')!, 10) : Infinity;

  const channels = configuredChannels();
  console.log(`\n📣 Distribute${dryRun ? ' (dry-run)' : ''} — channels: ${channels.length ? channels.join(', ') : 'NONE (no-op)'}\n`);

  const log = loadLog();
  const postedSlugs = new Set(log.posted.map((p) => p.slug));
  const cutoff = Date.now() - sinceDays * 24 * 60 * 60 * 1000;

  const candidates = getAllArticles()
    .filter((a) => new Date(a.publishedAt).getTime() >= cutoff && !postedSlugs.has(a.slug))
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, limit);

  if (candidates.length === 0) {
    console.log('ℹ️  Nothing new to distribute.\n');
    return;
  }
  console.log(`Found ${candidates.length} undistributed article(s) from the last ${sinceDays}d.\n`);

  let delivered = 0;
  for (const article of candidates) {
    const post = await generateSocial(article as unknown as GeneratedArticle);
    const results = await deliverPost(
      {
        articleSlug: post.articleSlug,
        articleUrl: post.articleUrl,
        twitterThread: post.twitterThread,
        instagramCaption: post.instagramCaption,
        hashtags: post.hashtags,
      },
      dryRun,
    );
    const ok = results.some((r) => r.ok);
    const summary = results.map((r) => `${r.channel}:${r.ok ? '✓' : '✗'}(${r.detail})`).join(' ');
    console.log(`   ${ok ? '✓' : '✗'} ${article.slug} → ${summary}`);

    if (ok && !dryRun) {
      log.posted.push({ slug: article.slug, at: new Date().toISOString(), channels: results.filter((r) => r.ok).map((r) => r.channel) });
      delivered++;
    }
  }

  if (delivered > 0) {
    writeFileSync(LOG_PATH, JSON.stringify(log, null, 2) + '\n');
    console.log(`\n✅ Distributed ${delivered} article(s). Commit data/social-log.json.\n`);
  } else {
    console.log(`\nℹ️  ${dryRun ? 'Dry-run complete.' : 'No deliveries recorded.'}\n`);
  }
}

main().catch((err) => {
  console.error('❌ distribute failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
