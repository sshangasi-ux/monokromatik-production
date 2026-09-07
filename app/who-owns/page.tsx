import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Navigation from '../components/Navigation';
import WhoOwnsChecker, { type OwnEntry } from '../components/WhoOwnsChecker';
import { getAllArticles } from '../../lib/articles';

const URL = 'https://www.monokromatik.com/who-owns';

export const metadata: Metadata = {
  title: 'Who Owns It? — The African Brand Ownership Checker | MonoKromatik',
  description:
    'Type any African brand and see who really owns it — sourced, with a value-capture verdict on whether the ownership stayed African or moved abroad. Paystack, MTN, DStv, Amarula and more.',
  keywords: ['who owns african brands', 'african brand ownership checker', 'who owns MTN', 'who owns Paystack', 'who owns DStv', 'african ownership'],
  alternates: { canonical: URL },
  openGraph: {
    title: 'Who Owns It? — The African Brand Ownership Checker',
    description: 'Type any African brand and see who really owns it — sourced, with a value-capture verdict.',
    type: 'website',
    url: URL,
  },
};

export const revalidate = 3600;

// Same verdict map as the /who-owns-africa pillar, so the two surfaces agree.
const VERDICT: Record<string, 'african' | 'foreign'> = {
  'who-owns-dangote': 'african', 'who-owns-flutterwave': 'african', 'who-owns-mtn': 'african',
  'who-owns-nandos': 'african', 'who-owns-shoprite': 'african', 'who-owns-access-bank': 'african',
  'who-owns-glo': 'african', 'who-owns-chivita': 'african',
  'who-owns-amarula': 'foreign', 'who-owns-indomie': 'foreign', 'who-owns-jumia': 'foreign',
  'who-owns-mavin-records': 'foreign', 'who-owns-multichoice-dstv': 'foreign', 'who-owns-nigerian-breweries': 'foreign',
  'who-owns-opay': 'foreign', 'who-owns-paystack': 'foreign', 'who-owns-safaricom': 'foreign',
  'who-owns-tecno': 'foreign', 'who-owns-tusker': 'foreign', 'who-owns-guinness-nigeria': 'foreign',
};

const brandOf = (title: string) => title.replace(/^Who Owns\s+/i, '').replace(/\?\s*$/, '').trim();
const ownerOf = (seoTitle?: string, excerpt?: string) => {
  if (seoTitle && seoTitle.includes('? ')) return seoTitle.split('? ').slice(1).join('? ').trim();
  if (excerpt) return excerpt.replace(/^Short answer:\s*/i, '').split('.')[0].trim();
  return 'See the answer';
};

export default function WhoOwnsPage() {
  const entries: OwnEntry[] = getAllArticles()
    .filter((a) => a.format === 'brief' && (/^who owns/i.test(a.title) || a.slug.startsWith('who-owns')))
    .map((a) => ({
      brand: brandOf(a.title),
      owner: ownerOf(a.seoTitle, a.excerpt),
      verdict: VERDICT[a.slug] ?? null,
      slug: a.slug,
    }))
    .sort((a, b) => a.brand.localeCompare(b.brand));

  return (
    <div className="min-h-screen bg-mono-white">
      <Navigation />

      <section className="bg-mono-black text-mono-white pt-24 pb-14 md:pt-28 md:pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.35em] font-display font-bold text-mono-amber mb-6">THE OWNERSHIP CHECKER</p>
          <h1 className="text-4xl md:text-6xl font-display font-bold leading-[0.98] max-w-3xl">Who owns it?</h1>
          <p className="mt-6 max-w-2xl text-lg md:text-xl text-mono-soft-white font-body leading-relaxed">
            Type an African brand. Get the sourced answer — and the one thing the deal-count reports never
            publish: a verdict on whether the ownership stayed African, or moved abroad.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-mono-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <WhoOwnsChecker entries={entries} />
        </div>
      </section>

      <section className="py-12 md:py-14 bg-mono-soft-white border-t border-mono-gray/15">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-xl">
            <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong mb-2">GO DEEPER</p>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-mono-black">
              {entries.length} brands decoded — and the deals moving ownership across the continent.
            </h2>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link href="/who-owns-africa" className="inline-flex items-center gap-2 bg-mono-black text-mono-white px-6 py-3.5 font-display font-bold hover:bg-mono-charcoal transition-colors">
              THE FULL INDEX <ArrowRight size={16} />
            </Link>
            <Link href="/whos-buying-africa" className="inline-flex items-center gap-2 border border-mono-black text-mono-black px-6 py-3.5 font-display font-bold hover:bg-mono-white transition-colors">
              THE DEAL TRACKER
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
