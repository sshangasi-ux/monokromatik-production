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
}

export interface SourcedMedia {
  /** Always present — the branded fallback guarantees an image. */
  image: MediaAsset;
  /** Optional official video embed (publisher's own YouTube/Vimeo). */
  video?: MediaAsset;
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
  if (yt) return { url: yt, credit, sourceUrl: sourceLink, provider: publisher || 'source' };

  const vimeo = candidate.match(/vimeo\.com\/(?:video\/)?(\d+)/)?.[1];
  if (vimeo) {
    return { url: `https://vimeo.com/${vimeo}`, credit, sourceUrl: sourceLink, provider: publisher || 'source' };
  }
  return undefined;
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

  const video = await sourceOfficialVideo(args.sourceLink, args.sourceName).catch(() => undefined);

  return { image, video };
}
