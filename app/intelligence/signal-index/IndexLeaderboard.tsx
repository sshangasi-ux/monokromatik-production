'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, ArrowUpRight, ArrowDownRight, GitCompare, X, Star, Bell } from 'lucide-react';
import { SIGNAL_BANDS, signalBand } from '../../../lib/signal-index';
import { useFollowedBrands } from '../../components/useFollowedBrands';
import FollowButton from '../../components/FollowButton';
import OutlookChip from '../../components/dataviz/OutlookChip';
import type { Outlook } from '../../../lib/outlook';

const AXES = ['IDEA', 'AUTHORSHIP', 'EXECUTION', 'CONSEQUENCE'] as const;

export interface LeaderEntry {
  brand: string;
  /** The work's title — the Index ranks works, so this is the row's headline. */
  title: string;
  /** The WORK slug. Identity of the row, and the case-study link. */
  slug: string;
  /** The brand slug — used for following and for the brand roll-up page. */
  brandSlug: string;
  score: number;
  rank: number;
  works: number;
  axisAverages: Record<string, number>;
  market?: string;
  /** Forward-looking view; null means Stable. */
  outlook?: Outlook | null;
  movement: { scoreDelta: number; rankDelta: number; rebased?: boolean; rubricFrom?: string; rubricTo?: string } | null;
  isNew: boolean;
  /** The measured corroboration anchor (0–100) + tier. */
  evidenceScore?: number | null;
  evidenceTier?: 'Strong' | 'Moderate' | 'Developing' | null;
}

const tierClass = (t: LeaderEntry['evidenceTier']) =>
  t === 'Strong' ? 'text-emerald-600' : t === 'Moderate' ? 'text-mono-amber-strong' : 'text-mono-gray';

// Filter by the PUBLISHED letter bands, not ad-hoc 90/80/70 buckets. The
// methodology page publishes these cut-offs; the filter has to agree with them
// or the Index contradicts its own stated method. (Pre-v2.0 the whole corpus sat
// at 57+, so three buckets covered it; the re-score populated B and BB.)
type Band = 'all' | string;
const inBand = (score: number, band: Band) => band === 'all' || signalBand(score)?.band === band;

type Lens = 'signal' | 'authorship' | 'evidence';

function Movement({ m, isNew }: { m: LeaderEntry['movement']; isNew: boolean }) {
  if (isNew) return <span className="text-[10px] font-display font-bold tracking-[0.16em] text-mono-amber-strong">NEW</span>;
  // A change of rubric OR of ranking unit is not movement. Show the rebase.
  if (m?.rebased)
    return (
      <span
        className="text-[10px] font-display font-bold tracking-[0.12em] text-mono-gray"
        title={`Index basis changed: ${m.rubricFrom} → ${m.rubricTo}. Earlier readings are not comparable.`}
      >
        REBASED
      </span>
    );
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
  const [market, setMarket] = useState('');
  const [band, setBand] = useState<Band>('all');
  const { followed, count } = useFollowedBrands();

  const markets = useMemo(
    () => [...new Set(entries.map((e) => e.market).filter(Boolean) as string[])].sort(),
    [entries]
  );

  const view = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = entries.filter(
      (e) =>
        (!q || e.brand.toLowerCase().includes(q) || e.title.toLowerCase().includes(q)) &&
        (!followingOnly || followed.includes(e.brandSlug)) &&
        (!market || e.market === market) &&
        inBand(e.score, band)
    );
    return [...list].sort((a, b) =>
      lens === 'authorship'
        ? (b.axisAverages.AUTHORSHIP ?? 0) - (a.axisAverages.AUTHORSHIP ?? 0)
        : lens === 'evidence'
          ? (b.evidenceScore ?? 0) - (a.evidenceScore ?? 0)
          : b.score - a.score
    );
  }, [entries, query, lens, followingOnly, followed, market, band]);

  // On-site score-change alert: followed brands that moved in the latest update.
  const movedFollowed = entries.filter((e) => followed.includes(e.brandSlug) && e.movement && e.movement.scoreDelta !== 0);

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
            placeholder="Find a work or brand…"
            aria-label="Search the Index"
            className="w-full pl-9 pr-3 py-2.5 bg-mono-paper border border-mono-gray/30 font-body text-mono-black placeholder:text-mono-gray focus:outline-none focus:border-mono-amber"
          />
        </div>
        <button onClick={() => setLens('signal')} className={pill(lens === 'signal')}>BY SIGNAL</button>
        <button onClick={() => setLens('authorship')} className={pill(lens === 'authorship')}>BY AUTHORSHIP</button>
        <button onClick={() => setLens('evidence')} className={pill(lens === 'evidence')}>BY EVIDENCE</button>
        <button onClick={() => { setCompareMode((c) => !c); setSelected([]); }} className={pill(compareMode)}>
          <GitCompare size={13} className="inline mr-1.5 -mt-0.5" />COMPARE
        </button>
        {count > 0 && (
          <button onClick={() => setFollowingOnly((f) => !f)} className={pill(followingOnly)}>
            <Star size={13} className={`inline mr-1.5 -mt-0.5 ${followingOnly ? 'fill-current' : ''}`} />FOLLOWING ({count})
          </button>
        )}
      </div>

      {/* Filters — market/region + score band. Turns the ranking into a cut-able tool. */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <span className="text-[10px] tracking-[0.18em] font-display font-bold text-mono-gray">FILTER</span>
        {markets.length > 1 && (
          <select
            value={market}
            onChange={(e) => setMarket(e.target.value)}
            aria-label="Filter by market"
            className="text-[11px] font-display font-bold tracking-[0.06em] px-3 py-2 bg-mono-paper border border-mono-gray/30 text-mono-charcoal focus:outline-none focus:border-mono-amber max-w-[200px]"
          >
            <option value="">All markets</option>
            {markets.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        )}
        {/* Only offer bands that actually contain a brand — an empty filter pill
            reads as a broken control. */}
        {SIGNAL_BANDS.filter((b) => entries.some((e) => signalBand(e.score)?.band === b.band)).map((b) => (
          <button
            key={b.band}
            onClick={() => setBand((cur) => (cur === b.band ? 'all' : b.band))}
            className={pill(band === b.band)}
            title={`${b.band} — ${b.label}`}
          >
            {b.band}
          </button>
        ))}
        {(market || band !== 'all') && (
          <button onClick={() => { setMarket(''); setBand('all'); }} className="text-[11px] font-display font-bold tracking-[0.12em] text-mono-amber-strong hover:underline">CLEAR</button>
        )}
        <span className="ml-auto text-[11px] font-body text-mono-gray tabular-nums">{view.length} shown</span>
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
                <p className="text-[10px] tracking-[0.16em] font-display font-bold text-mono-amber-strong truncate">{e.brand.toUpperCase()}</p>
                <p className="font-display font-bold text-mono-black truncate">{e.title}</p>
                <p className="text-3xl font-display font-bold text-mono-black tabular-nums mt-1">
                  {e.score}<span className="text-sm text-mono-gray"> /100</span>
                  <span className="ml-2 align-middle inline-block text-[10px] font-display font-bold tracking-[0.08em] border border-mono-black/25 px-1.5 py-0.5">{signalBand(e.score)?.band}</span>
                </p>
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
                <p className="text-[11px] tracking-[0.16em] font-display font-bold text-mono-amber-strong truncate">{e.brand.toUpperCase()}</p>
                <p className="font-display font-bold text-mono-black text-lg md:text-xl truncate group-hover:text-mono-amber transition-colors mt-0.5">{e.title}</p>
                <p className="text-[11px] tracking-[0.14em] font-display font-bold text-mono-gray mt-1">
                  AUTHORSHIP {e.axisAverages.AUTHORSHIP ?? '—'}/5
                  {e.evidenceTier && <> · <span className={tierClass(e.evidenceTier)}>EVIDENCE {e.evidenceTier.toUpperCase()}</span></>}
                </p>
                {/* Only surface a non-Stable outlook — printing "STABLE" on 63 of
                    70 rows would bury the seven that actually say something. */}
                {e.outlook && e.outlook.direction !== 'stable' && (
                  <span className="inline-block mt-2"><OutlookChip outlook={e.outlook} /></span>
                )}
              </div>
              {/* Follow star — omitted in compare mode to avoid nested buttons. */}
              {!compareMode && <FollowButton slug={e.brandSlug} variant="icon" />}
              <span className="w-10 shrink-0 text-center"><Movement m={e.movement} isNew={e.isNew} /></span>
              <span className="shrink-0 text-right w-16">
                <span className="block text-3xl font-display font-bold text-mono-black leading-none tabular-nums">{e.score}</span>
                <span
                  className="mt-1 inline-block text-[10px] font-display font-bold tracking-[0.08em] text-mono-black border border-mono-black/25 px-1.5 py-0.5"
                  title={signalBand(e.score)?.label}
                >
                  {signalBand(e.score)?.band}
                </span>
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
                <Link href={`/intelligence/case-studies/${e.slug}`} className="block hover:bg-mono-white transition-colors">
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
