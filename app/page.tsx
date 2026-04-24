'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Play, TrendingUp, Mic, ShoppingBag, ArrowRight, Users, Globe } from 'lucide-react';
import Navigation from './components/Navigation';
import { getAllArticles, getReadingTime, formatDate } from '../lib/articles';

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
  const defaultImage = 'https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=800&h=600&fit=crop';
  
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
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('');
  const [stats, setStats] = useState({
    readers: 466,
    countries: 23,
    articles: 5,
  });

  // Load articles using useMemo to prevent recalculation on every render
  const articles = useMemo(() => getAllArticles(), []);
  
  // Group articles by category
  const articlesByCategory = useMemo(() => {
    return {
      culture: articles.filter(a => a.category.toLowerCase() === 'culture'),
      music: articles.filter(a => a.category.toLowerCase() === 'music'),
      sports: articles.filter(a => a.category.toLowerCase() === 'sports'),
      entertainment: articles.filter(a => a.category.toLowerCase() === 'entertainment'),
      all: articles,
    };
  }, [articles]);

  useEffect(() => {
    // Update stats with actual article count
    setStats(prev => ({
      ...prev,
      articles: articles.length,
    }));
    
    // Simulate live reader stats updates
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        readers: Math.max(400, prev.readers + Math.floor(Math.random() * 10) - 5),
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, [articles]);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterStatus('Thanks! Check your inbox for confirmation.');
    setNewsletterEmail('');
  };

  // Get featured and latest articles
  const featuredArticle = articlesByCategory.all[0];
  const latestArticles = articlesByCategory.all.slice(0, 5);

  return (
    <div className="min-h-screen bg-mono-white">
      <Navigation />

      {/* Hero Section */}
      <section className="relative h-[70vh] md:h-[80vh] overflow-hidden bg-mono-black">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=1920&h=1080&fit=crop"
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

          {/* Live Stats Bar */}
          <div className="absolute bottom-8 left-4 right-4 sm:left-8 sm:right-8">
            <div className="flex flex-wrap items-center gap-6 px-6 py-4 bg-mono-black/60 backdrop-blur-md border border-mono-gray/20 text-mono-white">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-mono-amber rounded-full animate-pulse-slow" />
                <span className="text-sm font-body">
                  <span className="font-bold">{stats.readers}</span> readers online
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Globe size={16} className="text-mono-amber" />
                <span className="text-sm font-body">
                  <span className="font-bold">{stats.countries}</span> countries
                </span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-mono-amber" />
                <span className="text-sm font-body">
                  <span className="font-bold">{stats.articles}</span> stories published
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
              {latestArticles.slice(1, 5).map((article) => (
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
      <section className="py-20 bg-mono-amber">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-mono-white mb-4">
              GET THE PULSE
            </h2>
            <p className="text-mono-white/90 font-body text-lg mb-2">
              Every Sunday, 8AM GMT
            </p>
            <p className="text-mono-white font-body text-xl mb-6">
              The African stories BBC won't tell you. 5-minute read. No spam.
            </p>
          </div>

          <form onSubmit={handleNewsletterSubmit} className="max-w-xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 px-6 py-4 text-mono-black font-body text-lg focus:outline-none focus:ring-2 focus:ring-mono-white"
                required
              />
              <button
                type="submit"
                className="px-8 py-4 bg-mono-black text-mono-white font-display font-bold text-lg hover:bg-mono-charcoal transition-colors whitespace-nowrap"
              >
                JOIN THE MOVEMENT
              </button>
            </div>
            {newsletterStatus && (
              <p className="mt-4 text-center text-mono-white font-body">{newsletterStatus}</p>
            )}
          </form>

          {latestArticles.length > 0 && (
            <div className="mt-8 p-6 bg-mono-white/10 backdrop-blur-sm border border-mono-white/20 rounded-lg">
              <p className="text-mono-white/70 font-body text-sm mb-3">⚡ Latest stories:</p>
              <ul className="text-mono-white font-body space-y-2">
                {latestArticles.slice(0, 3).map((article) => (
                  <li key={article.slug}>• {article.title}</li>
                ))}
              </ul>
            </div>
          )}
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
              </ul>
            </div>
            <div>
              <h4 className="font-display font-bold mb-4">ABOUT</h4>
              <ul className="space-y-2 font-body text-sm">
                <li><Link href="/about" className="text-mono-gray hover:text-mono-amber transition-colors">Our Story</Link></li>
                <li><Link href="/about#how-it-works" className="text-mono-gray hover:text-mono-amber transition-colors">How It Works</Link></li>
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
