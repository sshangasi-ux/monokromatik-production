import Link from 'next/link';
import type { Metadata } from 'next';
import { Check, ArrowRight, Lock, Mail } from 'lucide-react';
import Navigation from '../../components/Navigation';
import { CONTACT_EMAIL } from '../../../lib/commerce';
import { getAcquisitions, getAcquisitionSummary } from '../../../lib/acquisitions';

const URL = 'https://www.monokromatik.com/intelligence/ownership';

export const metadata: Metadata = {
  title: "Ownership Intelligence — Who's Buying Africa | MonoKromatik",
  description:
    'African M&A and brand-ownership intelligence for VCs, corporate-development teams, advisers and agencies — a sourced deal tracker with a value-capture verdict on every deal, plus the quarterly Value-Capture Scorecard. Data licensing and feeds available.',
  keywords: [
    'African M&A intelligence', 'who owns African brands', 'African ownership data', 'value capture Africa',
    'African deal tracker', 'African M&A data feed', 'brand ownership intelligence',
  ],
  alternates: { canonical: URL },
  openGraph: {
    title: "Ownership Intelligence — Who's Buying Africa",
    description: 'The sourced deal tracker and Value-Capture Scorecard, as a licensable intelligence product.',
    type: 'website',
    url: URL,
  },
};

export const revalidate = 3600;

interface Tier {
  id: string;
  name: string;
  priceFrom: string;
  blurb: string;
  includes: string[];
  interest: string;
  featured?: boolean;
}

const TIERS: Tier[] = [
  {
    id: 'scorecard',
    name: 'The Value-Capture Scorecard',
    priceFrom: 'Included with membership · or from $290 one-off',
    blurb: 'The quarterly verdict layer — every tracked deal scored on value retained vs exported, with the analysis behind it.',
    includes: [
      'The full quarterly Scorecard report',
      'The retained / exported / mixed breakdown',
      'Sector reads and the methodology',
      'Cite-and-present rights for your team',
    ],
    interest: 'license',
  },
  {
    id: 'data-license',
    name: 'Ownership Data Licence',
    priceFrom: 'from $4,000 / yr',
    blurb: 'The full Who’s Buying Africa dataset — every deal, verdict, sector and source — refreshed quarterly, for teams that track the field.',
    includes: [
      'The complete deal dataset + value-capture verdicts',
      'Quarterly refresh and new-deal alerts',
      'Data export (CSV / JSON) for your stack',
      'Sourcing on every deal — provenance is the product',
    ],
    interest: 'license',
    featured: true,
  },
  {
    id: 'enterprise',
    name: 'Feed, API & Custom Coverage',
    priceFrom: 'from $12,000 / yr',
    blurb: 'Programmatic access plus commissioned coverage of the sectors, markets or acquirers your desk actually watches.',
    includes: [
      'Authenticated feed / API access',
      'Commissioned deal coverage on request',
      'Bespoke value-capture briefings for your team',
      'Seats, SLA and priority turnaround',
    ],
    interest: 'enterprise',
  },
];

const BUYERS = [
  'Venture & growth investors mapping who really owns the cap table',
  'Corporate-development and M&A teams tracking the African field',
  'Private equity, DFIs and advisers pricing the ownership question',
  'Brand and agency strategists briefing on African brand ownership',
  'Journalists and researchers who need sourced, citeable deal data',
];

export default function OwnershipIntelligencePage() {
  const s = getAcquisitionSummary();
  const dealCount = getAcquisitions().length;

  return (
    <div className="min-h-screen bg-mono-white">
      <Navigation />

      {/* Hero */}
      <section className="bg-mono-black text-mono-white pt-24 pb-16 md:pt-28 md:pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.35em] font-display font-bold text-mono-amber mb-6">INTELLIGENCE · OWNERSHIP</p>
          <h1 className="text-4xl md:text-6xl font-display font-bold leading-[0.98] max-w-3xl">
            Who owns Africa? We keep the receipts.
          </h1>
          <p className="mt-8 max-w-2xl text-lg md:text-xl text-mono-soft-white font-body leading-relaxed">
            A sourced tracker of the deals moving ownership of African &amp; diaspora brands — with the one thing the
            deal-count reports never publish: a <span className="text-mono-amber">value-capture verdict</span> on
            every deal. Licensable as data, a quarterly scorecard, or a feed.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/work-with-us?interest=license" className="inline-flex items-center gap-2 bg-mono-amber text-mono-black px-7 py-4 font-display font-bold hover:bg-mono-amber/90 transition-colors">
              LICENCE THE DATA <ArrowRight size={18} />
            </Link>
            <Link href="/whos-buying-africa" className="inline-flex items-center gap-2 border border-mono-white/30 text-mono-white px-7 py-4 font-display font-bold hover:bg-mono-white hover:text-mono-black transition-colors">
              SEE THE TRACKER
            </Link>
          </div>
        </div>
      </section>

      {/* Proof strip — live from the dataset */}
      <section className="bg-mono-amber/10 border-y border-mono-amber/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { n: dealCount, l: 'Deals tracked' },
            { n: s.exported, l: 'Value exported' },
            { n: s.retained, l: 'Value retained' },
            { n: s.sectors.length, l: 'Sectors' },
          ].map(({ n, l }) => (
            <div key={l}>
              <span className="block text-4xl font-display font-bold text-mono-black tabular-nums">{n}</span>
              <span className="block text-[11px] tracking-[0.14em] font-display font-bold text-mono-charcoal mt-1 uppercase">{l}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Who it's for */}
      <section className="py-14 md:py-20 bg-mono-soft-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong mb-4">WHO IT'S FOR</p>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-mono-black mb-8 max-w-2xl">
            Built for the desks that have to answer &ldquo;who ends up owning it?&rdquo;
          </h2>
          <ul className="grid md:grid-cols-2 gap-4 max-w-3xl">
            {BUYERS.map((b) => (
              <li key={b} className="flex items-start gap-3 font-body text-mono-charcoal">
                <Check size={20} className="text-mono-amber-strong shrink-0 mt-0.5" aria-hidden="true" /> {b}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Tiers */}
      <section className="py-14 md:py-20 bg-mono-white border-t border-mono-gray/15">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6 items-start">
            {TIERS.map((t) => (
              <div key={t.id} className={`bg-mono-white p-7 md:p-8 flex flex-col h-full ${t.featured ? 'border-2 border-mono-black' : 'border border-mono-gray/25'}`}>
                {t.featured && (
                  <span className="inline-block self-start text-[10px] tracking-[0.22em] px-3 py-1.5 bg-mono-amber text-mono-black font-display font-bold mb-5">MOST LICENSED</span>
                )}
                <h3 className="text-xl font-display font-bold text-mono-black">{t.name}</h3>
                <p className="mt-3 text-mono-amber-strong font-display font-bold text-sm">{t.priceFrom}</p>
                <p className="mt-3 font-body text-mono-charcoal text-sm leading-relaxed">{t.blurb}</p>
                <ul className="mt-6 space-y-3 flex-1">
                  {t.includes.map((i) => (
                    <li key={i} className="flex items-start gap-3 font-body text-mono-charcoal text-sm">
                      <Check size={17} className="text-mono-amber-strong shrink-0 mt-0.5" aria-hidden="true" /> {i}
                    </li>
                  ))}
                </ul>
                <Link href={`/work-with-us?interest=${t.interest}`} className="mt-7 inline-flex items-center justify-center gap-2 bg-mono-black text-mono-white px-6 py-3.5 font-display font-bold hover:bg-mono-charcoal transition-colors">
                  ENQUIRE <ArrowRight size={16} />
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-6 text-[12px] font-body text-mono-gray">Indicative bands; scope and price are quoted per engagement. Prefer a look first? Read the <Link href="/reports/value-capture-scorecard-2026" className="text-mono-amber-strong font-bold">Value-Capture Scorecard</Link>.</p>
        </div>
      </section>

      {/* Why us */}
      <section className="py-14 md:py-16 bg-mono-black text-mono-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-8">
          {[
            { h: 'The verdict, not just the deal', p: 'Everyone counts deals. We score where the ownership lands — exported, retained or mixed — the layer competitors don’t publish.' },
            { h: 'Provenance is the product', p: 'Every deal traces to sourced reporting. It’s built to be cited, presented and defended in a boardroom.' },
            { h: 'One lens, whole field', p: 'Fintech, media, music, beauty, drinks, telecoms — read through a single, consistent value-capture frame.' },
          ].map((c) => (
            <div key={c.h}>
              <Lock size={20} className="text-mono-amber mb-4" aria-hidden="true" />
              <h3 className="font-display font-bold text-lg text-mono-amber">{c.h}</h3>
              <p className="mt-2 font-body text-mono-soft-white text-sm leading-relaxed">{c.p}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-mono-soft-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-mono-black">License African ownership intelligence.</h2>
          <p className="mt-4 font-body text-mono-charcoal">Tell us the sectors, markets or acquirers your desk watches — we&rsquo;ll scope a data licence, feed or briefing.</p>
          <div className="mt-7 flex flex-wrap gap-4 justify-center">
            <Link href="/work-with-us?interest=license" className="inline-flex items-center gap-2 bg-mono-black text-mono-white px-7 py-4 font-display font-bold hover:bg-mono-charcoal transition-colors">
              START AN ENQUIRY <ArrowRight size={18} />
            </Link>
            <a href={`mailto:${CONTACT_EMAIL}?subject=Ownership%20Intelligence%20enquiry`} className="inline-flex items-center gap-2 border border-mono-black text-mono-black px-7 py-4 font-display font-bold hover:bg-mono-white transition-colors">
              <Mail size={16} /> {CONTACT_EMAIL}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
