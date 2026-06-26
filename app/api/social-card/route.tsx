// On-demand Instagram card (1080×1350) for any article or Wire break.
//   GET /api/social-card?slug=<article-slug>        → PNG (Studio preview)
//   GET /api/social-card?break=<index>              → PNG
//   GET /api/social-card?slug=<slug>&format=jpg     → JPEG (Instagram Graph API
//                                                     requires a public JPEG URL)
// Used by /studio (preview + download) and the social-publish workflow (image_url).

import sharp from 'sharp';
import { getAllArticles } from '../../../lib/articles';
import { getBreaks } from '../../../lib/breaking-feed';
import { renderSocialCard, type SocialCardOptions } from '../../../lib/social-card';

export const runtime = 'nodejs';
export const revalidate = 3600;

const CACHE = 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800';

function clip(s: string | undefined, n: number): string {
  const c = (s || '').replace(/\s+/g, ' ').trim();
  return c.length > n ? c.slice(0, n - 1).trimEnd() + '…' : c;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');
  const breakIdx = searchParams.get('break');
  const asJpg = searchParams.get('format') === 'jpg';

  let opts: SocialCardOptions | null = null;
  if (slug) {
    const a = getAllArticles().find((x) => x.slug === slug);
    if (a) opts = { title: a.title, category: a.category, kicker: clip(a.brandRead?.pullQuote || a.excerpt, 200) };
  } else if (breakIdx !== null) {
    const b = getBreaks()[Number(breakIdx)];
    if (b) opts = { title: b.title, category: b.category, kicker: clip(b.why, 200), breaking: true };
  }

  if (!opts) return new Response('Not found', { status: 404 });

  const png = await renderSocialCard(opts);
  if (!asJpg) return png;

  // Instagram's publish API fetches a public JPEG — convert the rendered PNG.
  const buf = Buffer.from(await png.arrayBuffer());
  const jpg = await sharp(buf).jpeg({ quality: 90 }).toBuffer();
  return new Response(new Uint8Array(jpg), {
    headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': CACHE, 'Access-Control-Allow-Origin': '*' },
  });
}
