import Link from 'next/link';
import { Headphones } from 'lucide-react';
import Navigation from '../components/Navigation';
import NewsletterSignup from '../components/NewsletterSignup';
import { getNarrations } from '../../lib/audio';
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
  const narrations = getNarrations();

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
            crafted for the diaspora.
          </p>
        </div>
      </section>

      {narrations.length > 0 && (
        <section className="py-16 bg-mono-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-baseline justify-between mb-8">
              <h2 className="text-3xl font-display font-bold text-mono-black">
                Article <span className="text-mono-amber-strong">Narrations</span>
              </h2>
              <span className="text-sm text-mono-gray font-body">{narrations.length} audio edition{narrations.length === 1 ? '' : 's'}</span>
            </div>
            <ul className="space-y-6">
              {narrations.map((n) => (
                <li key={n.slug} className="p-6 bg-mono-soft-white border-2 border-mono-charcoal">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-mono-amber text-mono-white text-xs font-display font-bold uppercase">
                      {n.category}
                    </span>
                  </div>
                  <Link href={`/article/${n.slug}`} className="group">
                    <h3 className="text-xl font-display font-bold text-mono-black group-hover:text-mono-amber-strong transition-colors mb-2">
                      {n.title}
                    </h3>
                  </Link>
                  <p className="text-sm text-mono-gray font-body mb-4 line-clamp-2">{n.excerpt}</p>
                  <audio controls preload="none" className="w-full" src={n.audioUrl}>
                    Your browser does not support audio playback.
                  </audio>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="py-20 bg-mono-soft-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-mono-charcoal font-display text-2xl mb-4">
            {narrations.length > 0 ? 'More on the way.' : 'Press play. Patience required.'}
          </p>
          <p className="text-mono-gray font-body text-lg mb-8">
            {narrations.length > 0
              ? 'New narrated editions land as stories publish. Subscribe below and every Sunday Pulse brings our top picks of the week’s African music drops, podcast episodes, and audio moments worth your headphones.'
              : 'Narrated audio editions are rolling out now. Subscribe below — every Sunday Pulse edition includes our top picks of the week’s African music drops, podcast episodes, and audio moments worth your headphones.'}
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
