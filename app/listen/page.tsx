import Link from 'next/link';
import { Headphones } from 'lucide-react';
import Navigation from '../components/Navigation';
import NewsletterSignup from '../components/NewsletterSignup';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Listen — African Audio Stories | MonoKromatik Network',
  description: 'African podcasts, weekly music drops, and audio storytelling. Coming soon. Subscribe to the Sunday Pulse to be the first to hear.',
  keywords: ['African podcasts', 'African audio stories', 'Afrobeats podcasts', 'diaspora podcasts'],
  openGraph: {
    title: 'Listen — African Audio Stories',
    description: 'Podcasts, music drops, and audio storytelling — coming soon.',
    type: 'website',
    url: 'https://www.monokromatik.com/listen',
  },
  twitter: {
    card: 'summary',
    title: 'Listen — African Audio Stories',
    description: 'Podcasts, music drops, and audio storytelling — coming soon.',
  },
  alternates: { canonical: 'https://www.monokromatik.com/listen' },
};

export default function ListenPage() {
  return (
    <div className="min-h-screen bg-mono-white">
      <Navigation />

      <section className="py-16 bg-mono-black text-mono-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            <Headphones className="text-mono-amber" size={48} />
            <h1 className="text-5xl md:text-6xl font-display font-bold">
              <span className="text-mono-amber">LISTEN</span>
            </h1>
          </div>
          <p className="text-2xl md:text-3xl font-display text-mono-soft-white mb-4">
            — Audio Stories
          </p>
          <p className="text-lg text-mono-gray font-body max-w-2xl">
            African podcasts, weekly music drops, and storytelling for your commute. Curated by AI,
            crafted for the diaspora, dropping soon.
          </p>
        </div>
      </section>

      <section className="py-20 bg-mono-soft-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-mono-charcoal font-display text-2xl mb-4">
            Press play. Patience required.
          </p>
          <p className="text-mono-gray font-body text-lg mb-8">
            Audio storytelling launches in V2. Until then, subscribe below — every Sunday Pulse
            edition includes our top picks of the week&apos;s African music drops, podcast episodes,
            and audio moments worth your headphones.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 text-left">
            <div className="p-6 bg-mono-white border-2 border-mono-charcoal">
              <div className="text-mono-amber-strong font-display font-bold mb-2">WEEKLY</div>
              <p className="text-mono-charcoal font-body text-sm">
                Sunday Pulse audio digest of the week&apos;s biggest African music drops.
              </p>
            </div>
            <div className="p-6 bg-mono-white border-2 border-mono-charcoal">
              <div className="text-mono-amber-strong font-display font-bold mb-2">PODCASTS</div>
              <p className="text-mono-charcoal font-body text-sm">
                Long-form interviews with African artists, athletes, and creators.
              </p>
            </div>
            <div className="p-6 bg-mono-white border-2 border-mono-charcoal">
              <div className="text-mono-amber-strong font-display font-bold mb-2">DROPS</div>
              <p className="text-mono-charcoal font-body text-sm">
                Same-day coverage when major Afrobeats and Amapiano releases drop.
              </p>
            </div>
          </div>

          <Link
            href="/pulse"
            className="inline-block px-6 py-3 bg-mono-amber text-mono-white font-display font-bold hover:bg-mono-amber/90 transition-colors"
          >
            EXPLORE PULSE WHILE YOU WAIT
          </Link>
        </div>
      </section>

      <section className="py-16 bg-mono-black">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <NewsletterSignup variant="default" />
        </div>
      </section>
    </div>
  );
}
