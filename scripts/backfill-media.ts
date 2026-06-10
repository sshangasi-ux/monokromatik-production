// Backfill credited media onto the existing articles in data/articles.json:
// image credits + best-effort official/stock video, using the same reputable-
// first sourcer the live pipeline uses.
//
// Run where the media secrets + network exist (NOT the build sandbox):
//   npx tsx scripts/backfill-media.ts                 # source + write
//   npx tsx scripts/backfill-media.ts --dry-run       # report only, no write
//   npx tsx scripts/backfill-media.ts --only-missing  # skip already-credited
//   npx tsx scripts/backfill-media.ts --limit 5       # first N only
//
// Requires PEXELS_API_KEY / UNSPLASH_ACCESS_KEY for stock fallback; without them
// it still re-credits images from the original source page (reputable-first).

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { sourceMedia } from '../lib/source-media';
import type { Article } from '../lib/articles';

const ARTICLES_PATH = join(process.cwd(), 'data', 'articles.json');

function flagValue(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}
const DRY = process.argv.includes('--dry-run');
const ONLY_MISSING = process.argv.includes('--only-missing');
const LIMIT = Number(flagValue('--limit') || '0') || Infinity;

async function main() {
  const articles: Article[] = JSON.parse(readFileSync(ARTICLES_PATH, 'utf-8'));
  let processed = 0;
  let updated = 0;

  for (let i = 0; i < articles.length && processed < LIMIT; i++) {
    const a = articles[i];
    if (ONLY_MISSING && a.imageCredit) continue;
    processed++;
    try {
      const media = await sourceMedia({
        existingUrl: a.imageUrl,
        sourceLink: a.sourceLink,
        sourceName: a.sourceName,
        title: a.title,
        excerpt: a.excerpt,
        category: a.category,
      });
      articles[i] = {
        ...a,
        imageUrl: media.image.url,
        imageCredit: media.image.credit,
        imageSourceUrl: media.image.sourceUrl,
        ...(media.video
          ? {
              videoUrl: media.video.url,
              videoType: media.video.kind,
              videoCredit: media.video.credit,
              videoSourceUrl: media.video.sourceUrl,
            }
          : {}),
      };
      updated++;
      const vid = media.video ? ` +video(${media.video.kind})` : '';
      console.log(`[${i + 1}/${articles.length}] ${media.image.credit}${vid} — ${a.title.slice(0, 50)}`);
    } catch (err) {
      console.warn(`[${i + 1}] failed: ${(err as Error).message} — ${a.title.slice(0, 50)}`);
    }
  }

  console.log(`\nProcessed ${processed}, updated ${updated}.`);
  if (DRY) {
    console.log('Dry run — data/articles.json not written.');
    return;
  }
  writeFileSync(ARTICLES_PATH, JSON.stringify(articles, null, 2));
  console.log(`Wrote ${ARTICLES_PATH}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
