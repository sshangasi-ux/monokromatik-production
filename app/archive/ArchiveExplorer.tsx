'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import SignalScore from '../components/SignalScore';
import type { ArchiveEntry, ArchiveKind } from '../../lib/archive';

const KINDS: (ArchiveKind | 'All')[] = ['All', 'Signal', 'Intelligence', 'Report', 'Issue', 'Culture'];
type Sort = 'newest' | 'oldest' | 'score';

const KIND_LABEL: Record<ArchiveKind, string> = {
  Signal: 'SIGNAL',
  Intelligence: 'INTELLIGENCE',
  Report: 'REPORT',
  Issue: 'ISSUE',
  Culture: 'CULTURE',
};

function fmtDate(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function matches(e: ArchiveEntry, q: string): boolean {
  if (!q) return true;
  const hay = [e.title, e.summary, e.meta, ...e.tags].join(' ').toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => hay.includes(term));
}

function sortEntries(list: ArchiveEntry[], sort: Sort): ArchiveEntry[] {
  const time = (e: ArchiveEntry) => (e.date ? new Date(e.date).getTime() : null);
  const out = [...list];
  if (sort === 'score') {
    out.sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
    return out;
  }
  out.sort((a, b) => {
    const ta = time(a);
    const tb = time(b);
    if (ta === null && tb === null) return 0;
    if (ta === null) return 1;
    if (tb === null) return -1;
    return sort === 'newest' ? tb - ta : ta - tb;
  });
  return out;
}

const pill = (active: boolean) =>
  `text-[11px] font-display font-bold tracking-[0.16em] px-3 py-2 border transition-colors ${
    active
      ? 'bg-mono-amber text-mono-black border-mono-amber'
      : 'bg-mono-white text-mono-charcoal border-mono-gray/30 hover:border-mono-amber'
  }`;

export default function ArchiveExplorer({
  entries,
  years,
}: {
  entries: ArchiveEntry[];
  years: string[];
}) {
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<ArchiveKind | 'All'>('All');
  const [year, setYear] = useState<string>('All');
  const [sort, setSort] = useState<Sort>('newest');

  const filtered = useMemo(() => {
    const list = entries.filter((e) => {
      if (kind !== 'All' && e.kind !== kind) return false;
      if (year !== 'All' && (!e.date || e.date.slice(0, 4) !== year)) return false;
      return matches(e, query);
    });
    return sortEntries(list, sort);
  }, [entries, kind, year, sort, query]);

  return (
    <div>
      {/* Controls */}
      <div className="space-y-5 mb-8">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mono-gray" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the archive — brands, themes, titles…"
            aria-label="Search the archive"
            className="w-full pl-10 pr-4 py-3 bg-mono-white border border-mono-gray/30 font-body text-mono-black placeholder:text-mono-gray focus:outline-none focus:border-mono-amber"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {KINDS.map((k) => (
            <button key={k} onClick={() => setKind(k)} className={pill(kind === k)}>
              {k === 'All' ? 'ALL' : KIND_LABEL[k]}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => setYear('All')} className={pill(year === 'All')}>
              ALL YEARS
            </button>
            {years.map((y) => (
              <button key={y} onClick={() => setYear(y)} className={pill(year === y)}>
                {y}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="archive-sort" className="text-[10px] font-display font-bold tracking-[0.2em] text-mono-gray">
              SORT
            </label>
            <select
              id="archive-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="text-[11px] font-display font-bold tracking-[0.12em] bg-mono-white border border-mono-gray/30 px-3 py-2 text-mono-charcoal focus:outline-none focus:border-mono-amber"
            >
              <option value="newest">NEWEST</option>
              <option value="oldest">OLDEST</option>
              <option value="score">SIGNAL SCORE</option>
            </select>
          </div>
        </div>

        <p className="text-[11px] font-display font-bold tracking-[0.2em] text-mono-gray">
          {filtered.length} {filtered.length === 1 ? 'ENTRY' : 'ENTRIES'}
          {kind !== 'All' || year !== 'All' || query ? ` · OF ${entries.length}` : ''}
        </p>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <p className="py-16 text-center font-body text-mono-gray">
          Nothing matches that yet. Clear a filter or try a broader term.
        </p>
      ) : (
        <ol className="divide-y divide-mono-gray/20 border-t border-mono-gray/20">
          {filtered.map((e, i) => {
            const Row = (
              <div className="grid grid-cols-[auto_1fr_auto] gap-x-4 gap-y-2 py-5 items-baseline">
                <span className="font-display text-[11px] tabular-nums text-mono-gray pt-1">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="text-[9px] font-display font-bold tracking-[0.18em] px-2 py-0.5 bg-mono-black text-mono-white">
                      {KIND_LABEL[e.kind]}
                    </span>
                    <span className="text-[10px] font-display tracking-[0.12em] text-mono-gray">
                      {fmtDate(e.date)}
                    </span>
                    {e.premium && (
                      <span className="text-[9px] font-display font-bold tracking-[0.18em] px-2 py-0.5 border border-mono-amber-strong/60 text-mono-amber-strong">
                        MEMBERS
                      </span>
                    )}
                    {e.forthcoming && (
                      <span className="text-[9px] font-display font-bold tracking-[0.18em] px-2 py-0.5 border border-mono-gray/40 text-mono-gray">
                        FORTHCOMING
                      </span>
                    )}
                  </div>
                  <h3 className="font-display font-bold text-lg leading-snug text-mono-black group-hover:text-mono-amber-strong transition-colors">
                    {e.title}
                  </h3>
                  {e.summary && (
                    <p className="mt-1 font-body text-sm text-mono-charcoal/80 line-clamp-2 max-w-2xl">
                      {e.summary}
                    </p>
                  )}
                  {e.meta && (
                    <p className="mt-1.5 text-[10px] font-display tracking-[0.14em] text-mono-gray uppercase">
                      {e.meta}
                    </p>
                  )}
                </div>
                <div className="pt-1">
                  {typeof e.score === 'number' && <SignalScore score={e.score} size="sm" />}
                </div>
              </div>
            );

            return (
              <li key={e.id} className="group">
                {e.href ? (
                  <Link href={e.href} className="block hover:bg-mono-soft-white/60 -mx-3 px-3 transition-colors">
                    {Row}
                  </Link>
                ) : (
                  <div className="-mx-3 px-3 opacity-80">{Row}</div>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
