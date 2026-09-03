import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import Navigation from '../components/Navigation';
import { getAllArticles } from '../../lib/articles';

const URL = 'https://www.monokromatik.com/who-owns-africa';

export const metadata: Metadata = {
  title: 'Who Owns Africa? Every Brand, Decoded | MonoKromatik',
  description:
    'A running index of who really owns Africa’s biggest brands — from MTN, Dangote and Shoprite to Paystack, DStv, Tecno and Nando’s. The short answer on each, sorted by who stayed African-owned and who’s owned abroad now.',
  keywords: [
    'who owns africa', 'who owns african brands', 'african brand ownership',
    'who owns MTN', 'who owns Dangote', 'who owns Paystack', 'who owns DStv',
    'african brands foreign owned', 'value capture africa',
  ],
  alternates: { canonical: URL },
  openGraph: {
    title: 'Who Owns Africa? Every Brand, Decoded',
    description: 'The short answer on who owns Africa’s biggest brands — sorted by who stayed African-owned and who’s owned abroad now.',
    type: 'website',
    url: URL,
  },
};

export const revalidate = 3600;

/** Verdict for the branded "Who Owns X?" explainers. Curated, because the
 *  ownership call is the whole point of the page — unmapped briefs fall into
 *  "More files" so nothing ever disappears as the cluster grows. */
const VERDICT: Record<string, 'african' | 'foreign'> = {
  'who-owns-dangote': 'african',
  'who-owns-flutterwave': 'african',
  'who-owns-mtn': 'african',
  'who-owns-nandos': 'african',
  'who-owns-shoprite': 'african',
  'who-owns-access-bank': 'african',
  'who-owns-glo': 'african',
  'who-owns-chivita': 'african',
  'who-owns-amarula': 'foreign',
  'who-owns-indomie': 'foreign',
  'who-owns-jumia': 'foreign',
  'who-owns-mavin-records': 'foreign',
  'who-owns-multichoice-dstv': 'foreign',
  'who-owns-nigerian-breweries': 'foreign',
  'who-owns-opay': 'foreign',
  'who-owns-paystack': 'foreign',
  'who-owns-safaricom': 'foreign',
  'who-owns-tecno': 'foreign',
  'who-owns-tusker': 'foreign',
  'who-owns-guinness-nigeria': 'foreign',
};

interface Card {
  slug: string;
  brand: string;
  answer: string;
  category?: string;
}

// "Who Owns Nando's?" -> "Nando's"
const brandOf = (title: string) => title.replace(/^Who Owns\s+/i, '').replace(/\?\s*$/, '').trim();
// "Who Owns Nando's? The Enthoven Family, Privately" -> "The Enthoven Family, Privately"
const answerOf = (seoTitle?: string, excerpt?: string) => {
  if (seoTitle && seoTitle.includes('? ')) return seoTitle.split('? ').slice(1).join('? ').trim();
  if (excerpt) return excerpt.replace(/^Short answer:\s*/i, '').split('.')[0].trim();
  return 'Read the file';
};

export default function WhoOwnsAfricaPage() {
  const all = getAllArticles();
  const isWhoOwns = (t: string, s: string) => /^who owns/i.test(t) || s.startsWith('who-owns');

  const briefs = all
    .filter((a) => a.format === 'brief' && isWhoOwns(a.title, a.slug))
    .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
  const features = all
    .filter((a) => a.format !== 'brief' && isWhoOwns(a.title, a.slug))
    .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));

  const toCard = (a: (typeof all)[number]): Card => ({
    slug: a.slug,
    brand: brandOf(a.title),
    answer: answerOf(a.seoTitle, a.excerpt),
    category: a.category,
  });

  const african = briefs.filter((a) => VERDICT[a.slug] === 'african').map(toCard);
  const foreign = briefs.filter((a) => VERDICT[a.slug] === 'foreign').map(toCard);
  const more = briefs.filter((a) => !VERDICT[a.slug]).map(toCard);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Who Owns Africa? Every Brand, Decoded',
    url: URL,
    description: metadata.description,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: [...briefs, ...features].map((a, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `https://www.monokromatik.com/article/${a.slug}`,
        name: a.title,
      })),
    },
  };

  const Grid = ({ cards, tone }: { cards: Card[]; tone: 'african' | 'foreign' | 'neutral' }) => (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-mono-gray/20">
      {cards.map((c) => (
        <Link
          key={c.slug}
          href={`/article/${c.slug}`}
          className="group bg-mono-white p-6 flex flex-col hover:bg-mono-soft-white transition-colors"
        >
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-display font-bold text-mono-black leading-tight">{c.brand}</h3>
            <ArrowUpRight size={18} className="text-mono-gray group-hover:text-mono-amber-strong shrink-0 transition-colors" aria-hidden="true" />
          </div>
          <p className="mt-2 font-body text-sm text-mono-charcoal leading-snug flex-1">{c.answer}</p>
          <span
            className={`mt-4 inline-flex self-start items-center text-[10px] tracking-[0.16em] font-display font-bold uppercase px-2.5 py-1 ${
              tone === 'african'
                ? 'bg-mono-amber/15 text-mono-amber-strong'
                : tone === 'foreign'
                ? 'bg-mono-black/[0.06] text-mono-charcoal'
                : 'bg-mono-black/[0.04] text-mono-gray'
            }`}
          >
            {tone === 'african' ? 'Stayed African-owned' : tone === 'foreign' ? 'Owned abroad now' : (c.category ?? 'File')}
          </span>
        </Link>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-mono-white">
      <Navigation />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="bg-mono-black text-mono-white pt-24 pb-16 md:pt-28 md:pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.35em] font-display font-bold text-mono-amber mb-6">THE OWNERSHIP FILES</p>
          <h1 className="text-4xl md:text-6xl font-display font-bold leading-[0.98] max-w-3xl">Who owns Africa?</h1>
          <p className="mt-8 max-w-2xl text-lg md:text-xl text-mono-soft-white font-body leading-relaxed">
            A running index of who <em>really</em> owns the continent&rsquo;s biggest brands — the short answer on each,
            with the sourcing behind it. Some stayed African-owned. Most, once you follow the cap table, did not.
          </p>
          <div className="mt-8 flex flex-wrap gap-6 text-sm font-display font-bold">
            <span><span className="text-3xl text-mono-amber tabular-nums">{briefs.length + features.length}</span> <span className="text-mono-soft-white">brands decoded</span></span>
            <span><span className="text-3xl text-mono-amber tabular-nums">{african.length}</span> <span className="text-mono-soft-white">stayed African-owned</span></span>
            <span><span className="text-3xl text-mono-amber tabular-nums">{foreign.length}</span> <span className="text-mono-soft-white">owned abroad now</span></span>
          </div>
          <div className="mt-8">
            <Link href="/whos-buying-africa" className="inline-flex items-center gap-2 bg-mono-amber text-mono-black px-7 py-4 font-display font-bold hover:bg-mono-amber/90 transition-colors">
              SEE THE DEAL TRACKER <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Stayed African-owned */}
      {african.length > 0 && (
        <section className="py-12 md:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6 max-w-2xl">
              <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong mb-2">STAYED AFRICAN-OWNED</p>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-mono-black">The ones that kept their cap table at home.</h2>
            </div>
            <Grid cards={african} tone="african" />
          </div>
        </section>
      )}

      {/* Owned abroad now */}
      {foreign.length > 0 && (
        <section className="py-12 md:py-16 bg-mono-soft-white border-y border-mono-gray/15">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6 max-w-2xl">
              <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong mb-2">OWNED ABROAD NOW</p>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-mono-black">African-authored — foreign-owned once you follow the money.</h2>
            </div>
            <Grid cards={foreign} tone="foreign" />
          </div>
        </section>
      )}

      {/* More files (unmapped briefs — self-heals as the cluster grows) */}
      {more.length > 0 && (
        <section className="py-12 md:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong mb-6">MORE FILES</p>
            <Grid cards={more} tone="neutral" />
          </div>
        </section>
      )}

      {/* The bigger questions — thematic deep-dives */}
      {features.length > 0 && (
        <section className="py-12 md:py-16 bg-mono-black text-mono-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber mb-2">THE BIGGER QUESTIONS</p>
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-8 max-w-2xl">Beyond single brands — who owns whole economies.</h2>
            <div className="grid md:grid-cols-2 gap-px bg-mono-white/10">
              {features.map((a) => (
                <Link key={a.slug} href={`/article/${a.slug}`} className="group bg-mono-black p-6 flex items-start justify-between gap-4 hover:bg-mono-charcoal transition-colors">
                  <div>
                    <h3 className="text-lg font-display font-bold text-mono-white leading-tight">{a.seoTitle || a.title}</h3>
                    <p className="mt-2 font-body text-sm text-mono-soft-white leading-snug">{a.excerpt}</p>
                  </div>
                  <ArrowUpRight size={18} className="text-mono-gray group-hover:text-mono-amber shrink-0 transition-colors" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Franchise binding — the value-capture desk */}
      <section className="py-14 md:py-18 bg-mono-soft-white border-t border-mono-gray/15">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong mb-6">THE VALUE-CAPTURE DESK</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { href: '/whos-buying-africa', h: "Who's Buying Africa", p: 'The live deal tracker — every acquisition, with a value-capture verdict.' },
              { href: '/reports/value-capture-scorecard-2026', h: 'Value-Capture Scorecard', p: 'The quarterly verdict: how much value was retained vs exported.' },
              { href: '/coil-economy', h: 'The Coil Economy', p: 'Who authors Black hair — and who cashes the cheque.' },
              { href: '/intelligence/ownership', h: 'Licence the data', p: 'The ownership dataset and Scorecard, for teams that track the field.' },
            ].map((c) => (
              <Link key={c.href} href={c.href} className="group border border-mono-gray/25 bg-mono-white p-5 hover:border-mono-amber-strong transition-colors">
                <h3 className="font-display font-bold text-mono-black flex items-center gap-1.5">{c.h} <ArrowUpRight size={15} className="text-mono-gray group-hover:text-mono-amber-strong transition-colors" aria-hidden="true" /></h3>
                <p className="mt-2 font-body text-sm text-mono-charcoal leading-snug">{c.p}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
