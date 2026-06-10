// MonoKromatik Media Sourcer
//
// Reputable-first, credited media for every article. Wraps the image sourcer
// (official source-page scrape → Pexels → Unsplash → branded fallback) and adds
// best-effort official video discovery (YouTube/Vimeo/og:video on the source
// page). Every returned asset carries an explicit credit + source URL, and an
// image is ALWAYS present (the branded fallback guarantees it) — so rich media
// is mandatory per article by construction.
//
// No model calls here; this is deterministic sourcing. Network egress and the
// PEXELS_API_KEY / UNSPLASH_ACCESS_KEY secrets live in the pipeline runtime
// (GitHub Actions / Vercel cron), not in build.

import { sourceImage } from './source-image';

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const SITE = 'https://www.monokromatik.com';

export interface MediaAsset {
  url: string;
  /** Short human-readable credit shown on the page, e.g. "Via BellaNaija". */
  credit: string;
  /** Link the credit points to (the publisher page or the stock provider). */
  sourceUrl: string;
  /** Machine label of where it came from. */
  provider: string;
  /** For video only: 'embed' = iframe (YouTube/Vimeo), 'file' = <video> (mp4). */
  kind?: 'embed' | 'file';
}

export interface SourcedMedia {
  /** Always present — the branded fallback guarantees an image. */
  image: MediaAsset;
  /** Optional video: official publisher embed first, else a relevant stock clip. */
  video?: MediaAsset;
}

/** Stock motion is on by default; set MONO_STOCK_VIDEO=off to disable the fallback. */
const STOCK_VIDEO_ENABLED = (process.env.MONO_STOCK_VIDEO ?? 'on').toLowerCase() !== 'off';

const STOCK_QUERY: Record<string, string> = {
  culture: 'african culture city',
  roots: 'african culture heritage',
  music: 'concert stage lights crowd',
  waves: 'concert stage lights crowd',
  sports: 'football stadium crowd',
  arena: 'football stadium crowd',
};
function stockQuery(category: string): string {
  return STOCK_QUERY[(category || '').toLowerCase()] || 'africa city aerial';
}

type ImageSource =
  | 'existing'
  | 'sourceLink-og'
  | 'sourceLink-twitter'
  | 'sourceLink-body'
  | 'pexels'
  | 'unsplash'
  | 'fallback';

/** Map the image sourcer's provenance tag to a credit the reader can trust. */
function creditForImage(
  source: ImageSource,
  sourceName?: string,
  sourceLink?: string,
): Omit<MediaAsset, 'url'> {
  const publisher = (sourceName || '').trim();
  switch (source) {
    case 'sourceLink-og':
    case 'sourceLink-twitter':
    case 'sourceLink-body':
    case 'existing':
      return {
        provider: publisher || 'source',
        credit: publisher ? `Via ${publisher}` : 'Via original source',
        sourceUrl: sourceLink || SITE,
      };
    case 'pexels':
      return { provider: 'Pexels', credit: 'Photo: Pexels', sourceUrl: 'https://www.pexels.com' };
    case 'unsplash':
      return { provider: 'Unsplash', credit: 'Photo: Unsplash', sourceUrl: 'https://unsplash.com' };
    case 'fallback':
    default:
      return { provider: 'MonoKromatik', credit: 'MonoKromatik', sourceUrl: SITE };
  }
}

function normalizeYouTube(idOrUrl: string): string | null {
  const id =
    idOrUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/)?.[1] ||
    (/^[A-Za-z0-9_-]{11}$/.test(idOrUrl) ? idOrUrl : null);
  return id ? `https://www.youtube.com/watch?v=${id}` : null;
}

/**
 * Best-effort discovery of the publisher's OWN video on the source page
 * (og:video, a YouTube/Vimeo iframe, or an inline YouTube/Vimeo link). Returns
 * a reputable, creditable embed — never invented. Video is optional.
 */
async function sourceOfficialVideo(
  sourceLink?: string,
  sourceName?: string,
): Promise<MediaAsset | undefined> {
  if (!sourceLink || !sourceLink.startsWith('http')) return undefined;
  let html = '';
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 9000);
    const res = await fetch(sourceLink, { headers: { 'User-Agent': UA }, signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) return undefined;
    html = await res.text();
  } catch {
    return undefined;
  }

  // 1) og:video / og:video:url
  const og = html.match(/<meta[^>]+property=["']og:video(?::url)?["'][^>]+content=["']([^"']+)["']/i)?.[1];
  // 2) YouTube/Vimeo iframe src
  const iframe = html.match(/<iframe[^>]+src=["']([^"']*(?:youtube\.com|youtu\.be|player\.vimeo\.com)[^"']*)["']/i)?.[1];
  // 3) inline YouTube/Vimeo link
  const link = html.match(/https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=[\w-]+|youtu\.be\/[\w-]+|vimeo\.com\/\d+)/i)?.[0];

  const candidate = og || iframe || link;
  if (!candidate) return undefined;

  const publisher = (sourceName || '').trim();
  const credit = publisher ? `Video via ${publisher}` : 'Video via original source';

  const yt = normalizeYouTube(candidate);
  if (yt) return { url: yt, credit, sourceUrl: sourceLink, provider: publisher || 'source', kind: 'embed' };

  const vimeo = candidate.match(/vimeo\.com\/(?:video\/)?(\d+)/)?.[1];
  if (vimeo) {
    return { url: `https://vimeo.com/${vimeo}`, credit, sourceUrl: sourceLink, provider: publisher || 'source', kind: 'embed' };
  }
  return undefined;
}

/**
 * Relevant stock motion clip (Pexels Video API) used when the source has no
 * official video. Returns an mp4 ~1280px wide, credited to the creator + Pexels.
 * Requires PEXELS_API_KEY; gated by MONO_STOCK_VIDEO.
 */
async function sourcePexelsVideo(query: string): Promise<MediaAsset | undefined> {
  const key = process.env.PEXELS_API_KEY;
  if (!key || !STOCK_VIDEO_ENABLED) return undefined;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 9000);
    const res = await fetch(
      `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape&size=medium`,
      { headers: { Authorization: key }, signal: ctrl.signal },
    );
    clearTimeout(t);
    if (!res.ok) return undefined;
    const data = (await res.json()) as {
      videos?: { url?: string; user?: { name?: string }; video_files?: { link?: string; file_type?: string; width?: number }[] }[];
    };
    const v = data.videos?.[0];
    if (!v) return undefined;
    const mp4 = (v.video_files || [])
      .filter((f) => (f.file_type || '').includes('mp4') && typeof f.link === 'string')
      .sort((a, b) => Math.abs((a.width || 0) - 1280) - Math.abs((b.width || 0) - 1280))[0];
    if (!mp4?.link) return undefined;
    return {
      url: mp4.link,
      credit: v.user?.name ? `Video: ${v.user.name} / Pexels` : 'Video: Pexels',
      sourceUrl: v.url || 'https://www.pexels.com',
      provider: 'Pexels',
      kind: 'file',
    };
  } catch {
    return undefined;
  }
}

/**
 * Source a credited hero image (mandatory) and an optional official video for an
 * article. The image is guaranteed present via the branded fallback.
 */
export async function sourceMedia(args: {
  existingUrl?: string;
  sourceLink?: string;
  sourceName?: string;
  title: string;
  excerpt: string;
  category: string;
}): Promise<SourcedMedia> {
  const img = await sourceImage({
    existingUrl: args.existingUrl,
    sourceLink: args.sourceLink,
    title: args.title,
    excerpt: args.excerpt,
    category: args.category,
  });
  const credit = creditForImage(img.source as ImageSource, args.sourceName, args.sourceLink);
  const image: MediaAsset = { url: img.url, ...credit };

  // Official publisher video first (most reputable); otherwise a relevant stock clip.
  const official = await sourceOfficialVideo(args.sourceLink, args.sourceName).catch(() => undefined);
  const video = official ?? (await sourcePexelsVideo(stockQuery(args.category)).catch(() => undefined));

  return { image, video };
}
