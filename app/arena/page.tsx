import Link from 'next/link';
import { Trophy, Clock } from 'lucide-react';
import Navigation from '../components/Navigation';
import { getArticlesByCategory, getReadingTime, formatDate } from '../../lib/articles';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Arena — African Sports & Competition | MonoKromatik Network',
  description: 'PSL drama, CAF action, African players in Europe. Sports coverage with the insider lens BBC and ESPN miss. AI-curated, diaspora-first.',
  keywords: ['African sports', 'PSL', 'CAF', 'African football', 'Bafana Bafana', 'Super Eagles', 'African athletes', 'African players Europe'],
  openGraph: {
    title: 'Arena — African Sports Coverage',
    description: 'PSL, CAF, African players abroad — the insider lens.',
    type: 'website',
    url: 'https://www.monokromatik.com/arena',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Arena — African Sports Coverage',
    description: 'PSL, CAF, African players abroad — the insider lens.',
  },
  alternates: { canonical: 'https://www.monokromatik.com/arena' },
};

export const revalidate = 300;

export default function ArenaPage() {
  const articles = getArticlesByCategory('sports').sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  return (
    <div className="min-h-screen bg-mono-white">
      <Navigation />

      <section className="py-16 bg-mono-black text-mono-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            <Trophy className="text-mono-amber" size={48} />
            <h1 className="text-5xl md:text-6xl font-display font-bold">
              <span className="text-mono-amber">ARENA</span>
            </h1>
          </div>
          <p className="text-2xl md:text-3xl font-display text-mono-soft-white mb-4">
            — Sports &amp; Competition
          </p>
          <p className="text-lg text-mono-gray font-body max-w-2xl">
            From PSL playoff drama to African players lighting up European leagues. Coverage with
            the cultural context global outlets always miss.
          </p>
        </div>
      </section>

      <section className="py-16 bg-mono-soft-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {articles.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-mono-charcoal font-display text-2xl mb-4">
                Match-day coverage incoming.
              </p>
              <p className="text-mono-gray font-body text-lg mb-8">
                Our agents are tracking PSL, CAF, and African players abroad as we speak.
              </p>
              <Link
                href="/pulse"
                className="inline-block px-6 py-3 bg-mono-amber text-mono-white font-display font-bold hover:bg-mono-amber/90 transition-colors"
              >
                EXPLORE PULSE
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => {
                const readingTime = getReadingTime(article.content);
                const fallbackImage =
                  'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&h=600&fit=crop';
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
                        loading="lazy"
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
