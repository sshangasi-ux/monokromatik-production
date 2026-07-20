// The Universe Strip — Edition 01's decision object.
//
// Every scored work on one 0–100 axis, with the published band cut-offs drawn as
// fixed background furniture. This is the exhibit designed to leave the site.
//
// Why a banded barcode plot and not a league table (see docs/EDITION-01-PLAN.md §1):
// four axes at 1–5 on weights .25/.35/.15/.25 reduce to a lattice of ~75 achievable
// values, so 76% of our works share a score with something else. A ranked 1..N list
// would present tie-break noise as findings. Here, ties STACK — seven works on 68
// render as a seven-tall column — so the distribution and the universe are the same
// mark, and the ties are visible as ties.
//
// Not a beeswarm: beeswarm offsets are a distribution device, and at this n the
// jitter would become the visual story. Stacking is honest; jitter is decorative.
//
// Colour rule: bands are NEVER colour-coded. The band is already a position on the
// axis; colouring it too is redundant encoding that reads as good/bad. Band identity
// comes from position + alternating neutral gutters + a direct letter. Amber does one
// job only — "the thing you are currently looking at".

import { SIGNAL_BANDS } from '../../../lib/signal-index';
import type { ScoredWork } from '../../../lib/edition-01';

const W = 1000;
const H = 260;
const PAD_L = 44;
const PAD_R = 44;
const BASE = 200; // baseline y for the ticks
const TICK_H = 6;
const TICK_GAP = 7;

const x = (score: number) => PAD_L + (score / 100) * (W - PAD_L - PAD_R);

export default function UniverseStrip({
  works,
  highlight,
}: {
  works: ScoredWork[];
  /** Slug of the work to pick out in amber. */
  highlight?: string;
}) {
  // Group by score so ties stack rather than overplot.
  const byScore = new Map<number, ScoredWork[]>();
  for (const w of works) {
    const list = byScore.get(w.score) ?? [];
    list.push(w);
    byScore.set(w.score, list);
  }

  const bands = [...SIGNAL_BANDS].sort((a, b) => a.min - b.min);
  const highlighted = works.find((w) => w.slug === highlight);

  const label = `Every one of the ${works.length} scored works plotted on the 0 to 100 Cultural-Signal scale, grouped into the published bands. Highest ${Math.max(
    ...works.map((w) => w.score),
  )}, lowest ${Math.min(...works.map((w) => w.score))}.`;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full min-w-[520px] h-auto"
        role="img"
        aria-label={label}
      >
        <title>The rated universe</title>
        <desc>{label}</desc>

        {/* Band gutters — fixed furniture, alternating neutral fills. No hue. */}
        {bands.map((b, i) => {
          const next = bands[i + 1];
          const x0 = x(b.min);
          const x1 = next ? x(next.min) : x(100);
          return (
            <g key={b.band}>
              {i % 2 === 0 && (
                <rect x={x0} y={40} width={Math.max(0, x1 - x0)} height={BASE - 40} fill="#141210" opacity={0.045} />
              )}
              <line x1={x0} y1={40} x2={x0} y2={BASE} stroke="#141210" strokeOpacity={0.18} strokeWidth={1} />
              <text
                x={(x0 + x1) / 2}
                y={32}
                textAnchor="middle"
                fontSize={13}
                fontWeight={700}
                fill="#141210"
                opacity={0.55}
                fontFamily="'Space Grotesk', system-ui, sans-serif"
                letterSpacing={1.2}
              >
                {b.band}
              </text>
            </g>
          );
        })}

        {/* Baseline */}
        <line x1={PAD_L} y1={BASE} x2={W - PAD_R} y2={BASE} stroke="#141210" strokeOpacity={0.5} strokeWidth={1} />

        {/* Ticks — one per work, stacked upward within a tie group. */}
        {[...byScore.entries()].map(([score, group]) =>
          group.map((w, j) => {
            const isHi = w.slug === highlight;
            const y2 = BASE - 2 - j * TICK_GAP;
            return (
              <line
                key={w.slug}
                x1={x(score)}
                y1={y2}
                x2={x(score)}
                y2={y2 - TICK_H}
                stroke={isHi ? '#CC5500' : '#141210'}
                strokeOpacity={isHi ? 1 : 0.45}
                strokeWidth={isHi ? 3.5 : 2}
                strokeLinecap="square"
              />
            );
          }),
        )}

        {/* Highlighted work gets a full-height stem + label so it reads at a glance. */}
        {highlighted && (
          <g>
            <line
              x1={x(highlighted.score)}
              y1={BASE}
              x2={x(highlighted.score)}
              y2={54}
              stroke="#CC5500"
              strokeWidth={1}
              strokeDasharray="3 3"
              opacity={0.7}
            />
            <text
              x={x(highlighted.score)}
              y={48}
              textAnchor="middle"
              fontSize={13}
              fontWeight={700}
              fill="#CC5500"
              fontFamily="'Space Grotesk', system-ui, sans-serif"
            >
              {highlighted.score}
            </text>
          </g>
        )}

        {/* Scale */}
        {[0, 20, 40, 60, 80, 100].map((t) => (
          <g key={t}>
            <line x1={x(t)} y1={BASE} x2={x(t)} y2={BASE + 5} stroke="#141210" strokeOpacity={0.5} />
            <text
              x={x(t)}
              y={BASE + 20}
              textAnchor="middle"
              fontSize={11}
              fill="#141210"
              opacity={0.6}
              fontFamily="'Space Grotesk', system-ui, sans-serif"
            >
              {t}
            </text>
          </g>
        ))}
        <text
          x={PAD_L}
          y={BASE + 42}
          fontSize={10}
          fill="#141210"
          opacity={0.55}
          fontFamily="'Space Grotesk', system-ui, sans-serif"
          letterSpacing={1.6}
        >
          CULTURAL-SIGNAL SCORE — ONE TICK PER SCORED WORK, STACKED WHERE WORKS TIE
        </text>
      </svg>
    </div>
  );
}
