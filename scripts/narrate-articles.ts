// Generate audio narrations for recent articles → power the Listen page.
//
//   npx tsx scripts/narrate-articles.ts [--since 14] [--limit N] [--force]
//
// Picks recent articles without a narration (tracked in data/audio-manifest.json),
// synthesizes an mp3 via the TTS provider (lib/narrate.ts), writes it to
// public/article-audio/<slug>.mp3, and records the manifest entry. No-ops when
// TTS_API_KEY is unset, so it's safe to schedule before secrets exist.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { getAllArticles } from '../lib/articles';
import { narrate } from '../lib/narrate';

const AUDIO_DIR = join(process.cwd(), 'public', 'article-audio');
const MANIFEST = join(process.cwd(), 'data', 'audio-manifest.json');

interface Narration {
  slug: string;
  title: string;
  category: string;
  audioUrl: string;
  excerpt: string;
  createdAt: string;
}

function arg(name: string, fallback?: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : fallback;
}

async function main() {
  const force = process.argv.includes('--force');
  const sinceDays = parseInt(arg('since', '14')!, 10);
  const limit = arg('limit') ? parseInt(arg('limit')!, 10) : Infinity;

  if (!process.env.TTS_API_KEY) {
    console.log('\n🔇 TTS_API_KEY unset — narrator is a no-op. Set it to enable audio.\n');
    return;
  }

  const manifest = JSON.parse(readFileSync(MANIFEST, 'utf-8')) as { narrations: Narration[] };
  const done = new Set(manifest.narrations.map((n) => n.slug));
  const cutoff = Date.now() - sinceDays * 24 * 60 * 60 * 1000;

  const candidates = getAllArticles()
    .filter((a) => new Date(a.publishedAt).getTime() >= cutoff && (force || !done.has(a.slug)))
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, limit);

  if (candidates.length === 0) {
    console.log('\nℹ️  No new articles to narrate.\n');
    return;
  }
  console.log(`\n🎙️  Narrating ${candidates.length} article(s)…\n`);
  if (!existsSync(AUDIO_DIR)) mkdirSync(AUDIO_DIR, { recursive: true });

  let made = 0;
  for (const a of candidates) {
    const mp3 = await narrate({ title: a.title, excerpt: a.excerpt, content: a.content });
    if (!mp3) {
      console.log(`   ✗ ${a.slug}`);
      continue;
    }
    const filename = `${a.slug}.mp3`;
    writeFileSync(join(AUDIO_DIR, filename), mp3);
    const entry: Narration = {
      slug: a.slug,
      title: a.title,
      category: a.category,
      audioUrl: `/article-audio/${filename}`,
      excerpt: a.excerpt,
      createdAt: new Date().toISOString(),
    };
    manifest.narrations = manifest.narrations.filter((n) => n.slug !== a.slug).concat(entry);
    made++;
    console.log(`   ✓ ${a.slug} → ${(mp3.length / 1024).toFixed(0)}kb`);
  }

  if (made > 0) {
    writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
    console.log(`\n✅ Narrated ${made} article(s). Commit data/audio-manifest.json + public/article-audio.\n`);
  } else {
    console.log('\nℹ️  No narrations produced.\n');
  }
}

main().catch((err) => {
  console.error('❌ narrate-articles failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
