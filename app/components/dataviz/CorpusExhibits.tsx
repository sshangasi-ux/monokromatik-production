// Corpus-level exhibits: the distribution, the rebase, and how the panel grew.
//
// Colour rule throughout: bands are NEVER colour-coded. A band is already a
// position on the scale; colouring it too is redundant encoding that inevitably
// reads as good/bad. Amber does one job only — "the thing you are looking at".

import { SIGNAL_BANDS, signalBand } from '../../../lib/signal-index';
import type { BandCount } from '../../../lib/edition-01';
import type { IndexSnapshot } from '../../../lib/index-history';

/* ------------------------------------------------------------------ */
/* EXHIBIT 02 — The Band Ledger                                        */
/* ------------------------------------------------------------------ */

/**
 * One square per work, grouped by band, in RATING order — never sorted by count.
 * The order is the scale; re-sorting it would turn a rating into a chart of
 * popularity. A waffle rather than a bar because at this size the unit square is
 * honest about small counts in a way a smooth bar is not: "AAA is 5 works" reads
 * as five things, not as a short rectangle.
 */
export function BandLedger({ bands, highlight }: { bands: BandCount[]; highlight?: string }) {
  const total = bands.reduce((s, b) => s + b.count, 0);
  return (
    <div>
      <div className="border border-mono-gray/25 bg-mono-white">
        {bands.map((b) => (
          <div key={b.band} className="flex items-center gap-4 px-4 py-3 border-b border-mono-gray/15 last:border-b-0">
            <span
              className={`w-12 shrink-0 text-center text-sm font-display font-bold py-1 border ${
                highlight === b.band ? 'border-mono-amber text-mono-amber-strong' : 'border-mono-black/25 text-mono-black'
              }`}
            >
              {b.band}
            </span>
            <span className="w-16 shrink-0 text-xs font-display font-bold text-mono-gray tabular-nums">
              {b.min === 0 ? '< 40' : `${b.min}–${b.max}`}
            </span>
            <div className="flex-1 flex flex-wrap gap-[3px] py-0.5">
              {Array.from({ length: b.count }).map((_, i) => (
                <span
                  key={i}
                  className={`w-[10px] h-[10px] ${highlight === b.band ? 'bg-mono-amber' : 'bg-mono-ink'}`}
                />
              ))}
              {b.count === 0 && <span className="text-[11px] font-body text-mono-gray/70">none</span>}
            </div>
            <span className="w-8 text-right text-sm font-display font-bold text-mono-black tabular-nums">{b.count}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 font-body text-xs text-mono-gray">
        One square per work · {total} works · cut-offs are absolute and published in advance, not forced percentiles.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* EXHIBIT 06 — The Rebase                                             */
/* ------------------------------------------------------------------ */

const bandCountsFromScores = (scores: number[]) =>
  SIGNAL_BANDS.map((b) => ({ band: b.band, count: scores.filter((s) => signalBand(s)?.band === b.band).length }));

/**
 * Two distributions, side by side, separated by a hard break — the break-in-series
 * convention used when a statistical series is rebased.
 *
 * THE THING THIS EXHIBIT MUST NEVER DO is draw a connector, arrow or slope between
 * the two columns. Any connector asserts that works moved. They did not; the ruler
 * did. A Sankey or slope chart across this boundary would render our own
 * methodology change as ~60 downgrades, which is the single most defamatory chart
 * available to us.
 */
export function RebaseExhibit({
  before,
  after,
  unit = 'entries',
}: {
  before: { label: string; scores: number[] };
  after: { label: string; scores: number[] };
  /** What each entry counts. These snapshots predate the work-level Index, so
   *  calling them "works" would misstate what was compared. */
  unit?: string;
}) {
  const mean = (xs: number[]) => (xs.length ? Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 10) / 10 : 0);
  const cols = [before, after].map((c) => ({ ...c, counts: bandCountsFromScores(c.scores), mean: mean(c.scores) }));
  const max = Math.max(1, ...cols.flatMap((c) => c.counts.map((b) => b.count)));

  const Column = ({ col }: { col: (typeof cols)[number] }) => (
    <div className="min-w-0">
      <p className="text-[10px] tracking-[0.18em] font-display font-bold text-mono-gray mb-3 truncate">
        {col.label.toUpperCase()}
      </p>
      <div className="space-y-1.5">
        {col.counts.map((b) => (
          <div key={b.band} className="flex items-center gap-2">
            <span className="w-9 shrink-0 text-[10px] font-display font-bold text-mono-black tabular-nums">{b.band}</span>
            <div className="flex-1 h-3.5 bg-mono-soft-white">
              <div className="h-full bg-mono-ink" style={{ width: `${(b.count / max) * 100}%` }} />
            </div>
            <span className="w-6 text-right text-[11px] font-display font-bold text-mono-gray tabular-nums">{b.count}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] font-body text-mono-gray tabular-nums">
        {col.scores.length} {unit} · mean {col.mean}
      </p>
    </div>
  );

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-stretch">
      <Column col={cols[0]} />
      {/* The break. Deliberately a wall, not a bridge — see the note above. */}
      <div className="flex flex-col items-center justify-center px-3">
        <div className="w-px flex-1 bg-mono-black/30" />
        <span className="my-2 text-[9px] tracking-[0.18em] font-display font-bold text-mono-gray whitespace-nowrap [writing-mode:vertical-rl] rotate-180">
          REBASED
        </span>
        <div className="w-px flex-1 bg-mono-black/30" />
      </div>
      <Column col={cols[1]} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* EXHIBIT 08 — The Panel Ledger                                       */
/* ------------------------------------------------------------------ */

/**
 * How the rated universe was assembled, snapshot by snapshot, with the
 * comparability basis banded underneath.
 *
 * This exists to pre-empt the obvious attack — "your mean fell because you added
 * weaker entries, not because you got stricter". Showing panel growth NEXT TO the
 * rebase is what makes the v2.0 claim survivable.
 *
 * It deliberately plots COUNT, never mean. The panel is not a fixed cohort, so a
 * line of means across these snapshots would not be a time series of the same
 * thing.
 */
export function PanelLedger({ snapshots }: { snapshots: IndexSnapshot[] }) {
  const max = Math.max(1, ...snapshots.map((s) => s.entries.length));
  const basis = (s: IndexSnapshot) => `${s.rubricVersion ?? 'v1'}/${s.unit ?? 'brand'}`;
  return (
    <div>
      <div className="flex items-end gap-2 h-40">
        {snapshots.map((s, i) => {
          const prev = i > 0 ? basis(snapshots[i - 1]) : null;
          const broke = prev !== null && prev !== basis(s);
          return (
            <div key={s.date} className="flex-1 flex flex-col items-center justify-end h-full min-w-0">
              {broke && <span className="text-[8px] tracking-[0.12em] font-display font-bold text-mono-amber-strong mb-1">BASIS</span>}
              <span className="text-[10px] font-display font-bold text-mono-black tabular-nums mb-1">{s.entries.length}</span>
              <div
                className={`w-full ${broke ? 'bg-mono-amber' : 'bg-mono-ink'}`}
                style={{ height: `${(s.entries.length / max) * 100}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex gap-2 mt-2">
        {snapshots.map((s) => (
          <div key={s.date} className="flex-1 min-w-0 text-center">
            <p className="text-[9px] font-body text-mono-gray truncate">{s.date.slice(5)}</p>
            <p className="text-[8px] tracking-[0.08em] font-display font-bold text-mono-gray/80 truncate">{basis(s)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
