'use client';

import Link from 'next/link';
import { TrendingUp, Users } from 'lucide-react';
import Navigation from '../components/Navigation';

const articles = [
  { id: 1, title: "Burna Boy's Secret Collaboration Shocks Afrobeats Scene", category: "Music", image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop", views: "24.5K", time: "2h ago" },
  { id: 2, title: "PSL Playoffs: Kaizer Chiefs' Dramatic Last-Minute Victory", category: "Sports", image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop", views: "18.2K", time: "4h ago" },
  { id: 3, title: "Nairobi Tech Boom: African Startups Raise $500M This Quarter", category: "Business", image: "https://images.unsplash.com/photo-1526470498-9ae0e47c3f39?w=800&h=600&fit=crop", views: "15.7K", time: "6h ago" },
];

export default function PulsePage() {
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
          <p className="text-xl text-mono-soft-white font-body">Trending stories from across the continent</p>
        </div>
      </section>

      <section className="py-16 bg-mono-soft-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Link key={article.id} href={`/article/${article.id}`} className="group">
                <div className="aspect-[4/3] overflow-hidden bg-mono-charcoal mb-3 relative">
                  <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-mono-black via-mono-black/50 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-2 py-1 bg-mono-amber text-mono-white text-xs font-display font-bold">{article.category}</span>
                      <span className="text-xs text-mono-gray">{article.time}</span>
                      <span className="text-xs text-mono-gray flex items-center gap-1"><Users size={12} /> {article.views}</span>
                    </div>
                    <h3 className="text-mono-white font-display font-bold text-lg leading-tight group-hover:text-mono-amber transition-colors">{article.title}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
