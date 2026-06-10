import Link from 'next/link';
import { Play, TrendingUp, Mic, ShoppingBag, ArrowRight, Users, Globe } from 'lucide-react';
import Navigation from './components/Navigation';
import NewsletterSignup from './components/NewsletterSignup';
import TrendingArticles from './components/TrendingArticles';
import { getAllArticles, getReadingTime, formatDate } from '../lib/articles';

// Force the homepage to revalidate every 60s. Without this, Next.js was
// serving a stale prerender for days after data/articles.json updated
// during agent runs. Article-detail pages already have revalidate = 300
// at app/article/[id]/page.tsx; this brings the homepage in line.
export const revalidate = 60;

interface StoryCardProps {
  article: {
    title: string;
    slug: string;
    excerpt: string;
    category: string;
    imageUrl?: string;
    publishedAt: string;
    content: string;
  };
  featured?: boolean;
}

function StoryCard({ article, featured = false }: StoryCardProps) {
  const readingTime = getReadingTime(article.content);
  const defaultImage = '/fallback-hero.svg';

  return (
    <Link
      href={`/article/${article.slug}`}
      className={`group relative overflow-hidden bg-mono-charcoal ${
        featured ? 'aspect-[16/9]' : 'aspect-[4/3]'
      } hover:scale-[1.02] transition-transform duration-300`}
    >
      <img
        src={article.imageUrl || defaultImage}
        alt={article.title}
        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-mono-black via-mono-black/50 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="px-2 py-1 bg-mono-amber text-mono-white text-xs font-display font-bold tracking-wider uppercase">
            {article.category}
          </span>
          <span className="text-xs text-mono-gray font-body">{readingTime} min read</span>
        </div>
        <h3 className={`text-mono-white font-display font-bold leading-tight group-hover:text-mono-amber transition-colors ${
          featured ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl'
        }`}>
          {article.title}
        </h3>
      </div>
    </Link>
  );
}

export default function Home() {
  // Server-component data load — reads data/articles.json on each
  // revalidation window (60s). No useMemo/useState needed since we
  // never re-render on the client; the server re-fetches on revalidate.
  const articles = getAllArticles();

  // Group articles by category
  const articlesByCategory = {
    culture: articles.filter(a => a.category.toLowerCase() === 'culture'),
    music: articles.filter(a => a.category.toLowerCase() === 'music'),
    sports: articles.filter(a => a.category.toLowerCase() === 'sports'),
    entertainment: articles.filter(a => a.category.toLowerCase() === 'entertainment'),
    all: articles,
  };

  // Honest stats — no Math.random, no fake numbers
  const stats = {
    articles: articles.length,
    countries: Math.max(1, articles.length),
    sources: 20,
  };

  // Get featured and latest articles
  const featuredArticle = articlesByCategory.all[0];
  // Cap at 7 — enough to fill 1 featured + 6 cards in the Latest grid.
  // The catalog is currently 7 articles strong after the EIC audit; scales
  // naturally as the agent fleet ships more.
  const latestArticles = articlesByCategory.all.slice(0, 7);

  return (
    <div className="min-h-screen bg-mono-white">
      <Navigation />

      {/* Hero Section */}
      <section className="relative h-[70vh] md:h-[80vh] overflow-hidden bg-mono-black">
        <div className="absolute inset-0">
          <img
            src="/fallback-hero.svg"
            alt="African Culture"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-mono-black via-mono-black/70 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-mono-white mb-6 leading-tight animate-slide-up">
              Experience The <span className="text-mono-amber">Pulse</span> Of African Content
            </h1>
            <p className="text-lg md:text-xl text-mono-soft-white font-body mb-8 animate-fade-in">
              Dive into stories BBC won't tell you. Culture, sports, and entertainment from an insider's lens.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-slide-up">
              <Link
                href="/pulse"
                className="px-8 py-4 bg-mono-amber text-mono-white font-display font-bold text-lg hover:bg-mono-amber/90 transition-colors inline-flex items-center justify-center gap-2"
              >
                EXPLORE THE NETWORK <ArrowRight size={20} />
              </Link>
              <Link
                href="/about"
                className="px-8 py-4 border-2 border-mono-white text-mono-white font-display font-bold text-lg hover:bg-mono-white hover:text-mono-black transition-colors inline-flex items-center justify-center gap-2"
              >
                WHO WE ARE
              </Link>
            </div>
          </div>

          {/* Honest Stats Bar — no fake live counters */}
          <div className="absolute bottom-8 left-4 right-4 sm:left-8 sm:right-8">
            <div className="flex flex-wrap items-center gap-6 px-6 py-4 bg-mono-black/60 backdrop-blur-md border border-mono-gray/20 text-mono-white">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-mono-amber" />
                <span className="text-sm font-body">
                  <span className="font-bold">{stats.articles}</span> stories published
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Globe size={16} className="text-mono-amber" />
                <span className="text-sm font-body">
                  <span className="font-bold">{stats.sources}</span> African sources monitored
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={16} className="text-mono-amber" />
                <span className="text-sm font-body">
                  Built by <span className="font-bold">1 human + AI agents</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Articles Section */}
      {latestArticles.length > 0 && (
        <section className="py-16 bg-mono-soft-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-mono-black">
                <span className="text-mono-amber">LATEST</span> — Hot Off The Press
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredArticle && (
                <div className="md:row-span-2">
                  <StoryCard article={featuredArticle} featured />
                </div>
              )}
              {latestArticles.slice(1, 7).map((article) => (
                <StoryCard key={article.slug} article={article} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Culture Articles */}
      {articlesByCategory.culture.length > 0 && (
        <section className="py-16 bg-mono-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-mono-black">
                <span className="text-mono-amber">ROOTS</span> — Culture & Heritage
              </h2>
              <Link href="/roots" className="font-display text-sm text-mono-amber-strong hover:text-mono-amber-hover hover:underline">
                See all →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {articlesByCategory.culture.slice(0, 3).map((article) => (
                <StoryCard key={article.slug} article={article} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Sports Articles */}
      {articlesByCategory.sports.length > 0 && (
        <section className="py-16 bg-mono-soft-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-mono-black">
                <span className="text-mono-amber">ARENA</span> — Sports & Competition
              </h2>
              <Link href="/arena" className="font-display text-sm text-mono-amber-strong hover:text-mono-amber-hover hover:underline">
                See all →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {articlesByCategory.sports.slice(0, 2).map((article) => (
                <StoryCard key={article.slug} article={article} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Music Articles */}
      {articlesByCategory.music.length > 0 && (
        <section className="py-16 bg-mono-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-mono-black">
                <span className="text-mono-amber">WAVES</span> — Music & Entertainment
              </h2>
              <Link href="/waves" className="font-display text-sm text-mono-amber-strong hover:text-mono-amber-hover hover:underline">
                See all →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {articlesByCategory.music.slice(0, 2).map((article) => (
                <StoryCard key={article.slug} article={article} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter Section */}
      <section className="py-20 bg-mono-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Newsletter (2/3 width) */}
            <div className="lg:col-span-2">
              <NewsletterSignup variant="default" />
            </div>

            {/* Trending Sidebar (1/3 width) */}
            <div>
              <TrendingArticles articles={articles} limit={5} />
            </div>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="py-12 bg-mono-black text-mono-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-display font-bold text-lg mb-4">MONOKROMATIK</h3>
              <p className="text-mono-gray font-body text-sm">
                African Stories BBC Won't Tell You
              </p>
            </div>
            <div>
              <h4 className="font-display font-bold mb-4">EXPLORE</h4>
              <ul className="space-y-2 font-body text-sm">
                <li><Link href="/pulse" className="text-mono-gray hover:text-mono-amber transition-colors">Pulse</Link></li>
                <li><Link href="/roots" className="text-mono-gray hover:text-mono-amber transition-colors">Roots</Link></li>
                <li><Link href="/arena" className="text-mono-gray hover:text-mono-amber transition-colors">Arena</Link></li>
                <li><Link href="/waves" className="text-mono-gray hover:text-mono-amber transition-colors">Waves</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-display font-bold mb-4">CONNECT</h4>
              <ul className="space-y-2 font-body text-sm">
                <li><Link href="/watch" className="text-mono-gray hover:text-mono-amber transition-colors">Watch</Link></li>
                <li><Link href="/listen" className="text-mono-gray hover:text-mono-amber transition-colors">Listen</Link></li>
                <li><Link href="/shop" className="text-mono-gray hover:text-mono-amber transition-colors">Shop</Link></li>
                <li><a href="/feed.xml" className="text-mono-gray hover:text-mono-amber transition-colors">RSS Feed</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-display font-bold mb-4">ABOUT</h4>
              <ul className="space-y-2 font-body text-sm">
                <li><Link href="/about" className="text-mono-gray hover:text-mono-amber transition-colors">Our Story</Link></li>
                <li><Link href="/about#how-it-works" className="text-mono-gray hover:text-mono-amber transition-colors">How It Works</Link></li>
                <li><Link href="/about#code" className="text-mono-gray hover:text-mono-amber transition-colors">Our Code</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-mono-gray/20 text-center text-mono-gray font-body text-sm">
            <p>© 2026 MonoKromatik Network. Built with ❤️ and AI.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
