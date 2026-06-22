import Link from 'next/link';
import { Play, Clock } from 'lucide-react';
import Navigation from '../components/Navigation';
import MediaImage from '../components/MediaImage';
import NewsletterSignup from '../components/NewsletterSignup';
import { getAllArticles, getReadingTime, formatDate } from '../../lib/articles';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Watch — Video Stories | MonoKromatik Network',
  description: 'Music videos, behind-the-scenes, interviews, mini-documentaries. Visual storytelling from across Africa and the diaspora.',
  keywords: ['African videos', 'Afrobeats videos', 'African music videos', 'African documentaries', 'African interviews'],
  openGraph: {
    title: 'Watch — African Video Stories',
    description: 'Music videos, BTS, interviews, mini-docs — visual storytelling from the continent.',
    type: 'website',
    url: 'https://www.monokromatik.com/watch',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Watch — African Video Stories',
    description: 'Music videos, BTS, interviews, mini-docs — visual storytelling from the continent.',
  },
  alternates: { canonical: 'https://www.monokromatik.com/watch' },
};

export const revalidate = 300;

export default function WatchPage() {
  const articles = getAllArticles()
    .filter((a) => !!a.videoUrl)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return (
    <div className="min-h-screen bg-mono-white">
      <Navigation />

      <section className="bg-mono-amber text-mono-black py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="font-display text-xs font-bold tracking-[0.18em] uppercase">Coming Soon</span>
          <p className="font-body text-sm">Video storytelling launching in V2</p>
        </div>
      </section>

      <section className="py-16 bg-mono-black text-mono-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            <Play className="text-mono-amber" size={48} />
            <h1 className="text-5xl md:text-6xl font-display font-bold">
              <span className="text-mono-amber">WATCH</span>
            </h1>
          </div>
          <p className="text-2xl md:text-3xl font-display text-mono-soft-white mb-4">
            — Video-First Storytelling
          </p>
          <p className="text-lg text-mono-gray font-body max-w-2xl">
            Music videos, behind-the-scenes, interviews, mini-documentaries. Visual storytelling
            from across the continent and diaspora.
          </p>
        </div>
      </section>

      {articles.length === 0 ? (
        <>
          <section className="py-20 bg-mono-soft-white">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <p className="text-mono-charcoal font-display text-2xl mb-4">
                Video coverage is expanding.
              </p>
              <p className="text-mono-gray font-body text-lg mb-8">
                Our agents are starting to embed videos with each story. Subscribe below and
                you&apos;ll be the first to see when WATCH gets its own dedicated drops.
              </p>
              <Link
                href="/pulse"
                className="inline-block px-6 py-3 bg-mono-amber text-mono-black font-display font-bold hover:bg-mono-amber/90 transition-colors"
              >
                EXPLORE PULSE
              </Link>
            </div>
          </section>
          <section className="py-16 bg-mono-black">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
              <NewsletterSignup variant="default" />
            </div>
          </section>
        </>
      ) : (
        <section className="py-16 bg-mono-soft-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => {
                const readingTime = getReadingTime(article.content);
                const fallbackImage =
                  'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&h=600&fit=crop';
                return (
                  <Link
                    key={article.slug}
                    href={`/article/${article.slug}`}
                    className="group"
                  >
                    <div className="aspect-[16/9] overflow-hidden bg-mono-charcoal mb-3 relative">
                      <MediaImage
                        fill
                        src={article.imageUrl || fallbackImage}
                        alt={article.title}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-mono-black via-mono-black/50 to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                        <div className="w-16 h-16 bg-mono-amber/90 rounded-full flex items-center justify-center">
                          <Play className="text-mono-white ml-1" size={28} fill="currentColor" />
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className="px-2 py-1 bg-mono-amber text-mono-black text-xs font-display font-bold uppercase">
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
          </div>
        </section>
      )}
    </div>
  );
}
