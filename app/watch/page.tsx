import Link from 'next/link';
import { Play, Clock } from 'lucide-react';
import Navigation from '../components/Navigation';
import MediaImage from '../components/MediaImage';
import NewsletterSignup from '../components/NewsletterSignup';
import { getAllArticles, getReadingTime, formatDate } from '../../lib/articles';
import type { Metadata } from 'next';

const YT_CHANNEL = 'https://www.youtube.com/@MonoKromatikNetwork?sub_confirmation=1';
const YT_TRAILER = 'https://www.youtube.com/embed/jzhnsnGP0WM';

function Youtube({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.5 15.5v-7l6.5 3.5-6.5 3.5Z" />
    </svg>
  );
}

export const metadata: Metadata = {
  title: 'Watch — Brand Intelligence Explainers | MonoKromatik',
  description:
    'Short, deeply-sourced video explainers on who owns, monetizes and captures the value across African & diaspora culture, business, sport and music. Every video is tied to a full research article.',
  keywords: ['African business explained', 'brand intelligence video', 'who owns Africa', 'value capture', 'Afrobeats business', 'African fintech', 'African economy explainer'],
  openGraph: {
    title: 'Watch — MonoKromatik Brand Intelligence',
    description: 'Who owns the culture. Who captures the value. Short, sourced explainers, tied to the research.',
    type: 'website',
    url: 'https://www.monokromatik.com/watch',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Watch — MonoKromatik Brand Intelligence',
    description: 'Who owns the culture. Who captures the value. Short, sourced explainers, tied to the research.',
  },
  alternates: { canonical: 'https://www.monokromatik.com/watch' },
};

export const revalidate = 300;

export default function WatchPage() {
  // One card per unique video: a video may be embedded on more than one article
  // (an explainer and the feature it extends can share the same cut). Keep the
  // earliest — the piece it was made for — so re-using a video elsewhere enriches
  // that page without duplicating the Watch grid.
  const byVideo = new Map<string, ReturnType<typeof getAllArticles>[number]>();
  for (const a of getAllArticles()) {
    if (!a.videoUrl) continue;
    const prev = byVideo.get(a.videoUrl);
    if (!prev || new Date(a.publishedAt).getTime() < new Date(prev.publishedAt).getTime()) {
      byVideo.set(a.videoUrl, a);
    }
  }
  const articles = [...byVideo.values()].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  return (
    <div className="min-h-screen bg-mono-white">
      <Navigation />

      {/* Hero */}
      <section className="pt-24 pb-14 bg-mono-black text-mono-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            <Play className="text-mono-amber" size={44} />
            <h1 className="text-5xl md:text-6xl font-display font-bold">
              <span className="text-mono-amber">WATCH</span>
            </h1>
          </div>
          <p className="text-2xl md:text-3xl font-display text-mono-soft-white mb-4">
            Who owns the culture. Who captures the value.
          </p>
          <p className="text-lg text-mono-gray font-body max-w-2xl mb-8">
            Short, deeply-sourced explainers on the money and power behind African &amp; diaspora
            culture, business, sport and music — each tied to a full research article, with every
            figure cited on screen.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <a
              href={YT_CHANNEL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-mono-amber text-mono-black font-display font-bold tracking-[0.06em] hover:bg-mono-amber/90 transition-colors"
            >
              <Youtube size={20} /> SUBSCRIBE ON YOUTUBE
            </a>
            <Link
              href="/intelligence"
              className="inline-flex items-center px-6 py-3 border border-mono-white/30 text-mono-white font-display font-bold tracking-[0.06em] hover:bg-mono-white hover:text-mono-black transition-colors"
            >
              READ THE RESEARCH
            </Link>
          </div>
        </div>
      </section>

      {/* Trailer */}
      <section className="bg-mono-black pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="aspect-video w-full overflow-hidden border border-mono-white/10">
            <iframe
              src={YT_TRAILER}
              title="MonoKromatik — channel trailer"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      {/* Explainers grid */}
      <section className="py-16 bg-mono-soft-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-mono-black">
              The explainers
            </h2>
            <a
              href={YT_CHANNEL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 text-sm font-display font-bold text-mono-amber-strong hover:text-mono-amber-hover"
            >
              <Youtube size={16} /> All videos on YouTube
            </a>
          </div>

          {articles.length === 0 ? (
            <p className="text-mono-gray font-body text-lg">
              New explainers are dropping weekly.{' '}
              <a href={YT_CHANNEL} target="_blank" rel="noopener noreferrer" className="text-mono-amber-strong font-bold underline">
                Subscribe on YouTube
              </a>{' '}
              to see them first.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => {
                const readingTime = getReadingTime(article.content);
                const fallbackImage =
                  'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&h=600&fit=crop';
                return (
                  <Link key={article.slug} href={`/article/${article.slug}`} className="group">
                    <div className="aspect-[16/9] overflow-hidden bg-mono-charcoal mb-3 relative">
                      <MediaImage fill src={article.imageUrl || fallbackImage} alt={article.title} />
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
          )}
        </div>
      </section>

      {/* Newsletter capture */}
      <section className="py-16 bg-mono-black">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <NewsletterSignup variant="default" source="watch" />
        </div>
      </section>
    </div>
  );
}
