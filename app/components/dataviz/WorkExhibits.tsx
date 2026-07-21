// Per-work exhibits: how a single score is built, and how much evidence sits
// behind it.

import { AXIS_WEIGHTS, signalBand } from '../../../lib/signal-index';
import { RUBRIC_LEVELS } from '../../../lib/rubric';
import type { Axis } from '../../../lib/edition-01';

const AXES: Axis[] = ['IDEA', 'AUTHORSHIP', 'EXECUTION', 'CONSEQUENCE'];

/* ------------------------------------------------------------------ */
/* EXHIBIT 03 — The Weighted Contribution Bar                          */
/* ------------------------------------------------------------------ */

/**
 * The radar replacement.
 *
 * Four axes at unequal weights is exactly the case where a radar chart is worst:
 * its spokes are equal by construction, so it would render AUTHORSHIP (35%) and
 * EXECUTION (15%) as the same size, and its enclosed area is not proportional to
 * the composite. Two independent critiques converge on that defect.
 *
 * Here, horizontal length IS contribution. Each axis gets a slot whose WIDTH is
 * its weight, filled to level/5. So you read two things at once: what the work
 * earned, and how much was available to earn. The slot widths teach the weighting
 * without a legend — and the widest slot on every card is AUTHORSHIP, which is
 * the whole editorial position, made visible rather than asserted.
 */
export function ContributionBar({ levels }: { levels: Record<string, number> }) {
  // A visible gutter between slots. Without it, two adjacent axes both at 5/5
  // merge into one indistinguishable black block and the reader loses the very
  // thing the exhibit exists to show — which axis contributed what.
  const GAP = 1.2;
  const usable = 100 - GAP * (AXES.length - 1);
  let x = 0;
  const slots = AXES.map((axis) => {
    const w = (AXIS_WEIGHTS[axis] * 100 * usable) / 100;
    const level = levels[axis] ?? 0;
    const slot = { axis, w, x, level, earned: (level / 5) * w, weightPct: AXIS_WEIGHTS[axis] * 100 };
    x += w + GAP;
    return slot;
  });
  const total = Math.round(slots.reduce((s, a) => s + a.earned, 0));
  const label = slots.map((s) => `${s.axis} ${s.level} of 5 at ${Math.round(s.weightPct)}% weight`).join('; ');

  return (
    <div>
      <svg viewBox="0 0 100 14" className="w-full h-auto" role="img" aria-label={`How the composite of ${total} is built: ${label}.`}>
        <title>Weighted contribution by axis</title>
        {slots.map((s) => (
          <g key={s.axis}>
            {/* The slot: what was available at this axis's weight. */}
            <rect x={s.x} y={0} width={s.w} height={14} fill="none" stroke="#141210" strokeOpacity={0.28} strokeWidth={0.4} />
            {/* The fill: what the work earned. */}
            <rect x={s.x} y={0} width={s.earned} height={14} fill="#141210" />
          </g>
        ))}
      </svg>
      <div className="mt-2 flex w-full text-[10px] font-display font-bold text-mono-gray">
        {slots.map((s, i) => (
          <span
            key={s.axis}
            className="min-w-0"
            style={{ width: `${s.w}%`, marginLeft: i === 0 ? 0 : `${1.2}%` }}
          >
            <span className="block truncate tracking-[0.08em] text-mono-black">{s.axis.slice(0, 4)}</span>
            <span className="block tabular-nums">
              {s.level}/5 · {Math.round(s.weightPct)}%
            </span>
          </span>
        ))}
      </div>
      <p className="mt-2 font-body text-[11px] text-mono-gray">
        Slot width is the axis weight; fill is the level awarded. Levels are 1–5 editorial judgements, not measurements —
        a 3 is a defined standard, not 60%.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* EXHIBIT 04 — The Evidence Row                                       */
/* ------------------------------------------------------------------ */

const TIERS = ['Developing', 'Moderate', 'Strong'] as const;

/**
 * Honest uncertainty, shown rather than stated.
 *
 * University-ranking research is blunt about the cost of hiding this: QS, THE and
 * ARWU publish no uncertainty at all, and funnel-plot work shows a nominal 78th
 * place is compatible with roughly 68th–94th. We cannot compute a confidence
 * interval — we have no sampling — so we show what we DO have: how many works sit
 * behind the reading, and how much corroboration.
 *
 * The works-dots matter most. With one scored work behind almost every brand,
 * "n=1" has to be unmissable rather than buried in a footnote.
 */
export function EvidenceRow({
  works,
  tier,
  score,
}: {
  works: number;
  tier: 'Strong' | 'Moderate' | 'Developing' | null;
  score?: number | null;
}) {
  const reached = tier ? TIERS.indexOf(tier) : -1;
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
      <div>
        <p className="text-[10px] tracking-[0.18em] font-display font-bold text-mono-gray mb-1.5">SCORED WORKS</p>
        <div className="flex items-center gap-1.5" role="img" aria-label={`${works} scored ${works === 1 ? 'work' : 'works'} behind this reading, out of five shown.`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className={`w-2.5 h-2.5 rounded-full ${i < works ? 'bg-mono-ink' : 'border border-mono-gray/40'}`}
            />
          ))}
          <span className="ml-1 text-sm font-display font-bold text-mono-black tabular-nums">{works}</span>
        </div>
      </div>

      <div>
        <p className="text-[10px] tracking-[0.18em] font-display font-bold text-mono-gray mb-1.5">
          EVIDENCE {typeof score === 'number' ? `· ${score}` : ''}
        </p>
        <div className="flex items-center gap-1" role="img" aria-label={`Evidence tier: ${tier ?? 'not assessed'}.`}>
          {TIERS.map((t, i) => (
            <span
              key={t}
              title={t}
              className={`h-2.5 w-10 ${i <= reached ? 'bg-mono-ink' : 'bg-mono-soft-white border border-mono-gray/30'}`}
            />
          ))}
          <span className="ml-2 text-[11px] font-display font-bold text-mono-black">{(tier ?? '—').toUpperCase()}</span>
        </div>
      </div>

      {works === 1 && (
        <p className="font-body text-[11px] text-mono-charcoal max-w-xs leading-relaxed">
          One scored work. This rates <em>the work</em>, not the brand&rsquo;s whole record.
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* EXHIBIT 07 — The Axis Ladder                                        */
/* ------------------------------------------------------------------ */

/**
 * The rubric made visible: all five levels for one axis, with the awarded level
 * marked and its definition shown inline.
 *
 * Methodology transparency is far more persuasive as a graphic beside the score
 * than as a link to a document. It converts "we gave this a 4" into "here is what
 * a 4 means, next to what a 3 and a 5 mean" — which is the difference between a
 * reader trusting us and a reader being able to check us.
 */
export function AxisLadder({ axis, level }: { axis: Axis; level: number }) {
  const levels = RUBRIC_LEVELS[axis];
  const weight = Math.round(AXIS_WEIGHTS[axis] * 100);
  return (
    <div className="border border-mono-gray/25 bg-mono-white p-4">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[11px] tracking-[0.2em] font-display font-bold text-mono-black">{axis}</span>
        <span className="text-[10px] font-display font-bold text-mono-gray tabular-nums">{weight}% weight</span>
      </div>
      <div className="mt-3 flex items-center gap-1" role="img" aria-label={`${axis} scored ${level} of 5.`}>
        {[1, 2, 3, 4, 5].map((l) => (
          <span
            key={l}
            className={`flex-1 h-4 ${
              l === level ? 'bg-mono-amber' : l < level ? 'bg-mono-ink' : 'bg-mono-soft-white border border-mono-gray/25'
            }`}
          />
        ))}
        <span className="ml-2 text-sm font-display font-bold text-mono-black tabular-nums">{level}/5</span>
      </div>
      <p className="mt-3 font-body text-[13px] text-mono-charcoal leading-relaxed">
        <span className="font-display font-bold text-mono-black">Level {level}:</span>{' '}
        {levels.find((x) => x.level === level)?.meaning}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* EXHIBIT 05 — The Work Scorecard                                     */
/* ------------------------------------------------------------------ */

/**
 * The atomic unit of a ratings product, composing exhibits 03, 04 and 01's band.
 * Every agency card carries the same elements: the score, the band, what the
 * score is made of, how much evidence sits behind it, and an as-of stamp.
 *
 * Deliberately shows the BAND and not a rank. With 34 distinct scores across 70
 * works, rank between tied works is arithmetic noise; band is the honest position.
 */
export function WorkScorecard({
  brand,
  title,
  score,
  levels,
  works,
  tier,
  evidenceScore,
  scoredOn,
  rubric,
}: {
  brand: string;
  title: string;
  score: number;
  levels: Record<string, number>;
  works: number;
  tier: 'Strong' | 'Moderate' | 'Developing' | null;
  evidenceScore?: number | null;
  scoredOn?: string;
  rubric: string;
}) {
  const band = signalBand(score);
  return (
    <div className="border border-mono-gray/25 bg-mono-white">
      <div className="flex items-start justify-between gap-5 p-5 border-b border-mono-gray/20">
        <div className="min-w-0">
          <p className="text-[10px] tracking-[0.2em] font-display font-bold text-mono-amber-strong truncate">
            {brand.toUpperCase()}
          </p>
          <p className="mt-1 font-display font-bold text-mono-black text-lg leading-snug">{title}</p>
        </div>
        <div className="shrink-0 text-right">
          <span className="block text-4xl font-display font-bold text-mono-black leading-none tabular-nums">{score}</span>
          <span className="mt-1.5 inline-block text-[10px] font-display font-bold tracking-[0.08em] border border-mono-black/25 px-1.5 py-0.5">
            {band?.band}
          </span>
        </div>
      </div>
      <div className="p-5 border-b border-mono-gray/20">
        <ContributionBar levels={levels} />
      </div>
      <div className="p-5 border-b border-mono-gray/20">
        <EvidenceRow works={works} tier={tier} score={evidenceScore ?? null} />
      </div>
      <p className="px-5 py-3 font-body text-[11px] text-mono-gray">
        Rubric {rubric}
        {scoredOn ? ` · scored ${scoredOn}` : ''} · {band?.label}
      </p>
    </div>
  );
}
