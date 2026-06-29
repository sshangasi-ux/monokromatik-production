import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, Layers3, Trophy, ShieldCheck } from 'lucide-react';
import Navigation from '../../components/Navigation';
import { StatStrip } from '../../components/dataviz/Charts';
import { getPublicCaseStudies } from '../../../lib/case-studies';
import { rankIndex, brandSlug, AXIS_WEIGHTS } from '../../../lib/signal-index';
import { getMovement, isNewlyRanked, trackingSince, getMovers } from '../../../lib/index-history';
import IndexLeaderboard, { type LeaderEntry } from './IndexLeaderboard';

export const revalidate = 300;

const SITE = 'https://www.monokromatik.com';

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

  // First market seen per brand — powers the market/region filter.
  const marketBySlug = new Map<string, string>();
  for (const cs of studies) {
    const s = brandSlug(cs.brand);
    if (cs.market && !marketBySlug.has(s)) marketBySlug.set(s, cs.market);
  }

  const leaderEntries: LeaderEntry[] = ranked.map((e) => {
    const slug = brandSlug(e.brand);
    return {
      brand: e.brand,
      slug,
      score: e.score,
      rank: e.rank!,
      works: e.works,
      axisAverages: e.axisAverages,
      market: marketBySlug.get(slug) ?? '',
      movement: getMovement(slug),
      isNew: isNewlyRanked(slug),
    };
  });

  const movers = getMovers(5);
  const topClimber = movers.climbers[0];
  const briefing = movers.since
    ? `Since ${movers.since}, ${movers.climbers.length} brand${movers.climbers.length === 1 ? '' : 's'} climbed and ${movers.newcomers.length} entered the Index${topClimber ? ` — ${topClimber.brand} led, up ${topClimber.scoreDelta} to ${topClimber.score}/100` : ''}.`
    : '';

  // JSON-LD: a Dataset (so the Index is discoverable in Google Dataset Search /
  // citable by AI engines) wrapping an ItemList of the ranking.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'The Cultural-Signal Index',
    description:
      'A proprietary, authorship-weighted ranking of how brand and cultural work scores on African creative authorship, idea, execution and consequence.',
    url: `${SITE}/intelligence/signal-index`,
    creator: { '@type': 'Organization', name: 'MonoKromatik', url: SITE },
    variableMeasured: ['Cultural-Signal Score', 'Idea', 'Authorship', 'Execution', 'Consequence'],
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: ranked.length,
      itemListElement: ranked.map((e) => ({
        '@type': 'ListItem',
        position: e.rank,
        url: `${SITE}/intelligence/signal-index/${brandSlug(e.brand)}`,
        name: e.brand,
      })),
    },
  };

  return (
    <div className="min-h-screen bg-mono-paper">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navigation />

      <section className="bg-mono-black text-mono-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.35em] font-display font-bold text-mono-amber mb-7">INTELLIGENCE / THE CULTURAL-SIGNAL INDEX · THE 2026 CLASS</p>
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

      {(movers.climbers.length > 0 || movers.newcomers.length > 0) && (
        <section className="py-14 md:py-16 bg-mono-black text-mono-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber mb-3">MOVERS · SINCE {movers.since}</p>
            <h2 className="text-3xl md:text-4xl font-display font-bold">What moved.</h2>
            <p className="mt-4 max-w-2xl text-lg text-mono-soft-white font-body">{briefing}</p>
            <div className="mt-9 grid sm:grid-cols-2 gap-px bg-mono-white/15 border border-mono-white/15">
              <div className="bg-mono-black p-6">
                <p className="text-[11px] tracking-[0.2em] font-display font-bold text-mono-amber mb-5">▲ CLIMBERS</p>
                {movers.climbers.length ? movers.climbers.map((m) => (
                  <Link key={m.slug} href={`/intelligence/signal-index/${m.slug}`} className="flex items-center justify-between gap-4 py-2.5 border-b border-mono-white/10 last:border-0 group">
                    <span className="font-display font-bold text-mono-soft-white group-hover:text-mono-amber-bright transition-colors truncate">{m.brand}</span>
                    <span className="shrink-0 text-emerald-400 font-display font-bold text-sm tabular-nums">▲ {m.scoreDelta} → {m.score}</span>
                  </Link>
                )) : <p className="text-sm text-mono-gray font-body">No score climbs this update.</p>}
              </div>
              <div className="bg-mono-black p-6">
                <p className="text-[11px] tracking-[0.2em] font-display font-bold text-mono-amber mb-5">NEW ENTRIES</p>
                {movers.newcomers.length ? movers.newcomers.map((m) => (
                  <Link key={m.slug} href={`/intelligence/signal-index/${m.slug}`} className="flex items-center justify-between gap-4 py-2.5 border-b border-mono-white/10 last:border-0 group">
                    <span className="font-display font-bold text-mono-soft-white group-hover:text-mono-amber-bright transition-colors truncate">{m.brand}</span>
                    <span className="shrink-0 text-mono-amber-bright font-display font-bold text-sm tabular-nums">NEW · {m.score}</span>
                  </Link>
                )) : <p className="text-sm text-mono-gray font-body">No new entries this update.</p>}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong mb-4">THE RANKING</p>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-mono-black">Every scored brand, ranked.</h2>
            </div>
            <Trophy className="text-mono-amber shrink-0" size={30} aria-hidden="true" />
          </div>
          <IndexLeaderboard entries={leaderEntries} trackingSince={trackingSince()} />
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-display font-bold tracking-[0.14em] text-mono-gray">
            <span className="text-mono-charcoal">OPEN DATA FEED</span>
            <a href="/api/index" className="text-mono-amber-strong hover:underline">JSON</a>
            <span aria-hidden="true">·</span>
            <a href="/api/index?format=csv" className="text-mono-amber-strong hover:underline">CSV</a>
            <span aria-hidden="true">·</span>
            <Link href="/intelligence/signal-index/methodology" className="text-mono-amber-strong hover:underline">METHODOLOGY</Link>
          </div>
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
          <Link href="/intelligence/signal-index/methodology" className="mt-9 inline-flex items-center gap-2 bg-mono-amber text-mono-black px-7 py-4 font-display font-bold hover:bg-mono-amber-bright transition-colors">
            READ THE FULL METHODOLOGY <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <section className="bg-mono-paper py-16 md:py-20 border-t border-mono-gray/20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong mb-4">THE FULL REPORT</p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-mono-black">The scores are free. The Index is the product.</h2>
          <p className="mt-5 font-body text-mono-charcoal text-lg">Take the complete ranking, every per-axis breakdown, the methodology and the evidence behind each score — or license the data for your team.</p>
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <Link href="/pricing" className="inline-flex items-center gap-2 bg-mono-black text-mono-white px-8 py-4 font-display font-bold hover:bg-mono-charcoal transition-colors">GET THE FULL INDEX REPORT <ArrowRight size={18} /></Link>
            <Link href="/intelligence/license" className="inline-flex items-center gap-2 border border-mono-black text-mono-black px-8 py-4 font-display font-bold hover:bg-mono-black hover:text-mono-white transition-colors">LICENSE THE INDEX <ArrowRight size={18} /></Link>
          </div>
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
