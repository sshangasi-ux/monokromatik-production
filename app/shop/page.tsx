import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import Navigation from '../components/Navigation';
import NewsletterSignup from '../components/NewsletterSignup';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop — MonoKromatik Merch | MonoKromatik Network',
  description: 'MonoKromatik merch built for the diaspora. Tees, prints, and culture pieces. Launching late 2026. Pulse Reader merch drops first.',
  keywords: ['MonoKromatik merch', 'African merch', 'diaspora apparel', 'Africa fashion'],
  openGraph: {
    title: 'Shop — MonoKromatik Merch',
    description: 'Tees, prints, and culture pieces built for the diaspora. Launching late 2026.',
    type: 'website',
    url: 'https://www.monokromatik.com/shop',
  },
  twitter: {
    card: 'summary',
    title: 'Shop — MonoKromatik Merch',
    description: 'Tees, prints, and culture pieces built for the diaspora. Launching late 2026.',
  },
  alternates: { canonical: 'https://www.monokromatik.com/shop' },
  // "Coming soon" placeholder — keep it out of search until it ships.
  robots: { index: false, follow: true },
};

export default function ShopPage() {
  return (
    <div className="min-h-screen bg-mono-white">
      <Navigation />

      <section className="bg-mono-amber text-mono-black py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="font-display text-xs font-bold tracking-[0.18em] uppercase">Coming Soon</span>
          <p className="font-body text-sm">Merch launching late 2026</p>
        </div>
      </section>

      <section className="py-16 bg-mono-black text-mono-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            <ShoppingBag className="text-mono-amber" size={48} />
            <h1 className="text-5xl md:text-6xl font-display font-bold">
              <span className="text-mono-amber">SHOP</span>
            </h1>
          </div>
          <p className="text-2xl md:text-3xl font-display text-mono-soft-white mb-4">
            — Built For The Culture
          </p>
          <p className="text-lg text-mono-gray font-body max-w-2xl">
            Merch designed for the diaspora. Tees, prints, and culture pieces with the MonoKromatik
            aesthetic. Launching late 2026.
          </p>
        </div>
      </section>

      <section className="py-20 bg-mono-soft-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-mono-charcoal font-display text-2xl mb-4">
            Pulse Readers get first dibs.
          </p>
          <p className="text-mono-gray font-body text-lg mb-12">
            We&apos;re building the merch line that makes diaspora pride wearable. Monochrome
            silhouettes, burnt-amber accents, drops dropped weekly. Subscribe below — Pulse
            Readers shop the launch a full week before everyone else.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 text-left">
            <div className="p-6 bg-mono-white border-2 border-mono-charcoal">
              <div className="text-mono-amber-strong font-display font-bold mb-2">TEES</div>
              <p className="text-mono-charcoal font-body text-sm">
                Heavyweight cotton, MonoKromatik graphic prints, designed in Jozi.
              </p>
            </div>
            <div className="p-6 bg-mono-white border-2 border-mono-charcoal">
              <div className="text-mono-amber-strong font-display font-bold mb-2">PRINTS</div>
              <p className="text-mono-charcoal font-body text-sm">
                Limited-edition art prints celebrating African creators and moments.
              </p>
            </div>
            <div className="p-6 bg-mono-white border-2 border-mono-charcoal">
              <div className="text-mono-amber-strong font-display font-bold mb-2">PIECES</div>
              <p className="text-mono-charcoal font-body text-sm">
                Caps, totes, hoodies. Wearable culture, built to last.
              </p>
            </div>
          </div>

          <Link
            href="/pulse"
            className="inline-block px-6 py-3 bg-mono-amber text-mono-black font-display font-bold hover:bg-mono-amber/90 transition-colors"
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
