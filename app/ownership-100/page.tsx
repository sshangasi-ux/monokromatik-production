import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, ArrowUpRight, Download } from 'lucide-react';
import Navigation from '../components/Navigation';
import NewsletterSignup from '../components/NewsletterSignup';
import ShareRow from '../components/ShareRow';
import { getOwnership100, getOwnership100Entries, getOwnership100Tally, type OwnershipStatus } from '../../lib/ownership100';

const URL = 'https://www.monokromatik.com/ownership-100';
const doc = getOwnership100();

export const metadata: Metadata = {
  title: 'The Ownership 100 — Who Owns Africa’s Most Valuable Brands | MonoKromatik',
  description:
    'The definitive ranked ledger of who owns Africa’s most valuable brands — the phone in your hand, the channel on your screen, the drink in your glass. Ranked by reach and value at stake; every entry sourced.',
  keywords: [
    'who owns africa', 'african brand ownership ranking', 'ownership 100',
    'most valuable african brands', 'value capture africa', 'african brands foreign owned',
  ],
  alternates: { canonical: URL },
  openGraph: {
    title: 'The Ownership 100 — Who Owns Africa’s Most Valuable Brands',
    description: 'The ranked ledger of who really owns Africa’s biggest brands. Every entry sourced.',
    type: 'website',
    url: URL,
  },
};

export const revalidate = 3600;

const STATUS_STYLE: Record<OwnershipStatus, string> = {
  Retained: 'bg-emerald-600 text-mono-white',
  Exported: 'bg-mono-amber text-mono-black',
  Contested: 'bg-mono-black text-mono-white',
};

export default function Ownership100Page() {
  const entries = getOwnership100Entries();
  const tally = getOwnership100Tally();

  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: doc.title,
    description: doc.standfirst,
    numberOfItems: entries.length,
    itemListElement: entries.map((e) => ({
      '@type': 'ListItem',
      position: e.rank,
      name: `${e.brand} — owned by ${e.owner} (${e.ownerCountry})`,
      ...(e.articleSlug ? { url: `https://www.monokromatik.com/article/${e.articleSlug}` } : {}),
    })),
  };

  const hrefFor = (slug?: string) => (slug ? `/article/${slug}` : undefined);

  return (
    <div className="min-h-screen bg-mono-paper">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />
      <Navigation />

      {/* Hero */}
      <header className="bg-mono-black text-mono-white py-16 md:py-24 border-b border-mono-white/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.36em] font-display font-bold text-mono-amber-bright mb-6">
            {doc.edition.toUpperCase()}
          </p>
          <h1 className="max-w-5xl text-5xl md:text-8xl font-feature font-bold leading-[0.95]">{doc.title}</h1>
          <p className="max-w-3xl mt-8 text-xl md:text-2xl text-mono-soft-white font-feature leading-snug">
            {doc.standfirst}
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-8 text-sm font-display font-bold">
            <span><span className="text-4xl text-emerald-400 tabular-nums">{tally.Retained}</span> <span className="text-mono-soft-white ml-1">retained</span></span>
            <span><span className="text-4xl text-mono-amber-bright tabular-nums">{tally.Exported}</span> <span className="text-mono-soft-white ml-1">exported</span></span>
            <span><span className="text-4xl text-mono-white tabular-nums">{tally.Contested}</span> <span className="text-mono-soft-white ml-1">contested</span></span>
            <span className="text-mono-gray">{doc.cohortSize} of {doc.target} mapped · building out</span>
          </div>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/ownership-100/edition" className="inline-flex items-center gap-2 bg-mono-amber text-mono-black px-6 py-3.5 font-display font-bold hover:bg-mono-amber/90 transition-colors">
              <Download size={16} /> THE PRINT EDITION
            </Link>
            <Link href="/who-owns" className="inline-flex items-center gap-2 border border-mono-white/40 text-mono-white px-6 py-3.5 font-display font-bold hover:bg-mono-white/10 transition-colors">
              CHECK A BRAND <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      {/* The ranked ledger */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
        <div className="border-t border-mono-black/15">
          {entries.map((e) => {
            const href = hrefFor(e.articleSlug);
            const Row = (
              <div className="grid grid-cols-[2.5rem_1fr] md:grid-cols-[3.5rem_1.4fr_1fr_auto] gap-x-4 md:gap-x-6 gap-y-2 items-baseline py-6 border-b border-mono-black/10 group">
                <span className="text-2xl md:text-3xl font-feature font-bold text-mono-amber tabular-nums">{e.rank}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl md:text-2xl font-display font-bold text-mono-black group-hover:text-mono-amber transition-colors">{e.brand}</h2>
                    <span className={`text-[10px] tracking-[0.14em] px-2 py-0.5 font-display font-bold ${STATUS_STYLE[e.status]}`}>{e.status.toUpperCase()}</span>
                    {href && <ArrowUpRight size={15} className="text-mono-gray group-hover:text-mono-amber transition-colors" />}
                  </div>
                  <p className="mt-1.5 text-sm text-mono-charcoal font-body leading-snug md:pr-6">{e.note}</p>
                  {e.sourceLabel && !e.articleSlug && (
                    <p className="mt-1 text-[11px] tracking-[0.04em] text-mono-gray font-body italic">Source: {e.sourceLabel}</p>
                  )}
                  <p className="mt-1 text-[11px] tracking-[0.12em] font-display font-bold text-mono-gray md:hidden">{e.sector.toUpperCase()}</p>
                </div>
                <div className="hidden md:block">
                  <p className="text-[11px] tracking-[0.14em] font-display font-bold text-mono-gray">{e.sector.toUpperCase()}</p>
                </div>
                <div className="hidden md:block text-right">
                  <p className="text-sm font-display font-bold text-mono-black">{e.owner}</p>
                  <p className="text-[11px] tracking-[0.1em] text-mono-gray">{e.ownerCountry.toUpperCase()}</p>
                </div>
              </div>
            );
            return href ? (
              <Link key={e.rank} href={href} className="block">{Row}</Link>
            ) : (
              <div key={e.rank}>{Row}</div>
            );
          })}
        </div>

        {/* Share (WhatsApp-first) */}
        <div className="mt-12">
          <ShareRow url={URL} text="The Ownership 100 — who really owns Africa’s most valuable brands, ranked and sourced." source="ownership-100" />
        </div>
      </section>

      {/* Nominate / capture */}
      <section className="bg-mono-soft-white border-y border-mono-black/10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber mb-4">BUILDING TO 100</p>
          <h2 className="text-3xl md:text-4xl font-feature font-bold text-mono-black">Nominate a brand for the ledger.</h2>
          <p className="mt-4 text-mono-charcoal font-body max-w-xl mx-auto">
            The cohort grows every edition. Tell us which African brand’s ownership we should decode next — and get the
            ledger, and each new entry, in your inbox.
          </p>
          <div className="mt-8 text-left max-w-md mx-auto">
            <NewsletterSignup variant="default" source="ownership-100-nominate" />
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <p className="text-[10px] tracking-[0.3em] text-mono-amber font-display font-bold mb-5">METHODOLOGY</p>
        <p className="text-base text-mono-charcoal font-body leading-relaxed">{doc.methodology}</p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/who-owns-africa" className="inline-flex items-center gap-2 bg-mono-black text-mono-white px-6 py-3 font-display font-bold hover:bg-mono-charcoal transition-colors">
            THE FULL DESK <ArrowRight size={16} />
          </Link>
          <Link href="/intelligence/ownership" className="inline-flex items-center gap-2 border border-mono-black text-mono-black px-6 py-3 font-display font-bold hover:bg-mono-white transition-colors">
            LICENCE THE DATA
          </Link>
        </div>
      </section>
    </div>
  );
}
