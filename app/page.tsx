'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, TrendingUp, Mic, ShoppingBag, ArrowRight, Users, Globe } from 'lucide-react';
import Navigation from './components/Navigation';

// Sample article data (replace with real API/CMS data later)
const sampleArticles = {
  pulse: [
    {
      id: 1,
      title: "Burna Boy's Secret Collaboration Shocks Afrobeats Scene",
      category: "Music",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop",
      views: "24.5K",
      time: "2h ago"
    },
    {
      id: 2,
      title: "PSL Playoffs: Kaizer Chiefs' Dramatic Last-Minute Victory",
      category: "Sports",
      image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop",
      views: "18.2K",
      time: "4h ago"
    },
    {
      id: 3,
      title: "Nairobi Tech Boom: African Startups Raise $500M This Quarter",
      category: "Business",
      image: "https://images.unsplash.com/photo-1526470498-9ae0e47c3f39?w=800&h=600&fit=crop",
      views: "15.7K",
      time: "6h ago"
    },
    {
      id: 4,
      title: "Davido Announces Surprise Album Drop for This Friday",
      category: "Entertainment",
      image: "https://images.unsplash.com/photo-1598387181032-a3103a2db5b1?w=800&h=600&fit=crop",
      views: "12.3K",
      time: "8h ago"
    },
  ],
  roots: [
    {
      id: 5,
      title: "The Rise of Amapiano: How South African Sound Conquered the World",
      category: "Culture",
      image: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=800&h=600&fit=crop",
      views: "10.1K",
      time: "1d ago"
    },
    {
      id: 6,
      title: "Preserving Yoruba Traditions in the Digital Age",
      category: "Heritage",
      image: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=800&h=600&fit=crop",
      views: "8.9K",
      time: "1d ago"
    },
    {
      id: 7,
      title: "African Fashion Week: Bold Statements on Global Runways",
      category: "Fashion",
      image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&h=600&fit=crop",
      views: "7.2K",
      time: "2d ago"
    },
  ],
  arena: [
    {
      id: 8,
      title: "Mo Salah Breaks Premier League Records Again",
      category: "Football",
      image: "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=800&h=600&fit=crop",
      views: "22.4K",
      time: "3h ago"
    },
    {
      id: 9,
      title: "CAF Champions League: North African Dominance Continues",
      category: "Football",
      image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&h=600&fit=crop",
      views: "14.6K",
      time: "5h ago"
    },
  ],
  waves: [
    {
      id: 10,
      title: "Tems' Grammy Win Inspires New Generation of African Artists",
      category: "Music",
      image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop",
      views: "19.3K",
      time: "12h ago"
    },
    {
      id: 11,
      title: "Nollywood's Global Streaming Revolution",
      category: "Film",
      image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=600&fit=crop",
      views: "11.8K",
      time: "1d ago"
    },
  ],
};

function StoryCard({ article, featured = false }: { article: any; featured?: boolean }) {
  return (
    <Link
      href={`/article/${article.id}`}
      className={`group relative overflow-hidden bg-mono-charcoal ${
        featured ? 'aspect-[16/9]' : 'aspect-[4/3]'
      } hover:scale-[1.02] transition-transform duration-300`}
    >
      <img
        src={article.image}
        alt={article.title}
        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-mono-black via-mono-black/50 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="px-2 py-1 bg-mono-amber text-mono-white text-xs font-display font-bold tracking-wider">
            {article.category}
          </span>
          <span className="text-xs text-mono-gray font-body">{article.time}</span>
          <span className="text-xs text-mono-gray font-body flex items-center gap-1">
            <Users size={12} /> {article.views}
          </span>
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
    readers: 456,
    countries: 23,
    articles: 1247,
  });

  useEffect(() => {
    // Simulate live stats updates
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        readers: prev.readers + Math.floor(Math.random() * 5) - 2,
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterStatus('Thanks! Check your inbox for confirmation.');
    setNewsletterEmail('');
  };

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

          {/* Live Stats Bar - Psychological Moonshot #1: Operational Transparency */}
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

      {/* PULSE Section - Trending Stories */}
      <section className="py-16 bg-mono-soft-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-mono-black">
              <span className="text-mono-amber">PULSE</span> — Trending Now
            </h2>
            <Link
              href="/pulse"
              className="text-mono-black hover:text-mono-amber transition-colors font-display font-medium flex items-center gap-2"
            >
              View All <ArrowRight size={20} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:row-span-2">
              <StoryCard article={sampleArticles.pulse[0]} featured />
            </div>
            {sampleArticles.pulse.slice(1, 3).map((article) => (
              <StoryCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      </section>

      {/* ROOTS Section - Culture */}
      <section className="py-16 bg-mono-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-mono-black">
              <span className="text-mono-amber">ROOTS</span> — Culture & Heritage
            </h2>
            <Link
              href="/roots"
              className="text-mono-black hover:text-mono-amber transition-colors font-display font-medium flex items-center gap-2"
            >
              Explore <ArrowRight size={20} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sampleArticles.roots.map((article) => (
              <StoryCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      </section>

      {/* ARENA Section - Sports */}
      <section className="py-16 bg-mono-soft-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-mono-black">
              <span className="text-mono-amber">ARENA</span> — Sports & Competition
            </h2>
            <Link
              href="/arena"
              className="text-mono-black hover:text-mono-amber transition-colors font-display font-medium flex items-center gap-2"
            >
              All Sports <ArrowRight size={20} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sampleArticles.arena.map((article) => (
              <StoryCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      </section>

      {/* WAVES Section - Entertainment */}
      <section className="py-16 bg-mono-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-mono-black">
              <span className="text-mono-amber">WAVES</span> — Entertainment
            </h2>
            <Link
              href="/waves"
              className="text-mono-black hover:text-mono-amber transition-colors font-display font-medium flex items-center gap-2"
            >
              More Entertainment <ArrowRight size={20} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sampleArticles.waves.map((article) => (
              <StoryCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      </section>

      {/* Video & Podcast Section */}
      <section className="py-16 bg-mono-black text-mono-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-display font-bold mb-6 flex items-center gap-3">
                <Play className="text-mono-amber" size={32} />
                <span>WATCH</span>
              </h2>
              <p className="text-mono-soft-white font-body mb-6">
                Behind-the-scenes, interviews, and visual stories from across the continent.
              </p>
              <Link
                href="/watch"
                className="inline-block px-6 py-3 bg-mono-amber text-mono-white font-display font-bold hover:bg-mono-amber/90 transition-colors"
              >
                EXPLORE VIDEOS
              </Link>
            </div>

            <div>
              <h2 className="text-3xl font-display font-bold mb-6 flex items-center gap-3">
                <Mic className="text-mono-amber" size={32} />
                <span>LISTEN</span>
              </h2>
              <p className="text-mono-soft-white font-body mb-6">
                Deep conversations, cultural insights, and stories you won't hear anywhere else.
              </p>
              <Link
                href="/listen"
                className="inline-block px-6 py-3 bg-mono-amber text-mono-white font-display font-bold hover:bg-mono-amber/90 transition-colors"
              >
                BROWSE PODCASTS
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter - Psychological Moonshot #3: Reduce Uncertainty Anxiety */}
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
                JOIN 1,247 PULSE READERS
              </button>
            </div>
            {newsletterStatus && (
              <p className="mt-4 text-center text-mono-white font-body">{newsletterStatus}</p>
            )}
          </form>

          <div className="mt-8 p-6 bg-mono-white/10 backdrop-blur-sm border border-mono-white/20 rounded-lg">
            <p className="text-mono-white/70 font-body text-sm mb-3">⚡ Last week's top stories:</p>
            <ul className="text-mono-white font-body space-y-2">
              <li>• Burna Boy's secret collab with Wizkid drops this Friday</li>
              <li>• PSL playoff drama: Sundowns' controversial penalty decision</li>
              <li>• Nairobi tech boom: 5 startups raising $100M+ rounds</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Merch Teaser */}
      <section className="py-16 bg-mono-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 p-8 md:p-12 bg-mono-charcoal">
            <div className="text-mono-white max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 flex items-center gap-3">
                <ShoppingBag className="text-mono-amber" size={36} />
                <span>MONOKROMATIK SHOP</span>
              </h2>
              <p className="text-mono-soft-white font-body text-lg mb-6">
                Rep the movement. Fresh drops every Friday. Limited quantities. 
                Designed for the diaspora.
              </p>
              <Link
                href="/shop"
                className="inline-block px-8 py-4 bg-mono-amber text-mono-white font-display font-bold text-lg hover:bg-mono-amber/90 transition-colors"
              >
                SHOP NOW
              </Link>
            </div>
            <div className="flex-shrink-0">
              <div className="w-48 h-48 bg-mono-amber/20 border-4 border-mono-amber flex items-center justify-center">
                <span className="text-6xl font-display font-bold text-mono-amber">PULSE</span>
              </div>
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
