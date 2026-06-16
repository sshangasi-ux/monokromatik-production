// MonoKromatik Video Audit & Repair
//
// Re-verifies the video attached to every article in data/articles.json against
// its article, and CLEARS the video fields on any mismatch. This is the repair
// pass for the back catalogue: the live sourcer (lib/source-media.ts) now gates
// new videos through verifyVideoMatch, but the existing articles were attached
// before that gate existed and carry the mismatches we found (generic stock,
// wrong-subject YouTube hits).
//
// Policy (confirmed with the operator): empty beats wrong. A video that fails
// verification is REMOVED, not replaced — the slot goes empty rather than show
// something off-subject on an accuracy-led publication.
//
// Trust model, per video:
//   - Publisher's own embed (videoCredit "Video via <publisher>", sourceUrl is
//     the article's own source page): TRUSTED, kept without re-verification —
//     it came off the publisher's page for this exact story.
//   - Non-YouTube file/stock (videoType 'file', Pexels): DROPPED outright — the
//     generic-stock tier is retired; these are the Abuja-drone-style mismatches.
//   - YouTube embed: RE-VERIFIED through Composio + the judge; kept only on a
//     clear match.
//
// Run where COMPOSIO_API_KEY + ANTHROPIC_API_KEY + network exist (NOT the build
// sandbox):
//   npx tsx scripts/audit-video.ts --dry-run   # report keep/drop, write nothing
//   npx tsx scripts/audit-video.ts             # apply: clear mismatches, write
//   npx tsx scripts/audit-video.ts --limit 5   # first N only
//
// Fail-closed: if verification can't run (missing key, fetch failure), the
// video is treated as unverified and DROPPED. Re-runnable / idempotent: once a
// mismatch is cleared it simply has no video to check next time.

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Load .env.local into process.env BEFORE anything reads a key. tsx does not
// auto-load env files, and our keys live in .env.local (not .env), so without
// this the verifier sees no YOUTUBE_API_KEY / ANTHROPIC_API_KEY and fail-closes
// every video as "could not fetch". Hand-rolled (no dotenv dep); only sets vars
// not already present in the environment.
try {
  for (const line of readFileSync(join(process.cwd(), '.env.local'), 'utf-8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
} catch {
  // No .env.local (e.g. CI, where vars come from the environment directly) — fine.
}

import type { Article } from '../lib/articles';
import { verifyVideoMatch, youTubeId } from '../lib/verify-video';

const ARTICLES_PATH = join(process.cwd(), 'data', 'articles.json');

function flagValue(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}
const DRY = process.argv.includes('--dry-run');
const LIMIT = Number(flagValue('--limit') || '0') || Infinity;

/** Strip the four video fields from an article (the "clear" operation). */
function clearVideo(a: Article): Article {
  const { videoUrl, videoType, videoCredit, videoSourceUrl, ...rest } = a;
  void videoUrl;
  void videoType;
  void videoCredit;
  void videoSourceUrl;
  return rest as Article;
}

/**
 * Is this video the publisher's OWN embed for this exact story? Those come off
 * the source page itself and are inherently aligned, so we keep them without
 * spending a verification call. Heuristic: the credit is the "Video via <X>"
 * form the official-video sourcer emits (not "Video: <channel> / YouTube",
 * which is the unverified search tier), AND the video's source URL is the
 * article's own source link.
 */
function isPublisherEmbed(a: Article): boolean {
  const credit = (a.videoCredit || '').toLowerCase();
  const fromOfficialSourcer = credit.startsWith('video via');
  const sameSource =
    !!a.videoSourceUrl && !!a.sourceLink && a.videoSourceUrl === a.sourceLink;
  return fromOfficialSourcer && sameSource;
}

interface Tally {
  kept_publisher: number;
  kept_verified: number;
  dropped_stock: number;
  dropped_youtube: number;
  dropped_unverifiable: number;
  no_video: number;
}

async function main() {
  const articles: Article[] = JSON.parse(readFileSync(ARTICLES_PATH, 'utf-8'));
  const tally: Tally = {
    kept_publisher: 0,
    kept_verified: 0,
    dropped_stock: 0,
    dropped_youtube: 0,
    dropped_unverifiable: 0,
    no_video: 0,
  };

  let processed = 0;
  for (let i = 0; i < articles.length && processed < LIMIT; i++) {
    const a = articles[i];
    const label = `[${i + 1}/${articles.length}] ${a.title.slice(0, 52)}`;

    if (!a.videoUrl) {
      tally.no_video++;
      continue;
    }
    processed++;

    // 1) Publisher's own embed → trusted, keep.
    if (isPublisherEmbed(a)) {
      tally.kept_publisher++;
      console.log(`✅ ${label} :: kept (publisher embed) — ${a.videoCredit}`);
      continue;
    }

    // 2) Non-YouTube (stock mp4 / file) → retired tier, drop outright.
    if (!youTubeId(a.videoUrl)) {
      tally.dropped_stock++;
      articles[i] = clearVideo(a);
      console.log(`🗑️  ${label} :: dropped (generic stock / non-YouTube) — ${a.videoCredit}`);
      continue;
    }

    // 3) YouTube embed → re-verify through Composio + judge.
    const result = await verifyVideoMatch({
      article: { title: a.title, excerpt: a.excerpt, tags: a.tags, category: a.category },
      candidate: { url: a.videoUrl, provider: 'YouTube' },
    });
    const meta = result.metadata
      ? ` [video: "${(result.metadata.videoTitle || '?').slice(0, 50)}" / ${result.metadata.channel || '?'}]`
      : '';

    if (result.match) {
      tally.kept_verified++;
      console.log(`✅ ${label} :: kept (verified) — ${result.reason}${meta}`);
    } else {
      // Distinguish a real "no-match" verdict from a couldn't-verify drop, so
      // the operator can tell mismatches from infra gaps on the dry-run.
      const unverifiable = /fail-closed|could not fetch|not set/.test(result.reason);
      if (unverifiable) tally.dropped_unverifiable++;
      else tally.dropped_youtube++;
      articles[i] = clearVideo(a);
      const tag = unverifiable ? 'dropped (unverifiable)' : 'dropped (mismatch)';
      console.log(`🗑️  ${label} :: ${tag} — ${result.reason}${meta}`);
    }
  }

  const dropped =
    tally.dropped_stock + tally.dropped_youtube + tally.dropped_unverifiable;
  const kept = tally.kept_publisher + tally.kept_verified;
  console.log(
    `\nProcessed ${processed} videos | kept ${kept} ` +
      `(publisher ${tally.kept_publisher}, verified ${tally.kept_verified}) | ` +
      `dropped ${dropped} (stock ${tally.dropped_stock}, mismatch ${tally.dropped_youtube}, ` +
      `unverifiable ${tally.dropped_unverifiable}) | no-video ${tally.no_video}`,
  );

  if (DRY) {
    console.log('Dry run — data/articles.json not written.');
    return;
  }
  if (dropped === 0) {
    console.log('No changes — nothing to write.');
    return;
  }
  writeFileSync(ARTICLES_PATH, JSON.stringify(articles, null, 2));
  console.log(`Wrote ${ARTICLES_PATH}. Review the diff, then stage via PR / GitHub Desktop.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
