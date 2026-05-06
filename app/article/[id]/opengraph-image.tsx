/**
 * Per-article OG image. Next.js auto-wires this into the article page's
 * <meta property="og:image"> tag based on file location convention:
 *   app/article/[id]/opengraph-image.tsx
 * is exposed at:
 *   /article/[slug]/opengraph-image
 *
 * Cached forever after first generation (until article content changes).
 */
import { renderOgCard } from '../../../lib/og-card';
import { getArticleBySlug } from '../../../lib/articles';

// Use Node.js runtime so we can read articles.json from disk (lib/articles
// uses `fs`, which the edge runtime doesn't support). The image generation
// itself is fast; we don't strictly need the edge.
export const runtime = 'nodejs';

export const alt = 'MonoKromatik Network';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// In Next.js 15+, dynamic route params are passed as a Promise to async
// route handlers. Both the article page and this OG handler must await
// params before accessing properties.
export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = getArticleBySlug(id);

  if (!article) {
    // Fallback card for invalid slugs — keeps the route from 500-ing if
    // the page is requested with a slug that no longer exists.
    return renderOgCard({
      title: 'MonoKromatik Network',
      category: 'African Stories',
    });
  }

  return renderOgCard({
    title: article.title,
    category: article.category,
  });
}
