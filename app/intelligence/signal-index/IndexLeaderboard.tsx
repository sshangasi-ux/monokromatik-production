'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, ArrowUpRight, ArrowDownRight, GitCompare, X, Star, Bell } from 'lucide-react';
import { useFollowedBrands } from '../../components/useFollowedBrands';
import FollowButton from '../../components/FollowButton';

const AXES = ['IDEA', 'AUTHORSHIP', 'EXECUTION', 'CONSEQUENCE'] as const;

export interface LeaderEntry {
  brand: string;
  slug: string;
  score: number;
  rank: number;
  works: number;
  axisAverages: Record<string, number>;
  movement: { scoreDelta: number; rankDelta: number } | null;
  isNew: boolean;
}

type Lens = 'signal' | 'authorship';

function Movement({ m, isNew }: { m: LeaderEntry['movement']; isNew: boolean }) {
  if (isNew) return <span className="text-[10px] font-display font-bold tracking-[0.16em] text-mono-amber-strong">NEW</span>;
  if (!m || m.scoreDelta === 0) return <span className="text-[11px] font-display text-mono-gray">—</span>;
  const up = m.scoreDelta > 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-display font-bold tabular-nums ${up ? 'text-emerald-600' : 'text-red-500'}`}>
      {up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
      {Math.abs(m.scoreDelta)}
    </span>
  );
}

export default function IndexLeaderboard({ entries, trackingSince }: { entries: LeaderEntry[]; trackingSince: string | null }) {
  const [query, setQuery] = useState('');
  const [lens, setLens] = useState<Lens>('signal');
  const [compareMode, setCompareMode] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [followingOnly, setFollowingOnly] = useState(false);
  const { followed, count } = useFollowedBrands();

  const view = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = entries.filter(
      (e) => (!q || e.brand.toLowerCase().includes(q)) && (!followingOnly || followed.includes(e.slug))
    );
    return [...list].sort((a, b) =>
      lens === 'authorship'
        ? (b.axisAverages.AUTHORSHIP ?? 0) - (a.axisAverages.AUTHORSHIP ?? 0)
        : b.score - a.score
    );
  }, [entries, query, lens, followingOnly, followed]);

  // On-site score-change alert: followed brands that moved in the latest update.
  const movedFollowed = entries.filter((e) => followed.includes(e.slug) && e.movement && e.movement.scoreDelta !== 0);

  const toggle = (slug: string) =>
    setSelected((s) => (s.includes(slug) ? s.filter((x) => x !== slug) : s.length >= 3 ? s : [...s, slug]));
  const chosen = entries.filter((e) => selected.includes(e.slug));

  const pill = (active: boolean) =>
    `text-[11px] font-display font-bold tracking-[0.14em] px-3 py-2 border transition-colors ${
      active ? 'bg-mono-amber text-mono-black border-mono-amber' : 'bg-mono-paper text-mono-charcoal border-mono-gray/30 hover:border-mono-amber'
    }`;

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-mono-gray" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a brand…"
            aria-label="Search the Index"
            className="w-full pl-9 pr-3 py-2.5 bg-mono-paper border border-mono-gray/30 font-body text-mono-black placeholder:text-mono-gray focus:outline-none focus:border-mono-amber"
          />
        </div>
        <button onClick={() => setLens('signal')} className={pill(lens === 'signal')}>BY SIGNAL</button>
        <button onClick={() => setLens('authorship')} className={pill(lens === 'authorship')}>BY AUTHORSHIP</button>
        <button onClick={() => { setCompareMode((c) => !c); setSelected([]); }} className={pill(compareMode)}>
          <GitCompare size={13} className="inline mr-1.5 -mt-0.5" />COMPARE
        </button>
        {count > 0 && (
          <button onClick={() => setFollowingOnly((f) => !f)} className={pill(followingOnly)}>
            <Star size={13} className={`inline mr-1.5 -mt-0.5 ${followingOnly ? 'fill-current' : ''}`} />FOLLOWING ({count})
          </button>
        )}
      </div>

      {/* On-site score-change alert for followed brands. */}
      {movedFollowed.length > 0 && (
        <div className="mb-6 flex items-start gap-3 border border-mono-amber/40 bg-mono-amber/10 px-4 py-3">
          <Bell size={16} className="text-mono-amber-strong mt-0.5 shrink-0" />
          <p className="text-sm font-body text-mono-charcoal">
            <span className="font-display font-bold">{movedFollowed.length}</span> brand{movedFollowed.length === 1 ? '' : 's'} you follow moved in the latest update:{' '}
            {movedFollowed.map((e, i) => (
              <span key={e.slug}>
                {i > 0 && ', '}
                <Link href={`/intelligence/signal-index/${e.slug}`} className="font-display font-bold text-mono-black hover:text-mono-amber-strong">
                  {e.brand} {e.movement!.scoreDelta > 0 ? '▲' : '▼'}{Math.abs(e.movement!.scoreDelta)}
                </Link>
              </span>
            ))}
          </p>
        </div>
      )}

      <p className="text-[11px] font-display tracking-[0.14em] text-mono-gray mb-6">
        {view.length} {view.length === 1 ? 'BRAND' : 'BRANDS'}
        {trackingSince ? ` · TRACKING SINCE ${trackingSince}` : ''}
        {compareMode ? ' · SELECT UP TO 3 TO COMPARE' : ''}
      </p>

      {/* Compare panel */}
      {compareMode && chosen.length >= 2 && (
        <div className="mb-8 border border-mono-amber/40 bg-mono-paper p-5">
          <div className="flex items-center justify-between mb-5">
            <p className="text-xs tracking-[0.24em] font-display font-bold text-mono-amber-strong">COMPARING {chosen.length}</p>
            <button onClick={() => setSelected([])} className="text-[11px] font-display font-bold text-mono-gray hover:text-mono-black inline-flex items-center gap-1"><X size={13} /> CLEAR</button>
          </div>
          <div className="grid gap-5" style={{ gridTemplateColumns: `repeat(${chosen.length}, minmax(0,1fr))` }}>
            {chosen.map((e) => (
              <div key={e.slug}>
                <p className="font-display font-bold text-mono-black truncate">{e.brand}</p>
                <p className="text-3xl font-display font-bold text-mono-black tabular-nums mt-1">{e.score}<span className="text-sm text-mono-gray"> /100</span></p>
                <div className="mt-4 space-y-2.5">
                  {AXES.map((ax) => {
                    const lvl = e.axisAverages[ax] ?? 0;
                    return (
                      <div key={ax}>
                        <div className="flex justify-between text-[10px] tracking-[0.12em] font-display font-bold text-mono-gray mb-1">
                          <span>{ax}</span><span className="tabular-nums">{lvl || '—'}</span>
                        </div>
                        <div className="h-1.5 bg-mono-gray/20"><div className="h-full bg-mono-amber" style={{ width: `${(lvl / 5) * 100}%` }} /></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ranking */}
      <ol className="space-y-px bg-mono-gray/20 border border-mono-gray/25">
        {view.map((e) => {
          const checked = selected.includes(e.slug);
          const Row = (
            <div className="flex items-center gap-4 px-5 py-5 md:px-7">
              <span className="w-7 shrink-0 font-display font-bold text-mono-gray text-lg tabular-nums">{e.rank}</span>
              <div className="min-w-0 flex-1">
                <p className="font-display font-bold text-mono-black text-lg md:text-xl truncate group-hover:text-mono-amber transition-colors">{e.brand}</p>
                <p className="text-[11px] tracking-[0.14em] font-display font-bold text-mono-gray mt-1">
                  {e.works} {e.works === 1 ? 'WORK' : 'WORKS'} · AUTHORSHIP {e.axisAverages.AUTHORSHIP ?? '—'}/5
                </p>
              </div>
              {/* Follow star — omitted in compare mode to avoid nested buttons. */}
              {!compareMode && <FollowButton slug={e.slug} variant="icon" />}
              <span className="w-10 shrink-0 text-center"><Movement m={e.movement} isNew={e.isNew} /></span>
              <span className="shrink-0 text-right w-12">
                <span className="block text-3xl font-display font-bold text-mono-black leading-none tabular-nums">{e.score}</span>
                <span className="block text-[9px] tracking-[0.2em] font-display font-bold text-mono-amber-strong">SIGNAL</span>
              </span>
            </div>
          );
          return (
            <li key={e.slug} className="bg-mono-paper group">
              {compareMode ? (
                <button onClick={() => toggle(e.slug)} className={`block w-full text-left transition-colors ${checked ? 'bg-mono-amber/10 ring-1 ring-inset ring-mono-amber' : 'hover:bg-mono-white'}`}>
                  {Row}
                </button>
              ) : (
                <Link href={`/intelligence/signal-index/${e.slug}`} className="block hover:bg-mono-white transition-colors">
                  {Row}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
