import Link from 'next/link';
import { TrendingUp, Clock } from 'lucide-react';
import Navigation from '../components/Navigation';
import { getAllArticles, getReadingTime, formatDate } from '../../lib/articles';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pulse — Trending African Stories | MonoKromatik Network',
  description: 'The latest trending stories from across Africa. Culture, sports, music, and entertainment served fresh — daily, AI-curated, diaspora-first.',
  openGraph: {
    title: 'Pulse — Trending African Stories',
    description: 'The latest trending stories from across Africa.',
    type: 'website',
    url: 'https://www.monokromatik.com/pulse',
  },
  alternates: { canonical: 'https://www.monokromatik.com/pulse' },
};

// Revalidate every 5 minutes so freshly published articles show up automatically
export const revalidate = 300;

export default function PulsePage() {
  const articles = getAllArticles().sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  return (
    <div className="min-h-screen bg-mono-white">
      <Navigation />

      <section className="py-16 bg-mono-black text-mono-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            <TrendingUp className="text-mono-amber" size={48} />
            <h1 className="text-5xl md:text-6xl font-display font-bold">
              <span className="text-mono-amber">PULSE</span>
            </h1>
          </div>
          <p className="text-xl text-mono-soft-white font-body max-w-2xl">
            Trending stories from across the continent. Updated continuously by our AI editors.
          </p>
        </div>
      </section>

      <section className="py-16 bg-mono-soft-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {articles.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-mono-gray font-body text-lg">
                The newsroom is warming up. Check back in a few minutes.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => {
                const readingTime = getReadingTime(article.content);
                const fallbackImage =
                  '/fallback-hero.svg';
                return (
                  <Link
                    key={article.slug}
                    href={`/article/${article.slug}`}
                    className="group"
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-mono-charcoal mb-3 relative">
                      <img
                        src={article.imageUrl || fallbackImage}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-mono-black via-mono-black/50 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className="px-2 py-1 bg-mono-amber text-mono-white text-xs font-display font-bold uppercase">
                            {article.category}
                          </span>
                          <span className="text-xs text-mono-gray font-body">
                            {formatDate(article.publishedAt)}
                          </span>
                          <span className="text-xs text-mono-gray flex items-center gap-1 font-body">
                            <Clock size={12} /> {readingTime} min
                          </span>
                        </div>
                        <h3 className="text-mono-white font-display font-bold text-lg leading-tight group-hover:text-mono-amber transition-colors">
                          {article.title}
                        </h3>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
