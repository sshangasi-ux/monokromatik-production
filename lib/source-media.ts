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

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';
import sharp from 'sharp';
import { sourceImage } from './source-image';

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const SITE = 'https://www.monokromatik.com';

const MEDIA_DIR = join(process.cwd(), 'public', 'article-media');

/**
 * Self-host a sourced image: download it server-side (no browser Referer, so
 * publisher hotlink protection doesn't apply), normalise to a resized webp and
 * write it under public/article-media so it's served same-origin from our own
 * domain — no third-party proxy. Returns the public path, or null on failure
 * (caller keeps the remote URL as a last resort).
 */
async function localizeImage(remoteUrl: string, slug?: string): Promise<string | null> {
  if (remoteUrl.startsWith('/')) return remoteUrl; // already local
  if (!/^https?:\/\//i.test(remoteUrl)) return null;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 12000);
    const res = await fetch(remoteUrl, { headers: { 'User-Agent': UA, Accept: 'image/*' }, signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) return null;
    const input = Buffer.from(await res.arrayBuffer());
    if (input.length < 1024) return null;
    const output = await sharp(input)
      .rotate()
      .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
    const hash = createHash('sha1').update(remoteUrl).digest('hex').slice(0, 8);
    const base = (slug || 'media').replace(/[^a-z0-9-]+/gi, '-').slice(0, 60).toLowerCase() || 'media';
    const filename = `${base}-${hash}.webp`;
    if (!existsSync(MEDIA_DIR)) mkdirSync(MEDIA_DIR, { recursive: true });
    writeFileSync(join(MEDIA_DIR, filename), output);
    return `/article-media/${filename}`;
  } catch {
    return null;
  }
}

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
  | 'generated'
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
    case 'generated':
      return { provider: 'MonoKromatik', credit: 'Original artwork: MonoKromatik AI', sourceUrl: SITE };
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

/** Diagnostic logging for stock-video sourcing — surfaces in the pipeline / backfill CI logs. */
function vlog(msg: string) {
  console.log(`[stock-video] ${msg}`);
}

interface PexelsVideoResponse {
  total_results?: number;
  videos?: {
    url?: string;
    user?: { name?: string };
    video_files?: { link?: string; file_type?: string; width?: number }[];
  }[];
}

/** One Pexels video query → first usable mp4 as a credited MediaAsset, or undefined. */
async function pexelsVideoQuery(query: string, key: string): Promise<MediaAsset | undefined> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 10000);
  let res: Response;
  try {
    res = await fetch(
      `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape`,
      { headers: { Authorization: key }, signal: ctrl.signal },
    );
  } finally {
    clearTimeout(t);
  }
  if (!res.ok) {
    vlog(`Pexels HTTP ${res.status} for "${query}"${res.status === 401 ? ' — bad/empty PEXELS_API_KEY' : ''}`);
    return undefined;
  }
  const data = (await res.json()) as PexelsVideoResponse;
  const videos = data.videos || [];
  vlog(`"${query}" → ${videos.length} videos (total ${data.total_results ?? '?'})`);
  for (const v of videos) {
    const mp4 = (v.video_files || [])
      .filter((f) => (f.file_type || '').includes('mp4') && typeof f.link === 'string')
      .sort((a, b) => Math.abs((a.width || 0) - 1280) - Math.abs((b.width || 0) - 1280))[0];
    if (mp4?.link) {
      return {
        url: mp4.link,
        credit: v.user?.name ? `Video: ${v.user.name} / Pexels` : 'Video: Pexels',
        sourceUrl: v.url || 'https://www.pexels.com',
        provider: 'Pexels',
        kind: 'file',
      };
    }
  }
  return undefined;
}

/**
 * Relevant stock motion clip (Pexels Video API) used when the source has no
 * official video. Tries the category query, then a single-keyword fallback.
 * Requires PEXELS_API_KEY; gated by MONO_STOCK_VIDEO.
 */
async function sourcePexelsVideo(query: string): Promise<MediaAsset | undefined> {
  if (!STOCK_VIDEO_ENABLED) {
    vlog('disabled (MONO_STOCK_VIDEO=off)');
    return undefined;
  }
  const key = process.env.PEXELS_API_KEY;
  if (!key) {
    vlog('skipped — PEXELS_API_KEY not set');
    return undefined;
  }
  try {
    const fallbackTerm = query.split(' ')[0] || 'africa';
    return (await pexelsVideoQuery(query, key)) ?? (await pexelsVideoQuery(fallbackTerm, key));
  } catch (err) {
    vlog(`error: ${(err as Error).message}`);
    return undefined;
  }
}

interface YouTubeSearchResponse {
  error?: { errors?: { reason?: string }[]; message?: string };
  items?: { id?: { videoId?: string }; snippet?: { channelTitle?: string; title?: string } }[];
}

/**
 * Relevant real video via the YouTube Data API v3 (preferred over generic stock):
 * searches embeddable videos for the article, returns the top match as a credited
 * embed. Requires YOUTUBE_API_KEY; ~100 search units each (10k/day free quota).
 */
async function sourceYouTube(query: string): Promise<MediaAsset | undefined> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    vlog('youtube skipped — YOUTUBE_API_KEY not set');
    return undefined;
  }
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 10000);
  try {
    const url =
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoEmbeddable=true` +
      `&maxResults=5&safeSearch=moderate&order=relevance&relevanceLanguage=en` +
      `&q=${encodeURIComponent(query)}&key=${key}`;
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as YouTubeSearchResponse;
      const reason = body.error?.errors?.[0]?.reason || '';
      vlog(`youtube HTTP ${res.status}${reason ? ` (${reason})` : ''} for "${query.slice(0, 40)}"`);
      return undefined;
    }
    const data = (await res.json()) as YouTubeSearchResponse;
    const items = data.items || [];
    vlog(`youtube "${query.slice(0, 40)}" → ${items.length} results`);
    for (const it of items) {
      const videoId = it.id?.videoId;
      if (!videoId) continue;
      const channel = (it.snippet?.channelTitle || '').trim();
      return {
        url: `https://www.youtube.com/watch?v=${videoId}`,
        credit: channel ? `Video: ${channel} / YouTube` : 'Video: YouTube',
        sourceUrl: `https://www.youtube.com/watch?v=${videoId}`,
        provider: 'YouTube',
        kind: 'embed',
      };
    }
    return undefined;
  } catch (err) {
    vlog(`youtube error: ${(err as Error).message}`);
    return undefined;
  } finally {
    clearTimeout(t);
  }
}

/**
 * Resolve the best available video for an article, in reputability order:
 * the publisher's own embed → a relevant real YouTube clip → a generic stock
 * motion clip. Returns undefined when nothing suitable is found. Shared by the
 * live pipeline (sourceMedia) and the backfill script.
 */
export async function sourceArticleVideo(args: {
  sourceLink?: string;
  sourceName?: string;
  title: string;
  category: string;
}): Promise<MediaAsset | undefined> {
  return (
    (await sourceOfficialVideo(args.sourceLink, args.sourceName).catch(() => undefined)) ??
    (await sourceYouTube(args.title).catch(() => undefined)) ??
    (await sourcePexelsVideo(stockQuery(args.category)).catch(() => undefined))
  );
}

/**
 * Source a credited hero image (mandatory) and an optional official video for an
 * article. The image is guaranteed present via the branded fallback.
 */
export async function sourceMedia(args: {
  existingUrl?: string;
  sourceLink?: string;
  sourceName?: string;
  slug?: string;
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
  // Self-host the chosen image (same-origin webp). On failure keep the remote
  // URL; the branded fallback in MediaImage still catches anything that breaks.
  const localUrl = img.source === 'fallback' ? '/fallback-hero.svg' : await localizeImage(img.url, args.slug);
  const image: MediaAsset = { url: localUrl ?? img.url, ...credit };

  const video = await sourceArticleVideo({
    sourceLink: args.sourceLink,
    sourceName: args.sourceName,
    title: args.title,
    category: args.category,
  });

  return { image, video };
}
