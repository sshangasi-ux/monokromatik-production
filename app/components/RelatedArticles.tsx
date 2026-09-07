'use client';

import Image from 'next/image';
import Link from 'next/link';

interface Article {
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  imageUrl?: string;
  readingTime?: number;
  publishedAt: string;
  tags?: string[];
}

interface RelatedArticlesProps {
  currentSlug: string;
  category: string;
  articles: Article[];
}

export default function RelatedArticles({ currentSlug, category, articles }: RelatedArticlesProps) {
  // Depth module: keep readers inside the cluster. Score candidates by shared
  // tags (a who-owns piece surfaces its siblings, not just any recent same-category
  // article), with a small same-category bonus, breaking ties by recency. Backfill
  // with same-category-recent so it never shows fewer than before.
  const curTags = new Set((articles.find(a => a.slug === currentSlug)?.tags || []).map(t => t.toLowerCase()));
  const scored = articles
    .filter(a => a.slug !== currentSlug)
    .map(a => {
      const shared = (a.tags || []).filter(t => curTags.has(t.toLowerCase())).length;
      return { a, score: shared * 3 + (a.category === category ? 1 : 0), ts: new Date(a.publishedAt).getTime() };
    })
    .filter(x => x.score > 0)
    .sort((x, y) => y.score - x.score || y.ts - x.ts)
    .map(x => x.a);

  const relatedArticles = scored.slice(0, 3);
  if (relatedArticles.length < 3) {
    const have = new Set([currentSlug, ...relatedArticles.map(a => a.slug)]);
    const fill = articles
      .filter(a => !have.has(a.slug) && a.category === category)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    relatedArticles.push(...fill.slice(0, 3 - relatedArticles.length));
  }

  if (relatedArticles.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 border-t-2 border-mono-amber pt-12">
      <h2 className="text-3xl font-display font-bold text-mono-black mb-8">
        READ NEXT
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {relatedArticles.map((article) => (
          <Link
            key={article.slug}
            href={`/article/${article.slug}`}
            className="group"
          >
            <article className="h-full flex flex-col">
              {article.imageUrl && (
                <div className="relative w-full h-48 mb-4 overflow-hidden rounded-lg">
                  <Image
                    src={article.imageUrl}
                    alt={article.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              )}
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-3 py-1 bg-mono-amber text-mono-black text-xs font-display font-bold rounded uppercase">
                    {article.category}
                  </span>
                  {article.readingTime && (
                    <span className="text-mono-gray text-sm font-body">
                      {article.readingTime} min read
                    </span>
                  )}
                </div>
                
                <h3 className="text-xl font-display font-bold text-mono-black group-hover:text-mono-amber transition-colors mb-2 line-clamp-2">
                  {article.title}
                </h3>
                
                <p className="text-mono-charcoal font-body text-sm line-clamp-2">
                  {article.excerpt}
                </p>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}
