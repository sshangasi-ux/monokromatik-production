import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, Layers3, Trophy, ShieldCheck } from 'lucide-react';
import Navigation from '../../components/Navigation';
import { StatStrip } from '../../components/dataviz/Charts';
import { getPublicCaseStudies } from '../../../lib/case-studies';
import { rankIndex, brandSlug, AXIS_WEIGHTS } from '../../../lib/signal-index';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'The Cultural-Signal Index | MonoKromatik Intelligence',
  description:
    'A proprietary, authorship-weighted ranking of how brand and cultural work scores on African creative authorship, idea, execution and consequence.',
};

const AXES: [string, string][] = [
  ['IDEA', 'Originality and cultural force of the idea.'],
  ['AUTHORSHIP', 'Who shaped it — African creative leadership vs localisation.'],
  ['EXECUTION', 'Craft, narrative and product detail.'],
  ['CONSEQUENCE', 'What it actually moved — culture and commerce.'],
];

export default function SignalIndexPage() {
  const studies = getPublicCaseStudies();
  const ranked = rankIndex(studies);
  const top = ranked[0]?.score ?? 0;
  const mean = ranked.length ? Math.round(ranked.reduce((s, e) => s + e.score, 0) / ranked.length) : 0;
  const totalWorks = ranked.reduce((s, e) => s + e.works, 0);

  return (
    <div className="min-h-screen bg-mono-paper">
      <Navigation />

      <section className="bg-mono-black text-mono-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.35em] font-display font-bold text-mono-amber mb-7">INTELLIGENCE / THE CULTURAL-SIGNAL INDEX</p>
          <h1 className="max-w-4xl text-5xl md:text-7xl font-display font-bold leading-[0.95]">Who actually <span className="text-mono-amber">authored</span> the influence.</h1>
          <p className="mt-8 max-w-2xl text-lg md:text-xl text-mono-soft-white font-body leading-relaxed">
            A proprietary, authorship-weighted read of brand and cultural work — scored across idea, authorship,
            execution and consequence. Editorial judgement, evidence-led, and ranked.
          </p>
        </div>
      </section>

      <section className="py-14 md:py-16 border-b border-mono-gray/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StatStrip
            tone="light"
            items={[
              { value: String(ranked.length), label: 'Brands ranked' },
              { value: String(totalWorks), label: 'Works scored' },
              { value: String(top), label: 'Top score' },
              { value: String(mean), label: 'Index average' },
            ]}
          />
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong mb-4">THE RANKING</p>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-mono-black">Every scored brand, ranked.</h2>
            </div>
            <Trophy className="text-mono-amber shrink-0" size={30} aria-hidden="true" />
          </div>
          <ol className="space-y-px bg-mono-gray/20 border border-mono-gray/25">
            {ranked.map((e) => (
              <li key={e.brand} className="bg-mono-paper">
                <Link
                  href={`/intelligence/signal-index/${brandSlug(e.brand)}`}
                  className="group block px-5 py-5 md:px-7 hover:bg-mono-white transition-colors"
                >
                  <div className="flex items-center gap-5">
                    <span className="w-8 shrink-0 font-display font-bold text-mono-gray text-lg tabular-nums">{e.rank}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-display font-bold text-mono-black text-lg md:text-xl truncate group-hover:text-mono-amber transition-colors">{e.brand}</p>
                      <p className="text-[11px] tracking-[0.14em] font-display font-bold text-mono-gray mt-1">
                        {e.works} {e.works === 1 ? 'WORK' : 'WORKS'} · AUTHORSHIP {e.axisAverages.AUTHORSHIP ?? '—'}/5
                      </p>
                    </div>
                    <span className="shrink-0 text-right">
                      <span className="block text-3xl font-display font-bold text-mono-black leading-none tabular-nums">{e.score}</span>
                      <span className="block text-[9px] tracking-[0.2em] font-display font-bold text-mono-amber-strong">SIGNAL</span>
                    </span>
                  </div>
                  <div className="mt-4 h-1.5 bg-mono-gray/20 overflow-hidden">
                    <div className="h-full bg-mono-amber" style={{ width: `${e.score}%` }} />
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-mono-black text-mono-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ShieldCheck className="text-mono-amber mb-6" size={28} aria-hidden="true" />
          <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber mb-4">METHODOLOGY</p>
          <h2 className="text-3xl md:text-4xl font-display font-bold max-w-3xl">How the score is built — and what it is not.</h2>
          <p className="mt-6 max-w-2xl text-mono-soft-white font-body text-lg">
            The Cultural-Signal Score is an authorship-weighted composite of four editorial dimensions, each scored
            1–5 and expressed out of 100. It is interpretive editorial judgement — a defensible, evidence-led reading
            — not a measured market metric.
          </p>
          <div className="mt-10 grid sm:grid-cols-2 gap-px bg-mono-white/15 border border-mono-white/15">
            {AXES.map(([label, desc]) => (
              <div key={label} className="bg-mono-black p-6">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] tracking-[0.22em] font-display font-bold text-mono-amber">{label}</span>
                  <span className="text-sm font-display font-bold text-mono-soft-white tabular-nums">{Math.round((AXIS_WEIGHTS[label] ?? 0) * 100)}%</span>
                </div>
                <p className="mt-3 text-sm font-body text-mono-gray-bright leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 max-w-2xl text-sm font-body text-mono-gray-bright">
            AUTHORSHIP carries the heaviest weight: it is the question MonoKromatik exists to ask — who shaped the
            idea, who got access, who captured value. Levels are set by editors today; an AI-assisted draft →
            human-approval workflow is planned, never autonomous.
          </p>
        </div>
      </section>

      <section className="py-16 text-center">
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/intelligence/case-studies" className="inline-flex gap-2 items-center bg-mono-black text-mono-white px-7 py-4 font-display font-bold"><Layers3 size={17} /> THE CASE STUDIES</Link>
          <Link href="/intelligence/source-desk" className="inline-flex gap-2 items-center border border-mono-black text-mono-black px-7 py-4 font-display font-bold">SOURCE DESK <ArrowRight size={18} /></Link>
        </div>
      </section>
    </div>
  );
}
