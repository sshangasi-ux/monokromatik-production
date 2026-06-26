// On-demand Instagram card (1080×1350 PNG) for any article or Wire break.
//   GET /api/social-card?slug=<article-slug>
//   GET /api/social-card?break=<index>
// Used by the Social Studio (/studio) to preview + download per-post cards.

import { getAllArticles } from '../../../lib/articles';
import { getBreaks } from '../../../lib/breaking-feed';
import { renderSocialCard } from '../../../lib/social-card';

export const runtime = 'nodejs';
export const revalidate = 3600;

function clip(s: string | undefined, n: number): string {
  const c = (s || '').replace(/\s+/g, ' ').trim();
  return c.length > n ? c.slice(0, n - 1).trimEnd() + '…' : c;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');
  const breakIdx = searchParams.get('break');

  if (slug) {
    const a = getAllArticles().find((x) => x.slug === slug);
    if (a) {
      return renderSocialCard({
        title: a.title,
        category: a.category,
        kicker: clip(a.brandRead?.pullQuote || a.excerpt, 200),
      });
    }
  }

  if (breakIdx !== null) {
    const b = getBreaks()[Number(breakIdx)];
    if (b) {
      return renderSocialCard({
        title: b.title,
        category: b.category,
        kicker: clip(b.why, 200),
        breaking: true,
      });
    }
  }

  return new Response('Not found', { status: 404 });
}
