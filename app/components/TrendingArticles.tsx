'use client';

import Link from 'next/link';
import { TrendingUp } from 'lucide-react';

interface Article {
  title: string;
  slug: string;
  category: string;
  publishedAt: string;
}

interface TrendingArticlesProps {
  articles: Article[];
  limit?: number;
}

function relativeDate(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 14) return 'Last week';
  return `${Math.floor(days / 7)} weeks ago`;
}

export default function TrendingArticles({ articles, limit = 5 }: TrendingArticlesProps) {
  // Ranked by recency — the honest signal available until the GA4 Data API
  // feedback loop supplies real read counts. No fabricated metrics.
  const trendingArticles = [...articles]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, limit);

  return (
    <div className="bg-mono-soft-white p-6 rounded-lg border-l-4 border-mono-amber">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-6 h-6 text-mono-amber" />
        <h3 className="text-2xl font-display font-bold text-mono-black">
          TRENDING NOW
        </h3>
      </div>

      <div className="space-y-4">
        {trendingArticles.map((article, index) => (
          <Link
            key={article.slug}
            href={`/article/${article.slug}`}
            className="block group"
          >
            <div className="flex gap-4 hover:bg-mono-white p-3 rounded-lg transition-colors">
              <div className="flex-shrink-0">
                <span className="text-3xl font-display font-bold text-mono-amber">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-display font-bold text-mono-black group-hover:text-mono-amber transition-colors line-clamp-2 mb-1">
                  {article.title}
                </h4>

                <div className="flex items-center gap-3 text-sm">
                  <span className="px-2 py-0.5 bg-mono-black text-mono-white text-xs font-display font-bold rounded uppercase">
                    {article.category}
                  </span>
                  <span className="text-mono-gray font-body">
                    {relativeDate(article.publishedAt)}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-mono-gray">
        <p className="text-mono-gray font-body text-xs text-center">
          Latest across the network
        </p>
      </div>
    </div>
  );
}
