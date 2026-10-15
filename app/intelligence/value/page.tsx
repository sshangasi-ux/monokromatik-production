import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Database, Gauge, LineChart, BookMarked } from 'lucide-react';
import Navigation from '../../components/Navigation';
import AssetValuer from './AssetValuer';
import { buildAssetIndex } from '../../../lib/asset-index';

export const metadata: Metadata = {
  title: 'Value an Asset — MonoKromatik Intelligence',
  description:
    'Type a brand, team, artist or company and get the value-capture read we hold: who owns it, Retained / Exported / Contested, the Cultural-Signal score, and the deep breakdown. The valuation engine behind MonoKromatik Intelligence.',
  alternates: { canonical: 'https://www.monokromatik.com/intelligence/value' },
};

const SOURCES = [
  { icon: Database, h: 'The Ownership 100', p: 'Who owns it, where the value sits, and the Retained / Exported / Contested verdict.' },
  { icon: Gauge, h: 'The Cultural-Signal Index', p: 'The authorship-weighted composite score, where the brand has been decoded.' },
  { icon: LineChart, h: 'The acquisitions ledger', p: 'The deal that moved it — who bought in, and whether value stayed or left.' },
  { icon: BookMarked, h: 'The “Who Owns X” briefs', p: 'The full, source-led breakdown behind every read.' },
];

export default function ValueAnAssetPage() {
  const index = buildAssetIndex();

  return (
    <div className="min-h-screen bg-mono-black text-mono-white">
      <Navigation />

      {/* HERO + TOOL */}
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.35em] font-display font-bold text-mono-amber mb-6">MONOKROMATIK INTELLIGENCE · THE TOOL</p>
          <h1 className="text-5xl md:text-7xl font-display font-bold leading-[0.95]">Value an asset.</h1>
          <p className="mt-6 max-w-2xl text-lg md:text-xl font-body text-mono-soft-white/85 leading-relaxed">
            Type a brand, team, artist or company. Get the value-capture read we actually hold — who owns it, whether the
            upside is retained or exported, the Cultural-Signal score, and the deep breakdown. No read is invented:
            what we don&rsquo;t hold, we&rsquo;ll commission.
          </p>

          <div className="mt-10">
            <AssetValuer index={index} />
          </div>

          <p className="mt-5 text-sm font-body text-mono-gray-bright">
            {index.length}+ African &amp; diaspora assets in coverage — and growing. For a full, decision-ready read, step up
            to a <Link href="/work-with-us?interest=scorecard" className="text-mono-amber hover:text-mono-amber-bright underline underline-offset-2">Signal Scorecard</Link>.
          </p>
        </div>
      </section>

      {/* HOW THE READ IS BUILT */}
      <section className="py-14 md:py-20 border-t border-mono-white/10 bg-mono-charcoal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber mb-8">HOW THE READ IS BUILT</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-mono-white/15 border border-mono-white/15">
            {SOURCES.map((s) => (
              <div key={s.h} className="bg-mono-charcoal p-6">
                <s.icon size={20} className="text-mono-amber" aria-hidden="true" />
                <h2 className="mt-4 font-display font-bold text-lg">{s.h}</h2>
                <p className="mt-2 font-body text-sm text-mono-soft-white/75 leading-relaxed">{s.p}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 font-body text-sm text-mono-soft-white/70 max-w-[70ch]">
            Every verdict, owner and score here is a real stored record with named sourcing — never a generated guess.
            The free read is the start; the paid Scorecard and the advisory desk build the decision on top of it.
          </p>
        </div>
      </section>

      {/* BACK TO PRACTICE */}
      <section className="py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-6">
          <p className="font-display font-bold text-2xl md:text-3xl max-w-[22ch]">Part of <span className="text-mono-amber">MonoKromatik Intelligence</span> — the value-capture practice.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/intelligence" className="inline-flex items-center gap-2 border border-mono-white/25 px-6 py-3.5 font-display font-bold text-mono-white hover:border-mono-amber hover:text-mono-amber transition-colors">See the full practice <ArrowRight size={18} /></Link>
            <Link href="/work-with-us?interest=value-capture-advisory" className="inline-flex items-center gap-2 bg-mono-amber text-mono-black px-6 py-3.5 font-display font-bold hover:bg-mono-amber-bright transition-colors">Commission the desk <ArrowRight size={18} /></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
