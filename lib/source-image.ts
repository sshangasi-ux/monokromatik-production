// MonoKromatik Image Sourcer Agent
// Strategy: validate any existing image -> hotlink og:image from sourceLink
// -> Pexels search (last resort) -> hardcoded fallback.
//
// Why hotlink og:image first:
//   Every modern news site embeds og:image meta tags pointing at the
//   editorial hero photo they used. That's already the *real* photo of
//   the artist/athlete/event the article covers — clean editorial
//   photography that beats generic Pexels stock every time. We use the
//   exact same approach as WhatsApp / iMessage / Slack link previews.

import Anthropic from '@anthropic-ai/sdk';

function getPexelsKey(): string | undefined {
  return process.env.PEXELS_API_KEY;
}
function getUnsplashKey(): string | undefined {
  return process.env.UNSPLASH_ACCESS_KEY;
}

const FALLBACK =
  'https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=1600&h=900&fit=crop';

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// Hosts/path patterns that we never accept as hero images.
const REJECT_HOST_PATTERNS = [
  /s\.w\.org\/images\/core\/emoji/i,
  /\/wp-includes\/images\/(smilies|emoji)/i,
  /gravatar\.com\/avatar/i,
  /\.cdninstagram\.com\/.*\/s150x150/i,
];
const REJECT_PATH_PATTERNS = [
  /\/favicon\b/i,
  /\/logo[-_.]/i,
  /\/icon[-_./]/i,
  /\/sprite[-_.]/i,
  /[-_]thumb(nail)?\b/i,
  /\bemoji\b/i,
  /\bavatar\b/i,
  /[-_]small[-_.]/i,
  /\b(1|16|32|72|96|150)x\1\b/i,
];

function isPatternRejected(url: string): boolean {
  if (REJECT_HOST_PATTERNS.some((re) => re.test(url))) return true;
  if (REJECT_PATH_PATTERNS.some((re) => re.test(url))) return true;
  return false;
}

/**
 * HEAD probe to confirm the URL points at a real image of reasonable size.
 * Tolerant: if HEAD is rejected by the CDN (some block it), we accept the
 * URL — better to ship a possibly-broken image than fall back to stock.
 */
async function isProbablyValidImage(url: string): Promise<boolean> {
  if (isPatternRejected(url)) return false;
  try {
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 4000);
    const r = await fetch(url, {
      method: 'HEAD',
      signal: ctrl.signal,
      headers: { 'User-Agent': UA, Referer: 'https://www.monokromatik.com/' },
    }).finally(() => clearTimeout(timeout));

    if (!r.ok) return false;
    const ctype = (r.headers.get('content-type') || '').toLowerCase();
    if (ctype && !ctype.startsWith('image/')) return false;
    const cl = r.headers.get('content-length');
    if (cl) {
      const bytes = parseInt(cl, 10);
      if (!isNaN(bytes) && bytes < 8 * 1024) return false;
    }
    return true;
  } catch {
    return true; // HEAD rejected — accept anyway
  }
}

/**
 * Scrape og:image / twitter:image from the article's source page.
 * This is the same trick WhatsApp/iMessage use to make link previews.
 * Returns null if the page has none or fetch fails.
 */
async function scrapeOgImage(pageUrl: string): Promise<string | null> {
  try {
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 12_000);
    const res = await fetch(pageUrl, {
      headers: { 'User-Agent': UA, Accept: 'text/html,application/xhtml+xml' },
      signal: ctrl.signal,
    }).finally(() => clearTimeout(timeout));

    if (!res.ok) return null;
    const html = (await res.text()).slice(0, 200_000);

    const patterns: RegExp[] = [
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
      /<meta[^>]+property=["']og:image:secure_url["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
    ];

    for (const pattern of patterns) {
      const match = pattern.exec(html);
      if (match && match[1]) {
        let imgUrl = match[1].trim();
        if (imgUrl.startsWith('//')) imgUrl = 'https:' + imgUrl;
        else if (imgUrl.startsWith('/')) {
          const base = new URL(pageUrl);
          imgUrl = `${base.protocol}//${base.host}${imgUrl}`;
        }
        if (isPatternRejected(imgUrl)) continue;
        return imgUrl;
      }
    }
    return null;
  } catch {
    return null;
  }
}

function getClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

async function buildImageQuery(
  title: string,
  excerpt: string,
  category: string
): Promise<string> {
  try {
    const client = getClient();
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: `Article title: "${title}"
Excerpt: "${excerpt}"
Category: ${category}

Generate a 2-5 word image search query that would find a strong, editorial-style photo for this article on a stock photo site. Focus on the visual subject (people, place, object, mood). Avoid named individuals (rights issues — search for the *concept* instead, e.g. "young Nigerian musician" not "Burna Boy"). Reply with the query only, no quotes.`,
        },
      ],
    });
    const text = msg.content[0].type === 'text' ? msg.content[0].text.trim() : '';
    return text || category;
  } catch {
    return category;
  }
}

async function tryPexels(query: string): Promise<string | null> {
  const key = getPexelsKey();
  if (!key) return null;
  try {
    const r = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(
        query
      )}&per_page=5&orientation=landscape`,
      { headers: { Authorization: key } }
    );
    if (!r.ok) return null;
    const j = await r.json();
    return j.photos?.[0]?.src?.large2x ?? j.photos?.[0]?.src?.large ?? null;
  } catch {
    return null;
  }
}

async function tryUnsplash(query: string): Promise<string | null> {
  const key = getUnsplashKey();
  if (!key) return null;
  try {
    const r = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        query
      )}&per_page=5&orientation=landscape`,
      { headers: { Authorization: `Client-ID ${key}` } }
    );
    if (!r.ok) return null;
    const j = await r.json();
    return j.results?.[0]?.urls?.regular ?? null;
  } catch {
    return null;
  }
}

/**
 * Source a hero image. Returns a usable image URL.
 *
 * Strategy:
 *   1. If existingUrl is a real image → use it.
 *   2. Scrape og:image from the article's sourceLink page (this is the move
 *      that gives us real editorial photos instead of generic stock).
 *   3. Last-resort fallback: Pexels/Unsplash search by Claude-generated query.
 *   4. If everything fails: hardcoded fallback URL.
 */
export async function sourceImage(args: {
  existingUrl?: string;
  sourceLink?: string;
  title: string;
  excerpt: string;
  category: string;
}): Promise<{
  url: string;
  source: 'existing' | 'sourceLink-og' | 'pexels' | 'unsplash' | 'fallback';
}> {
  // Step 1: validate existing
  if (args.existingUrl && args.existingUrl.startsWith('http')) {
    if (await isProbablyValidImage(args.existingUrl)) {
      return { url: args.existingUrl, source: 'existing' };
    }
    console.log(
      `   🛑 Rejected existing image: ${args.existingUrl.slice(0, 80)}`
    );
  }

  // Step 2: scrape og:image from sourceLink (preferred path)
  if (args.sourceLink && args.sourceLink.startsWith('http')) {
    const scraped = await scrapeOgImage(args.sourceLink);
    if (scraped && (await isProbablyValidImage(scraped))) {
      console.log(`   ✅ scraped og:image from source: ${scraped.slice(0, 80)}`);
      return { url: scraped, source: 'sourceLink-og' };
    }
    if (scraped) {
      console.log(`   🛑 Source og:image failed validation: ${scraped.slice(0, 80)}`);
    } else {
      console.log(`   🛑 Source page had no og:image`);
    }
  }

  // Step 3: stock photo fallback
  const query = await buildImageQuery(args.title, args.excerpt, args.category);
  console.log(`   🖼️  Stock fallback search: "${query}"`);

  const pexelsHit = await tryPexels(query);
  if (pexelsHit) return { url: pexelsHit, source: 'pexels' };

  const unsplashHit = await tryUnsplash(query);
  if (unsplashHit) return { url: unsplashHit, source: 'unsplash' };

  const pexelsCat = await tryPexels(args.category);
  if (pexelsCat) return { url: pexelsCat, source: 'pexels' };

  const unsplashCat = await tryUnsplash(args.category);
  if (unsplashCat) return { url: unsplashCat, source: 'unsplash' };

  return { url: FALLBACK, source: 'fallback' };
}
