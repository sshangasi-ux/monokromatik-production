// MonoKromatik Image Sourcer Agent
// Strategy: validate any existing image -> hotlink best image from sourceLink
// page using a scored multi-candidate scrape (og:image, twitter:image,
// body images all scored against article title, best match wins) ->
// Pexels search (last resort) -> hardcoded fallback.
//
// Why scored multi-candidate scraping:
//   Some publishers (e.g. BellaNaija) have buggy og:image meta tags that
//   point at the wrong photo for an article. We can't trust og:image
//   blindly. Instead we collect multiple candidates from the same page,
//   score them against the article's actual title, and pick the highest
//   match. Same approach LinkedIn / WhatsApp use to disambiguate.

import Anthropic from '@anthropic-ai/sdk';
import { generateHeroImage } from './generate-image';

function getPexelsKey(): string | undefined {
  return process.env.PEXELS_API_KEY;
}
function getUnsplashKey(): string | undefined {
  return process.env.UNSPLASH_ACCESS_KEY;
}

// Last-resort hardcoded fallback. A self-hosted branded SVG that renders
// MonoKromatik wordmark + amber accent on a black field. Always reachable
// (lives in public/), no third-party CDN dependency. The agent pipeline
// emits the absolute production URL so it works in newsletters / OG cards
// / RSS where the consumer can't resolve relative paths.
const FALLBACK = 'https://www.monokromatik.com/fallback-hero.svg';

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

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
  /BellaNaija\.com_avatar/i, // BellaNaija site identity banner
];

// Names some publishers seem to reuse as a default "African celebrity"
// hero across unrelated articles (BellaNaija reuses Bonang Matheba photo
// across multiple unrelated articles). When these names appear in an
// image URL but NOT in the article title, the image is wrong.
const COMMONLY_REUSED_NAMES = ['bonang', 'matheba'];

function isPatternRejected(url: string): boolean {
  if (REJECT_HOST_PATTERNS.some((re) => re.test(url))) return true;
  if (REJECT_PATH_PATTERNS.some((re) => re.test(url))) return true;
  return false;
}

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
    return true;
  }
}

function tokenize(text: string): Set<string> {
  const stop = new Set([
    'the','a','an','and','or','but','is','isnt','arent','just','in','on',
    'at','to','for','of','with','this','that','it','its','has','have','had',
    'will','was','are','be','as','by','from','we','us','our','my','your',
    'who','what','when','where','why','how','into','about','over','under',
    'after','before','between','every','some','all','no','not','one','two',
    'three','first','last','next','new','good','said','says','can','cant',
    'cannot','do','does','did','go','goes','went','get','got','made','make',
    'now','then','than','because','so','while','until','up','down','out',
    'off','most','many','much','more','less','few','each','any','only',
    'own','same','such','too','very',
  ]);
  return new Set(
    text.toLowerCase()
      .replace(/['']/g, '')
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/[\s-]+/)
      .filter((t) => t.length > 2 && !stop.has(t))
  );
}

function nameTokens(text: string): Set<string> {
  return new Set(
    text.toLowerCase()
      .replace(/['']/g, '')
      .replace(/[^a-z0-9\s-_/]/g, ' ')
      .split(/[\s_\-/.]+/)
      .filter((t) => t.length > 3)
  );
}

interface ScrapedImage {
  url: string;
  source: 'og:image' | 'twitter:image' | 'body';
  alt: string;
  position: number;
}

async function scrapeAllImages(pageUrl: string): Promise<{
  candidates: ScrapedImage[];
  ogImageAlt: string;
}> {
  try {
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 12_000);
    const res = await fetch(pageUrl, {
      headers: { 'User-Agent': UA, Accept: 'text/html,application/xhtml+xml' },
      signal: ctrl.signal,
    }).finally(() => clearTimeout(timeout));

    if (!res.ok) return { candidates: [], ogImageAlt: '' };
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

    const candidates: ScrapedImage[] = [];

    // og:image:alt
    let ogImageAlt = '';
    const altRe = /<meta[^>]+property=["']og:image:alt["'][^>]+content=["']([^"']+)["']/i;
    const altMatch = altRe.exec(html);
    if (altMatch) ogImageAlt = altMatch[1];

    // og:image
    const ogPatterns = [
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
      /<meta[^>]+property=["']og:image:secure_url["'][^>]+content=["']([^"']+)["']/i,
    ];
    for (const re of ogPatterns) {
      const m = re.exec(html);
      if (m && m[1]) {
        candidates.push({
          url: resolveUrl(m[1]),
          source: 'og:image',
          alt: ogImageAlt,
          position: 0,
        });
        break;
      }
    }

    // twitter:image
    const twPatterns = [
      /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
    ];
    for (const re of twPatterns) {
      const m = re.exec(html);
      if (m && m[1]) {
        const tu = resolveUrl(m[1]);
        if (!candidates.some((c) => c.url === tu)) {
          candidates.push({
            url: tu,
            source: 'twitter:image',
            alt: ogImageAlt,
            position: 0,
          });
        }
        break;
      }
    }

    // Body <img> tags
    const imgTagRe = /<img[^>]+>/gi;
    let imgMatch: RegExpExecArray | null;
    let position = 0;
    while ((imgMatch = imgTagRe.exec(html)) !== null && candidates.length < 20) {
      const tag = imgMatch[0];
      const srcMatch = /\bsrc=["']([^"']+)["']/i.exec(tag);
      if (!srcMatch) continue;
      const src = resolveUrl(srcMatch[1]);
      if (
        src.startsWith('data:') ||
        isPatternRejected(src)
      ) {
        position++;
        continue;
      }
      const altMatchTag = /\balt=["']([^"']*)["']/i.exec(tag);
      candidates.push({
        url: src,
        source: 'body',
        alt: altMatchTag?.[1] ?? '',
        position: position++,
      });
    }

    return { candidates, ogImageAlt };
  } catch {
    return { candidates: [], ogImageAlt: '' };
  }
}

function scoreCandidate(c: ScrapedImage, title: string): number {
  const titleTokens = tokenize(title);
  const urlTokens = nameTokens(c.url);
  const altTokens = tokenize(c.alt);

  let score = 0;
  for (const token of titleTokens) {
    if (token.length < 4) continue;
    if (urlTokens.has(token)) score += 30;
    if (altTokens.has(token)) score += 20;
  }
  for (const reusedName of COMMONLY_REUSED_NAMES) {
    if (urlTokens.has(reusedName) && !titleTokens.has(reusedName)) {
      score -= 80;
    }
  }
  if (/1440x720|1200x630|1080x|hero|featured/i.test(c.url)) score += 10;
  if (/\b(150|200|300|400)x\d+/i.test(c.url)) score -= 5;
  if (c.source === 'og:image') score += 15;
  else if (c.source === 'twitter:image') score += 12;
  else score += Math.max(0, 10 - c.position);

  return score;
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

Generate a 2-5 word image search query. Focus on the visual subject. Avoid named individuals. Reply with the query only, no quotes.`,
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
 *   2. Scrape sourceLink page, score all candidate images (og:image,
 *      twitter:image, body images) against article title, pick best.
 *   3. Stock photo fallback: Pexels/Unsplash.
 *   4. Hardcoded fallback URL.
 */
export async function sourceImage(args: {
  existingUrl?: string;
  sourceLink?: string;
  title: string;
  excerpt: string;
  category: string;
}): Promise<{
  url: string;
  source: 'existing' | 'sourceLink-og' | 'sourceLink-twitter' | 'sourceLink-body' | 'pexels' | 'unsplash' | 'generated' | 'fallback';
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

  // Step 2: scrape and score images from sourceLink
  if (args.sourceLink && args.sourceLink.startsWith('http')) {
    const { candidates } = await scrapeAllImages(args.sourceLink);
    if (candidates.length > 0) {
      // Score and sort
      const scored = candidates
        .map((c) => ({ ...c, score: scoreCandidate(c, args.title) }))
        .sort((a, b) => b.score - a.score);

      // Try in score order, validating each
      for (const c of scored) {
        if (await isProbablyValidImage(c.url)) {
          const sourceTag =
            c.source === 'og:image'
              ? 'sourceLink-og'
              : c.source === 'twitter:image'
              ? 'sourceLink-twitter'
              : 'sourceLink-body';
          console.log(`   ✅ ${sourceTag} (score=${c.score}): ${c.url.slice(0, 70)}`);
          return { url: c.url, source: sourceTag as any };
        }
      }
    }
    console.log(`   🛑 No valid image candidates on source page`);
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

  // Step 4: create original brand-aligned hero art (self-hosted) rather than
  // dropping to the static SVG. No-ops to null unless IMAGE_GEN_API_KEY is set.
  const generated = await generateHeroImage({ title: args.title, category: args.category, slug: undefined });
  if (generated) return { url: generated, source: 'generated' };

  return { url: FALLBACK, source: 'fallback' };
}
