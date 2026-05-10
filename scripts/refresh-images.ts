#!/usr/bin/env tsx
/**
 * Hotlink hero images from each article's sourceLink.
 *
 * Every article in data/articles.json has a sourceLink — the original
 * news article on the publication that ran the story (BellaNaija,
 * NotJustOk, CompleteSports, etc.).
 *
 * Strategy per article:
 *   1. Fetch the source page HTML.
 *   2. Pull all candidate images: og:image + og:image:alt, twitter:image,
 *      and the first ~10 body <img> tags with their alt attributes.
 *   3. Score each candidate against the article's title:
 *        - +30 if any name-token from the article title appears in the
 *          image URL filename
 *        - +20 if an alt-text token matches the article title
 *        - -50 if the URL contains a hostile name (e.g. another
 *          publication's celeb that appears across multiple articles —
 *          BellaNaija reuses the same Bonang Matheba photo across
 *          unrelated articles, so we explicitly downgrade those)
 *        - +10 if the filename contains a hero-y dimension hint
 *          (1440x720, 1200x630, 1080x, etc.)
 *   4. Pick the highest-scoring candidate that hasn't already been used
 *      by another article in this run (per-batch dedupe).
 *   5. HEAD-probe the chosen URL to confirm it's a real image; on failure
 *      try the next-best candidate.
 *
 * Usage:
 *   tsx scripts/refresh-images.ts            # only fix broken articles
 *   tsx scripts/refresh-images.ts --all      # rescrape every article
 *   tsx scripts/refresh-images.ts --dry      # print plan, don't write
 *   tsx scripts/refresh-images.ts --slug=X   # one article
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const REPO_ROOT = join(__dirname, '..');
const ARTICLES_PATH = join(REPO_ROOT, 'data/articles.json');

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry');
const ALL = args.includes('--all');
const ONE_SLUG = args.find((a) => a.startsWith('--slug='))?.split('=')[1];

const log = (msg: string) =>
  console.log(`[${new Date().toISOString().slice(11, 19)}] ${msg}`);

// Heuristic: this article needs a fresh hero image
function looksBroken(url: string | undefined): boolean {
  if (!url || !url.startsWith('http')) return true;
  const REJECT = [
    /s\.w\.org\/images\/core\/emoji/i,
    /\/wp-includes\/images\/(smilies|emoji)/i,
    /gravatar\.com\/avatar/i,
    /\/favicon\b/i,
    /\/logo[-_.]/i,
    /\/icon[-_./]/i,
    /\bemoji\b/i,
    /images\.unsplash\.com\/photo-1499781350541/i, // dead Unsplash fallback
    /BellaNaija\.com_avatar/i, // BellaNaija site identity banner, not an article hero
  ];
  return REJECT.some((re) => re.test(url));
}

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// Names that BellaNaija (and possibly others) seem to reuse as a default
// "African celebrity" hero across unrelated articles. When we see one
// of these in an image URL but the corresponding name is NOT in the
// article slug/title, the image is almost certainly wrong.
const COMMONLY_REUSED_NAMES = ['bonang', 'matheba'];

interface Candidate {
  url: string;
  source: 'og:image' | 'twitter:image' | 'body';
  alt: string;
  score: number;
  /** Position in the body (lower = earlier in the article) */
  position: number;
}

/**
 * Tokenize an article title for matching against image filenames + alts.
 * Lowercases, strips punctuation, drops short stop words.
 */
function tokenize(text: string): Set<string> {
  const stop = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'is', 'isnt', 'arent', 'just', 'in',
    'on', 'at', 'to', 'for', 'of', 'with', 'this', 'that', 'it', 'its',
    'has', 'have', 'had', 'will', 'was', 'are', 'be', 'as', 'by', 'from',
    'we', 'us', 'our', 'my', 'your', 'who', 'what', 'when', 'where', 'why',
    'how', 'into', 'about', 'over', 'under', 'after', 'before', 'between',
    'every', 'some', 'all', 'no', 'not', 'one', 'two', 'three', 'first',
    'last', 'next', 'new', 'good', 'said', 'says', 'can', 'cant', 'cannot',
    'do', 'does', 'did', 'go', 'goes', 'went', 'get', 'got', 'made', 'make',
    'made', 'now', 'then', 'than', 'because', 'so', 'while', 'until', 'up',
    'down', 'out', 'off', 'most', 'many', 'much', 'more', 'less', 'few',
    'each', 'any', 'only', 'just', 'own', 'same', 'such', 'too', 'very',
  ]);
  return new Set(
    text
      .toLowerCase()
      .replace(/['']/g, '')
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/[\s-]+/)
      .filter((t) => t.length > 2 && !stop.has(t))
  );
}

/**
 * Extract a "name signature" from an image URL or alt — looks for
 * recognizable celebrity/place names so we can match them against the
 * article topic.
 */
function nameTokens(text: string): Set<string> {
  // Same as tokenize but more permissive — keep proper-noun-looking tokens
  return new Set(
    text
      .toLowerCase()
      .replace(/['']/g, '')
      .replace(/[^a-z0-9\s-_/]/g, ' ')
      .split(/[\s_\-/.]+/)
      .filter((t) => t.length > 3)
  );
}

interface ScrapedPage {
  ogImage: string | null;
  ogImageAlt: string | null;
  twitterImage: string | null;
  bodyImages: Array<{ src: string; alt: string; position: number }>;
}

/**
 * Fetch a page and extract all image candidates (og:image, twitter:image,
 * and body <img> tags) with their alt text.
 */
async function scrapePageImages(pageUrl: string): Promise<ScrapedPage | null> {
  try {
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 12_000);
    const res = await fetch(pageUrl, {
      headers: { 'User-Agent': UA, Accept: 'text/html,application/xhtml+xml' },
      signal: ctrl.signal,
    }).finally(() => clearTimeout(timeout));

    if (!res.ok) return null;
    const html = (await res.text()).slice(0, 400_000);

    const resolveUrl = (u: string): string => {
      let imgUrl = u.trim();
      if (imgUrl.startsWith('//')) imgUrl = 'https:' + imgUrl;
      else if (imgUrl.startsWith('/')) {
        const base = new URL(pageUrl);
        imgUrl = `${base.protocol}//${base.host}${imgUrl}`;
      }
      return imgUrl;
    };

    // og:image (try standard order, then reversed attribute order)
    let ogImage: string | null = null;
    const ogPatterns = [
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
      /<meta[^>]+property=["']og:image:secure_url["'][^>]+content=["']([^"']+)["']/i,
    ];
    for (const re of ogPatterns) {
      const m = re.exec(html);
      if (m && m[1]) {
        ogImage = resolveUrl(m[1]);
        break;
      }
    }

    // og:image:alt (helps disambiguate when og:image filename is misleading)
    let ogImageAlt: string | null = null;
    const altRe = /<meta[^>]+property=["']og:image:alt["'][^>]+content=["']([^"']+)["']/i;
    const altMatch = altRe.exec(html);
    if (altMatch) ogImageAlt = altMatch[1];

    // twitter:image
    let twitterImage: string | null = null;
    const twPatterns = [
      /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
    ];
    for (const re of twPatterns) {
      const m = re.exec(html);
      if (m && m[1]) {
        twitterImage = resolveUrl(m[1]);
        break;
      }
    }

    // Body <img> tags (limit to first 15 to keep things fast).
    // We grab src and try to extract alt from the same tag.
    const bodyImages: ScrapedPage['bodyImages'] = [];
    const imgTagRe = /<img[^>]+>/gi;
    let imgMatch: RegExpExecArray | null;
    let position = 0;
    while ((imgMatch = imgTagRe.exec(html)) !== null && bodyImages.length < 15) {
      const tag = imgMatch[0];
      const srcMatch = /\bsrc=["']([^"']+)["']/i.exec(tag);
      if (!srcMatch) continue;
      const src = resolveUrl(srcMatch[1]);
      // Skip data URIs, tracking pixels, very obvious junk
      if (
        src.startsWith('data:') ||
        /\/favicon\b|\/logo[-_.]|\/icon[-_./]/i.test(src) ||
        /s\.w\.org\/images\/core\/emoji/i.test(src) ||
        /gravatar\.com\/avatar/i.test(src) ||
        /\bsprite\b/i.test(src) ||
        /BellaNaija\.com_avatar/i.test(src)
      ) {
        position++;
        continue;
      }
      const altMatch = /\balt=["']([^"']*)["']/i.exec(tag);
      bodyImages.push({
        src,
        alt: altMatch?.[1] ?? '',
        position: position++,
      });
    }

    return { ogImage, ogImageAlt, twitterImage, bodyImages };
  } catch {
    return null;
  }
}

/**
 * Score a candidate image against the article title.
 * Higher = better match.
 */
function scoreCandidate(
  c: Candidate,
  articleTitle: string,
  articleSlug: string
): number {
  const titleTokens = tokenize(articleTitle);
  const slugTokens = new Set(articleSlug.toLowerCase().split('-'));
  const articleTokens = new Set([...titleTokens, ...slugTokens]);

  const urlTokens = nameTokens(c.url);
  const altTokens = tokenize(c.alt);

  let score = 0;

  // Big bonus for filename matching article topic
  for (const token of articleTokens) {
    if (token.length < 4) continue;
    if (urlTokens.has(token)) score += 30;
  }
  // Bonus for alt-text matching article topic
  for (const token of articleTokens) {
    if (token.length < 4) continue;
    if (altTokens.has(token)) score += 20;
  }
  // Penalty if URL contains a name commonly reused as a wrong default
  // AND that name is NOT actually in the article topic
  for (const reusedName of COMMONLY_REUSED_NAMES) {
    if (urlTokens.has(reusedName) && !articleTokens.has(reusedName)) {
      score -= 80;
    }
  }
  // Bonus for hero-sized filename hints
  if (/1440x720|1200x630|1080x|hero|featured/i.test(c.url)) score += 10;
  // Slight penalty for tiny-sized hints (these are often thumbnails)
  if (/\b(150|200|300|400)x\d+/i.test(c.url)) score -= 5;

  // Source preference: og:image > twitter:image > body (early > late)
  if (c.source === 'og:image') score += 15;
  else if (c.source === 'twitter:image') score += 12;
  else score += Math.max(0, 10 - c.position); // earlier body images > later

  return score;
}

/**
 * Validate that a URL points at a real image. Tolerant: if HEAD is
 * rejected by the CDN, we accept the URL anyway.
 */
async function isProbablyValidImage(url: string): Promise<boolean> {
  try {
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 5_000);
    const res = await fetch(url, {
      method: 'HEAD',
      headers: { 'User-Agent': UA, Referer: 'https://www.monokromatik.com/' },
      signal: ctrl.signal,
    }).finally(() => clearTimeout(timeout));

    if (!res.ok) return false;
    const ctype = (res.headers.get('content-type') || '').toLowerCase();
    if (ctype && !ctype.startsWith('image/')) return false;
    const cl = res.headers.get('content-length');
    if (cl) {
      const bytes = parseInt(cl, 10);
      if (!isNaN(bytes) && bytes < 8 * 1024) return false;
    }
    return true;
  } catch {
    return true;
  }
}

/**
 * Pick the best image for an article from a scraped page.
 * Returns null if no good candidate found.
 *
 * `usedUrls` is the per-batch dedupe set — URLs already assigned to a
 * different article in this run. Skip those entirely.
 */
async function pickBestImage(
  scraped: ScrapedPage,
  articleTitle: string,
  articleSlug: string,
  usedUrls: Set<string>
): Promise<{ url: string; source: string; score: number } | null> {
  const candidates: Candidate[] = [];

  if (scraped.ogImage) {
    candidates.push({
      url: scraped.ogImage,
      source: 'og:image',
      alt: scraped.ogImageAlt ?? '',
      score: 0,
      position: 0,
    });
  }
  if (scraped.twitterImage && scraped.twitterImage !== scraped.ogImage) {
    candidates.push({
      url: scraped.twitterImage,
      source: 'twitter:image',
      alt: scraped.ogImageAlt ?? '',
      score: 0,
      position: 0,
    });
  }
  for (const b of scraped.bodyImages) {
    candidates.push({
      url: b.src,
      source: 'body',
      alt: b.alt,
      score: 0,
      position: b.position,
    });
  }

  // Score each candidate, sort descending
  for (const c of candidates) {
    c.score = scoreCandidate(c, articleTitle, articleSlug);
  }
  candidates.sort((a, b) => b.score - a.score);

  // Try candidates in score order, skipping already-used URLs and
  // validating HEAD on the chosen one. Also reject any URL that matches
  // looksBroken (covers patterns added after this scraper was first written).
  for (const c of candidates) {
    if (usedUrls.has(c.url)) continue;
    if (looksBroken(c.url)) continue;
    if (!(await isProbablyValidImage(c.url))) continue;
    return { url: c.url, source: c.source, score: c.score };
  }
  return null;
}

async function main() {
  log('🖼️  Hotlink hero images from sourceLink (smart scraper v2)');
  log(`   Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'} | All: ${ALL} | One: ${ONE_SLUG ?? 'no'}`);

  const all: any[] = JSON.parse(readFileSync(ARTICLES_PATH, 'utf-8'));
  log(`   Loaded ${all.length} articles from data/articles.json`);

  let candidates = all;
  if (ONE_SLUG) {
    candidates = all.filter((a) => a.slug === ONE_SLUG);
    if (candidates.length === 0) throw new Error(`No article with slug "${ONE_SLUG}"`);
  } else if (!ALL) {
    candidates = all.filter((a) => looksBroken(a.imageUrl));
  }
  log(`   Will process ${candidates.length} article${candidates.length === 1 ? '' : 's'}`);
  if (candidates.length === 0) {
    log('   ✅ Nothing to do.');
    return;
  }
  log('');

  // Per-batch dedupe: URLs we've already assigned in this run.
  // Pre-seed with URLs that already exist on articles we're NOT touching,
  // so a refresh of broken articles won't accidentally claim a URL that's
  // already in use elsewhere.
  const usedUrls = new Set<string>();
  for (const a of all) {
    if (!candidates.includes(a) && a.imageUrl && a.imageUrl.startsWith('http')) {
      usedUrls.add(a.imageUrl);
    }
  }

  const results: Array<{
    slug: string;
    sourceLink: string;
    oldUrl: string;
    newUrl: string | null;
    source: string;
    score: number;
    status: 'picked' | 'failed' | 'skipped-no-source';
  }> = [];

  for (let i = 0; i < candidates.length; i++) {
    const a = candidates[i];
    log(`[${i + 1}/${candidates.length}] ${a.slug.slice(0, 60)}`);
    log(`   source: ${(a.sourceLink || '(none)').slice(0, 90)}`);

    if (!a.sourceLink || !a.sourceLink.startsWith('http')) {
      log(`   ⚠️  No sourceLink — skipping`);
      log('');
      results.push({
        slug: a.slug,
        sourceLink: a.sourceLink || '',
        oldUrl: a.imageUrl || '',
        newUrl: null,
        source: '',
        score: 0,
        status: 'skipped-no-source',
      });
      continue;
    }

    const scraped = await scrapePageImages(a.sourceLink);
    if (!scraped) {
      log(`   ❌ Could not scrape source page`);
      log('');
      results.push({
        slug: a.slug,
        sourceLink: a.sourceLink,
        oldUrl: a.imageUrl || '',
        newUrl: null,
        source: '',
        score: 0,
        status: 'failed',
      });
      continue;
    }

    const picked = await pickBestImage(scraped, a.title, a.slug, usedUrls);
    if (!picked) {
      log(`   ❌ No suitable image found`);
      log('');
      results.push({
        slug: a.slug,
        sourceLink: a.sourceLink,
        oldUrl: a.imageUrl || '',
        newUrl: null,
        source: '',
        score: 0,
        status: 'failed',
      });
      continue;
    }

    log(`   ✅ ${picked.source.padEnd(15)} score=${picked.score.toString().padStart(3)} ${picked.url.slice(0, 80)}`);
    log('');
    usedUrls.add(picked.url);
    results.push({
      slug: a.slug,
      sourceLink: a.sourceLink,
      oldUrl: a.imageUrl || '',
      newUrl: picked.url,
      source: picked.source,
      score: picked.score,
      status: 'picked',
    });
  }

  log('=== SUMMARY ===');
  const byStatus = results.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});
  for (const [status, count] of Object.entries(byStatus).sort()) {
    log(`   ${status.padEnd(20)} ${count}`);
  }

  if (DRY_RUN) {
    log('');
    log('🟡 DRY RUN — not writing changes. Re-run without --dry to apply.');
    return;
  }

  const updated = all.map((article) => {
    const r = results.find((x) => x.slug === article.slug);
    if (!r || r.status !== 'picked' || !r.newUrl) return article;
    return {
      ...article,
      imageUrl: r.newUrl,
      imageRefreshedAt: new Date().toISOString(),
      imageSource: `sourceLink-${r.source}`,
    };
  });

  writeFileSync(ARTICLES_PATH, JSON.stringify(updated, null, 2));
  const changedCount = results.filter((r) => r.status === 'picked').length;
  log('');
  log(`💾 Wrote ${updated.length} articles (${changedCount} updated) to data/articles.json`);
  log('');
  log('✅ Image hotlinking complete.');
}

main().catch((err) => {
  console.error('\n❌ Failed:', err);
  process.exit(1);
});
