'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Lock } from 'lucide-react';
import type { ReportCard, PriceTier, SectorId } from '../../../lib/report-merch';

type TypeFilter = 'all' | 'paid' | 'free';

const TYPE_LABEL: Record<TypeFilter, string> = {
  all: 'All',
  paid: 'To buy',
  free: 'Free to read',
};

// Merchandising order: paid first (the shop leads with what it sells), then
// email-gated, then open — each group in the order it arrives.
const TIER_RANK: Record<PriceTier, number> = { paid: 0, premium: 1, free: 2 };

function Badge({ card, gated }: { card: ReportCard; gated: boolean }) {
  if (card.tier === 'paid') {
    return (
      <span className="shrink-0 bg-mono-amber text-mono-black px-3 py-1.5 font-display font-bold text-sm tracking-tight tabular-nums">
        {card.price}
      </span>
    );
  }
  if (card.tier === 'premium' && gated) {
    return (
      <span className="shrink-0 inline-flex items-center gap-1 border border-mono-amber text-mono-amber-strong px-2.5 py-1 font-display font-bold text-[10px] tracking-[0.18em]">
        <Lock size={10} /> MEMBERS
      </span>
    );
  }
  return (
    <span className="shrink-0 border border-mono-gray/40 text-mono-gray px-2.5 py-1 font-display font-bold text-[10px] tracking-[0.2em]">
      FREE
    </span>
  );
}

function Card({ card, gated }: { card: ReportCard; gated: boolean }) {
  const cta =
    card.tier === 'paid' ? `BUY · ${card.price}` : card.tier === 'premium' && gated ? 'UNLOCK' : 'READ';
  return (
    <Link
      href={card.href}
      className="group relative flex min-h-[318px] flex-col justify-between border border-mono-gray/25 bg-mono-white p-7 transition-all hover:border-mono-amber hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-mono-amber md:p-8"
    >
      {card.tier === 'paid' && (
        <span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-mono-amber" />
      )}
      <div>
        <div className="flex items-start justify-between gap-3">
          <p className="text-[10px] font-display font-bold uppercase tracking-[0.22em] text-mono-gray">
            {card.sectorLabel}
          </p>
          <Badge card={card} gated={gated} />
        </div>
        <h3 className="mt-5 font-display text-2xl font-bold leading-tight text-mono-black transition-colors group-hover:text-mono-amber md:text-[1.7rem]">
          {card.title}
        </h3>
        <p className="mt-4 font-body leading-relaxed text-mono-charcoal line-clamp-3">{card.summary}</p>
      </div>
      <div className="mt-7 flex items-center justify-between gap-3 border-t border-mono-gray/20 pt-5">
        <p className="text-[10px] font-display font-bold uppercase tracking-[0.2em] text-mono-amber-strong">
          {card.series}
        </p>
        <span className="inline-flex items-center gap-2 whitespace-nowrap font-display text-[11px] font-bold tracking-[0.16em] text-mono-black group-hover:text-mono-amber">
          {cta} <ArrowRight size={14} />
        </span>
      </div>
    </Link>
  );
}

export default function ReportsShelf({
  items,
  sectors,
  typeCounts,
  gated,
}: {
  items: ReportCard[];
  sectors: { id: SectorId; label: string; count: number }[];
  typeCounts: Record<TypeFilter, number>;
  gated: boolean;
}) {
  const [sector, setSector] = useState<SectorId | 'all'>('all');
  const [type, setType] = useState<TypeFilter>('all');

  const sorted = useMemo(
    () => [...items].sort((a, b) => TIER_RANK[a.tier] - TIER_RANK[b.tier]),
    [items],
  );
  const filtered = useMemo(
    () =>
      sorted.filter((c) => {
        if (sector !== 'all' && c.sector !== sector) return false;
        if (type === 'paid' && c.tier !== 'paid') return false;
        if (type === 'free' && c.tier === 'paid') return false;
        return true;
      }),
    [sorted, sector, type],
  );

  const chip = (active: boolean) =>
    `px-3.5 py-2 font-display text-xs font-bold tracking-[0.12em] uppercase border transition-colors ${
      active
        ? 'bg-mono-black text-mono-white border-mono-black'
        : 'bg-transparent text-mono-charcoal border-mono-gray/30 hover:border-mono-black'
    }`;

  return (
    <div>
      {/* Filter bar */}
      <div className="sticky top-0 z-20 -mx-4 mb-10 border-y border-mono-gray/20 bg-mono-soft-white/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => setSector('all')} className={chip(sector === 'all')}>
              All topics
            </button>
            {sectors.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSector(s.id)}
                className={chip(sector === s.id)}
              >
                {s.label} <span className="ml-1 opacity-50 tabular-nums">{s.count}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 lg:shrink-0">
            {(['all', 'paid', 'free'] as TypeFilter[]).map((t) => (
              <button key={t} type="button" onClick={() => setType(t)} className={chip(type === t)}>
                {TYPE_LABEL[t]} <span className="ml-1 opacity-50 tabular-nums">{typeCounts[t]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="mb-6 font-body text-sm text-mono-gray">
        Showing <span className="font-bold text-mono-black tabular-nums">{filtered.length}</span>{' '}
        {filtered.length === 1 ? 'report' : 'reports'}
        {sector !== 'all' && <> in {sectors.find((s) => s.id === sector)?.label}</>}
        {type !== 'all' && <> · {TYPE_LABEL[type]}</>}
      </p>

      {filtered.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => (
            <Card key={c.slug} card={c} gated={gated} />
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-mono-gray/30 bg-mono-white p-14 text-center">
          <p className="font-display text-xl font-bold text-mono-black">Nothing in that cut yet.</p>
          <p className="mt-2 font-body text-mono-gray">Try another topic, or clear the filters.</p>
          <button
            type="button"
            onClick={() => {
              setSector('all');
              setType('all');
            }}
            className="mt-6 inline-flex items-center gap-2 bg-mono-black px-5 py-3 font-display text-xs font-bold tracking-[0.16em] text-mono-white"
          >
            CLEAR FILTERS <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
