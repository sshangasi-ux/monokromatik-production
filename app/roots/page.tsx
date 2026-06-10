import Link from 'next/link';
import { Sparkles, Clock } from 'lucide-react';
import Navigation from '../components/Navigation';
import MediaImage from '../components/MediaImage';
import { getArticlesByCategory, getReadingTime, formatDate } from '../../lib/articles';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Roots — African Culture & Heritage | MonoKromatik Network',
  description: 'African culture, identity, fashion, food, and heritage. The rituals, traditions, and modern movements that connect the diaspora to home. AI-curated, diaspora-first.',
  keywords: ['African culture', 'African heritage', 'Afrocentric', 'diaspora identity', 'African traditions', 'Tyla', 'African fashion'],
  openGraph: {
    title: 'Roots — African Culture & Heritage',
    description: 'Culture, identity, fashion, food — celebrating what connects the diaspora to home.',
    type: 'website',
    url: 'https://www.monokromatik.com/roots',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Roots — African Culture & Heritage',
    description: 'Culture, identity, fashion, food — celebrating what connects the diaspora to home.',
  },
  alternates: { canonical: 'https://www.monokromatik.com/roots' },
};

// Revalidate every 5 minutes so freshly published articles show up automatically
export const revalidate = 300;

export default function RootsPage() {
  const articles = getArticlesByCategory('culture').sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  return (
    <div className="min-h-screen bg-mono-white">
      <Navigation />

      <section className="py-16 bg-mono-black text-mono-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            <Sparkles className="text-mono-amber" size={48} />
            <h1 className="text-5xl md:text-6xl font-display font-bold">
              <span className="text-mono-amber">ROOTS</span>
            </h1>
          </div>
          <p className="text-2xl md:text-3xl font-display text-mono-soft-white mb-4">
            — Culture &amp; Heritage
          </p>
          <p className="text-lg text-mono-gray font-body max-w-2xl">
            The rituals, traditions, fashion, food, and modern movements that make us who we are.
            Stories that reach across oceans to remind the diaspora where they&apos;re from.
          </p>
        </div>
      </section>

      <section className="py-16 bg-mono-soft-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {articles.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-mono-charcoal font-display text-2xl mb-4">
                Fresh culture stories dropping soon.
              </p>
              <p className="text-mono-gray font-body text-lg mb-8">
                Our agents are sourcing the best from across the continent.
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
                  '/fallback-hero.svg';
                return (
                  <Link
                    key={article.slug}
                    href={`/article/${article.slug}`}
                    className="group"
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-mono-charcoal mb-3 relative">
                      <MediaImage
                        fill
                        src={article.imageUrl || fallbackImage}
                        alt={article.title}
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
