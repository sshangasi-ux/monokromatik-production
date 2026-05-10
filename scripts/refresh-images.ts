#!/usr/bin/env tsx
/**
 * Hotlink hero images from each article's sourceLink.
 *
 * Every article in data/articles.json has a sourceLink — the original
 * news article on the publication that ran the story (BellaNaija,
 * NotJustOk, CompleteSports, etc.). Each of those articles has an
 * og:image meta tag pointing at the editorial hero image used in
 * the publication's own preview cards.
 *
 * This script scrapes that og:image (or twitter:image as fallback) and
 * uses it as the article's imageUrl. By default it only processes
 * articles that have no image or have a known-bad image (emoji CDN,
 * Unsplash fallback). Pass --all to refresh every article.
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
    // Known stock fallback URL
    /images\.unsplash\.com\/photo-1499781350541/i,
  ];
  return REJECT.some((re) => re.test(url));
}

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

/**
 * Fetch a page and extract the best preview image meta tag.
 * Tries og:image first, then twitter:image, then og:image:secure_url.
 */
async function scrapeOgImage(pageUrl: string): Promise<string | null> {
  try {
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 12_000);
    const res = await fetch(pageUrl, {
      headers: {
        'User-Agent': UA,
        Accept: 'text/html,application/xhtml+xml',
      },
      signal: ctrl.signal,
    }).finally(() => clearTimeout(timeout));

    if (!res.ok) return null;
    const html = (await res.text()).slice(0, 200_000); // first 200KB is more than enough

    // Try patterns in order. Some sites put `content` before `property`,
    // some after. Some use double quotes, some single. Cover both.
    const patterns: RegExp[] = [
      // og:image (the standard)
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
      // og:image:secure_url
      /<meta[^>]+property=["']og:image:secure_url["'][^>]+content=["']([^"']+)["']/i,
      // twitter:image (used by some Twitter-first publications)
      /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
    ];

    for (const pattern of patterns) {
      const match = pattern.exec(html);
      if (match && match[1]) {
        // Resolve relative URLs
        let imgUrl = match[1].trim();
        if (imgUrl.startsWith('//')) imgUrl = 'https:' + imgUrl;
        else if (imgUrl.startsWith('/')) {
          const base = new URL(pageUrl);
          imgUrl = `${base.protocol}//${base.host}${imgUrl}`;
        }
        // Reject obviously-bad results (logos / favicons in og slot)
        if (
          /\/favicon\b|\/logo[-_.]|\/site-icon/i.test(imgUrl) ||
          /s\.w\.org\/images\/core\/emoji/i.test(imgUrl)
        ) {
          continue;
        }
        return imgUrl;
      }
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Validate that a URL points at a real, sufficiently-sized image.
 * HEAD probe — fast, no body download. Tolerant: if HEAD fails (some
 * CDNs reject it), we still accept the URL.
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
      // 8KB minimum — kills emojis, favicons, tracking pixels.
      if (!isNaN(bytes) && bytes < 8 * 1024) return false;
    }
    return true;
  } catch {
    // HEAD rejected by CDN — assume it's fine. Worst case the article
    // gets a broken image, which we'd fix manually.
    return true;
  }
}

async function main() {
  log('🖼️  Hotlink hero images from sourceLink');
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

  const results: Array<{
    slug: string;
    sourceLink: string;
    oldUrl: string;
    newUrl: string | null;
    status: 'scraped' | 'failed' | 'skipped-no-source';
  }> = [];

  for (let i = 0; i < candidates.length; i++) {
    const a = candidates[i];
    log(`[${i + 1}/${candidates.length}] ${a.slug.slice(0, 60)}`);
    log(`   source: ${(a.sourceLink || '(none)').slice(0, 90)}`);

    if (!a.sourceLink || !a.sourceLink.startsWith('http')) {
      log(`   ⚠️  No sourceLink — skipping (manual review needed)`);
      log('');
      results.push({
        slug: a.slug,
        sourceLink: a.sourceLink || '',
        oldUrl: a.imageUrl || '',
        newUrl: null,
        status: 'skipped-no-source',
      });
      continue;
    }

    const scraped = await scrapeOgImage(a.sourceLink);
    if (!scraped) {
      log(`   ❌ No og:image / twitter:image found on source page`);
      log('');
      results.push({
        slug: a.slug,
        sourceLink: a.sourceLink,
        oldUrl: a.imageUrl || '',
        newUrl: null,
        status: 'failed',
      });
      continue;
    }

    const valid = await isProbablyValidImage(scraped);
    if (!valid) {
      log(`   ❌ Scraped URL failed validation: ${scraped.slice(0, 80)}`);
      log('');
      results.push({
        slug: a.slug,
        sourceLink: a.sourceLink,
        oldUrl: a.imageUrl || '',
        newUrl: null,
        status: 'failed',
      });
      continue;
    }

    log(`   ✅ scraped: ${scraped.slice(0, 90)}`);
    log('');
    results.push({
      slug: a.slug,
      sourceLink: a.sourceLink,
      oldUrl: a.imageUrl || '',
      newUrl: scraped,
      status: 'scraped',
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

  // Apply updates
  const updated = all.map((article) => {
    const r = results.find((x) => x.slug === article.slug);
    if (!r || r.status !== 'scraped' || !r.newUrl) return article;
    return {
      ...article,
      imageUrl: r.newUrl,
      imageRefreshedAt: new Date().toISOString(),
      imageSource: 'sourceLink-og',
    };
  });

  writeFileSync(ARTICLES_PATH, JSON.stringify(updated, null, 2));
  const changedCount = results.filter((r) => r.status === 'scraped').length;
  log('');
  log(`💾 Wrote ${updated.length} articles (${changedCount} updated) to data/articles.json`);
  log('');
  log('✅ Image hotlinking complete.');
}

main().catch((err) => {
  console.error('\n❌ Failed:', err);
  process.exit(1);
});
