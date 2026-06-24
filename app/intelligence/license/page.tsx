import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check, Database, Trophy, Building2 } from 'lucide-react';
import Navigation from '../../components/Navigation';
import { DATA_PRODUCTS } from '../../../lib/commerce';

export const metadata: Metadata = {
  title: 'License the Cultural-Signal Index — Scorecards & League Tables | MonoKromatik',
  description:
    'Put the Cultural-Signal Index to work: a per-brand Signal Scorecard, a single league table, or a full Index license with quarterly refresh. Indicative bands; scope is quoted.',
  alternates: { canonical: 'https://www.monokromatik.com/intelligence/license' },
};

const ICON: Record<string, typeof Database> = {
  scorecard: Trophy,
  'league-table': Database,
  'full-index': Building2,
};

export default function LicensePage() {
  return (
    <div className="min-h-screen bg-mono-paper">
      <Navigation />

      <section className="bg-mono-black text-mono-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.35em] font-display font-bold text-mono-amber mb-7">INTELLIGENCE / DATA PRODUCTS</p>
          <h1 className="max-w-4xl text-5xl md:text-7xl font-display font-bold leading-[0.95]">
            License the <span className="text-mono-amber">Index.</span>
          </h1>
          <p className="mt-8 max-w-2xl text-lg md:text-xl text-mono-soft-white font-body leading-relaxed">
            The scores are free to read. The data is the product. License the Cultural-Signal league tables, or
            commission a per-brand Scorecard — authorship-weighted, evidence-led, and credited at the source.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-px bg-mono-gray/25 border border-mono-gray/25">
            {DATA_PRODUCTS.map((p) => {
              const Icon = ICON[p.id] ?? Database;
              return (
                <div key={p.id} className="bg-mono-white p-7 md:p-8 flex flex-col">
                  <Icon className="text-mono-amber-strong mb-6" size={26} aria-hidden="true" />
                  <h2 className="text-2xl font-display font-bold text-mono-black">{p.title}</h2>
                  <p className="mt-2 text-sm font-display font-bold tracking-[0.12em] text-mono-amber-strong">{p.priceFrom.toUpperCase()}</p>
                  <p className="mt-4 font-body text-mono-charcoal leading-relaxed">{p.blurb}</p>
                  <ul className="mt-6 space-y-2.5 flex-1">
                    {p.includes.map((inc) => (
                      <li key={inc} className="flex gap-2.5 text-sm font-body text-mono-charcoal">
                        <Check size={16} className="text-mono-amber-strong shrink-0 mt-0.5" />
                        {inc}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/work-with-us?interest=${p.interest}`}
                    className="mt-7 inline-flex items-center justify-center gap-2 bg-mono-black text-mono-white px-6 py-3.5 font-display font-bold hover:bg-mono-charcoal transition-colors"
                  >
                    REQUEST A QUOTE <ArrowRight size={16} />
                  </Link>
                </div>
              );
            })}
          </div>
          <p className="mt-6 text-sm font-body text-mono-gray max-w-2xl">
            Indicative bands — every engagement is scoped and quoted. Pricing reflects the dataset&rsquo;s coverage and
            your usage rights (internal, report, platform or white-label).
          </p>
        </div>
      </section>

      <section className="bg-mono-black text-mono-white py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1fr_300px] gap-12 items-center">
          <div>
            <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber mb-5">WHO LICENSES IT</p>
            <h2 className="text-3xl md:text-4xl font-display font-bold">Agencies, brand teams, investors and the press.</h2>
            <p className="mt-6 text-lg text-mono-soft-white font-body">
              The Index is built the way decision-makers need it: a defensible, authorship-weighted read of who actually
              shaped the work and who captured the value — citable in a pitch, a board deck, or a story.
            </p>
          </div>
          <Link href="/intelligence/signal-index" className="border border-mono-white/20 p-7 hover:border-mono-amber transition-colors">
            <p className="text-xs tracking-[0.25em] font-display font-bold text-mono-amber">SEE IT FIRST</p>
            <p className="mt-5 text-2xl font-display font-bold">Browse the live Index.</p>
            <p className="mt-5 inline-flex gap-2 items-center text-mono-amber font-display font-bold">THE RANKING <ArrowRight size={18} /></p>
          </Link>
        </div>
      </section>
    </div>
  );
}
