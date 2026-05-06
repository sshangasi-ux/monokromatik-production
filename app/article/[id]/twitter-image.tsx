/**
 * Twitter-specific share image. Twitter prefers `twitter:image` over
 * `og:image` when both are present — same visual, but Next.js requires
 * a separate file convention for the Twitter card route.
 */
import { renderOgCard } from '../../../lib/og-card';
import { getArticleBySlug } from '../../../lib/articles';

export const runtime = 'nodejs';

export const alt = 'MonoKromatik Network';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = getArticleBySlug(id);

  if (!article) {
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
