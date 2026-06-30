import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Navigation from '../../../components/Navigation';
import { getMovers, trackingSince } from '../../../../lib/index-history';
import ShareMovers from './ShareMovers';

export const revalidate = 300;

const SITE = 'https://www.monokromatik.com';

function summarise(): string {
  const m = getMovers(8);
  if (!m.since) return 'a new class is being scored.';
  const top = m.climbers[0];
  return `${m.climbers.length} brand${m.climbers.length === 1 ? '' : 's'} climbed and ${m.newcomers.length} entered${top ? ` — ${top.brand} led, up ${top.scoreDelta} to ${top.score}/100` : ''}.`;
}

export function generateMetadata(): Metadata {
  const since = getMovers(8).since;
  const title = 'What moved — Cultural-Signal Index | MonoKromatik';
  const description = `The latest Cultural-Signal Index update${since ? ` (since ${since})` : ''}: ${summarise()}`;
  return {
    title,
    description,
    alternates: { canonical: `${SITE}/intelligence/signal-index/movers` },
    openGraph: { title, description, type: 'article', url: `${SITE}/intelligence/signal-index/movers` },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default function MoversPage() {
  const movers = getMovers(8);
  const summary = summarise();

  return (
    <div className="min-h-screen bg-mono-black text-mono-white">
      <Navigation />

      <section className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/intelligence/signal-index" className="inline-flex items-center gap-2 text-xs tracking-[0.2em] font-display font-bold text-mono-gray hover:text-mono-amber-bright transition-colors mb-12">
            <ArrowLeft size={14} /> THE INDEX
          </Link>

          <p className="text-xs tracking-[0.32em] font-display font-bold text-mono-amber mb-6">
            THE INDEX JUST DROPPED{movers.since ? ` · MOVERS SINCE ${movers.since}` : ''}
          </p>
          <h1 className="text-5xl md:text-7xl font-display font-bold leading-[0.95]">What moved.</h1>
          <p className="mt-7 max-w-2xl text-lg md:text-xl text-mono-soft-white font-body leading-relaxed">{summary}</p>

          <div className="mt-9">
            <ShareMovers since={movers.since} summary={summary} />
          </div>

          {(movers.climbers.length > 0 || movers.newcomers.length > 0) ? (
            <div className="mt-12 grid sm:grid-cols-2 gap-px bg-mono-white/15 border border-mono-white/15">
              <div className="bg-mono-black p-6 md:p-8">
                <p className="text-[11px] tracking-[0.2em] font-display font-bold text-mono-amber mb-5">▲ CLIMBERS</p>
                {movers.climbers.length ? movers.climbers.map((m) => (
                  <Link key={m.slug} href={`/intelligence/signal-index/${m.slug}`} className="flex items-center justify-between gap-4 py-3 border-b border-mono-white/10 last:border-0 group">
                    <span className="font-display font-bold text-mono-soft-white group-hover:text-mono-amber-bright transition-colors truncate">{m.brand}</span>
                    <span className="shrink-0 text-emerald-400 font-display font-bold text-sm tabular-nums">▲ {m.scoreDelta} → {m.score}</span>
                  </Link>
                )) : <p className="text-sm text-mono-gray font-body">No score climbs this update.</p>}
              </div>
              <div className="bg-mono-black p-6 md:p-8">
                <p className="text-[11px] tracking-[0.2em] font-display font-bold text-mono-amber mb-5">NEW ENTRIES</p>
                {movers.newcomers.length ? movers.newcomers.map((m) => (
                  <Link key={m.slug} href={`/intelligence/signal-index/${m.slug}`} className="flex items-center justify-between gap-4 py-3 border-b border-mono-white/10 last:border-0 group">
                    <span className="font-display font-bold text-mono-soft-white group-hover:text-mono-amber-bright transition-colors truncate">{m.brand}</span>
                    <span className="shrink-0 text-mono-amber-bright font-display font-bold text-sm tabular-nums">NEW · {m.score}</span>
                  </Link>
                )) : <p className="text-sm text-mono-gray font-body">No new entries this update.</p>}
              </div>
            </div>
          ) : (
            <div className="mt-12 border border-mono-white/15 p-8">
              <p className="font-body text-mono-soft-white text-lg">The Index needs at least two snapshots to show movement. The next snapshot becomes the first reveal{trackingSince() ? ` — tracking since ${trackingSince()}` : ''}.</p>
            </div>
          )}

          <div className="mt-12">
            <Link href="/intelligence/signal-index" className="inline-flex items-center gap-2 bg-mono-amber text-mono-black px-7 py-4 font-display font-bold hover:bg-mono-amber-bright transition-colors">
              SEE THE FULL INDEX <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
