// Brand-styled, dependency-free SVG data-viz for MonoKromatik's intelligence
// surfaces. Monochrome + amber per design-system/MASTER.md §10: accessible
// (role/aria-label, value labels — never colour alone), responsive, no heavy
// chart library. Pure components (no hooks) so they work in server components.

const AMBER = 'var(--mono-amber)';
const AMBER_STRONG = 'var(--mono-amber-strong)';

/** Editorial signal-strength meter (1–5 ascending bars). */
export function SignalStrength({
  level,
  label,
  caption,
  tone = 'dark',
}: {
  level: 1 | 2 | 3 | 4 | 5;
  label?: string;
  caption?: string;
  tone?: 'dark' | 'light';
}) {
  const onDark = tone === 'dark';
  const empty = onDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)';
  return (
    <figure
      role="img"
      aria-label={`Signal strength ${level} of 5${label ? ` — ${label}` : ''}`}
      className="inline-flex flex-col gap-2"
    >
      <div className="flex items-end gap-1.5" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className="w-2.5 rounded-[1px] transition-[height]"
            style={{ height: `${8 + i * 5}px`, backgroundColor: i <= level ? AMBER : empty }}
          />
        ))}
        <span
          className={`ml-2 font-display font-bold text-sm ${onDark ? 'text-mono-white' : 'text-mono-black'}`}
        >
          {level}/5
        </span>
      </div>
      {label && (
        <figcaption className="text-[10px] tracking-[0.22em] font-display font-bold text-mono-amber">
          {label}
        </figcaption>
      )}
      {caption && (
        <span className={`text-[11px] font-body ${onDark ? 'text-mono-gray' : 'text-mono-gray'}`}>{caption}</span>
      )}
    </figure>
  );
}

const GAUGE_BANDS = { Emerging: 0.4, Moderate: 0.68, Strong: 0.92 } as const;
type Band = keyof typeof GAUGE_BANDS;

/** Semicircular editorial-assessment gauge (qualitative band, no fabricated score). */
export function RelevanceGauge({
  band,
  title,
  note,
}: {
  band: Band;
  title: string;
  note?: string;
}) {
  const frac = GAUGE_BANDS[band];
  const r = 80;
  const cx = 100;
  const cy = 100;
  // semicircle from 180° (left) to 0° (right)
  const polar = (t: number) => {
    const a = Math.PI * (1 - t);
    return [cx + r * Math.cos(a), cy - r * Math.sin(a)];
  };
  const [sx, sy] = polar(0);
  const [ex, ey] = polar(frac);
  const [bx, by] = polar(1);
  const large = frac > 0.5 ? 1 : 0;
  return (
    <figure
      role="img"
      aria-label={`Monokromatik editorial relevance read: ${band} — ${title}`}
      className="bg-mono-soft-white border border-mono-gray/25 p-6"
    >
      <p className="text-[10px] tracking-[0.24em] font-display font-bold text-mono-amber-strong mb-4">
        EDITORIAL RELEVANCE READ
      </p>
      <svg viewBox="0 0 200 120" className="w-full max-w-[260px]">
        <path d={`M ${sx} ${sy} A ${r} ${r} 0 0 1 ${bx} ${by}`} fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="14" strokeLinecap="round" />
        <path d={`M ${sx} ${sy} A ${r} ${r} 0 ${large} 1 ${ex} ${ey}`} fill="none" stroke={AMBER} strokeWidth="14" strokeLinecap="round" />
        <text x={cx} y={cy - 8} textAnchor="middle" className="font-display" style={{ fontWeight: 700, fontSize: 24, fill: 'var(--mono-black)' }}>
          {band}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" style={{ fontSize: 9, letterSpacing: 2, fill: 'var(--mono-gray)' }}>
          FIT
        </text>
      </svg>
      <p className="mt-2 font-display font-bold text-lg text-mono-black leading-snug">{title}</p>
      {note && <p className="mt-2 text-sm font-body text-mono-charcoal leading-relaxed">{note}</p>}
    </figure>
  );
}

/** Row of factual stat callouts (big amber figures). */
export function StatStrip({
  items,
  tone = 'light',
}: {
  items: { value: string; label: string }[];
  tone?: 'dark' | 'light';
}) {
  const onDark = tone === 'dark';
  const cols =
    ({ 2: 'md:grid-cols-2', 3: 'md:grid-cols-3', 4: 'md:grid-cols-4' } as Record<number, string>)[
      Math.min(items.length, 4)
    ] || 'md:grid-cols-4';
  return (
    <dl className={`grid grid-cols-2 ${cols} gap-px border ${onDark ? 'border-mono-white/15 bg-mono-white/15' : 'border-mono-gray/25 bg-mono-gray/25'}`}>
      {items.map((it) => (
        <div key={it.label} className={`${onDark ? 'bg-mono-black' : 'bg-mono-white'} p-6`}>
          <dd className="font-display font-bold text-3xl md:text-4xl text-mono-amber tabular-nums">{it.value}</dd>
          <dt className={`mt-2 text-[11px] tracking-[0.16em] font-display font-bold ${onDark ? 'text-mono-gray' : 'text-mono-charcoal'}`}>
            {it.label.toUpperCase()}
          </dt>
        </div>
      ))}
    </dl>
  );
}

/**
 * The Cultural-Signal Index scorecard — a rating-box treatment of a "Will It
 * Land?" dossier's predictive read: the weighted composite plus four axis bars
 * (0–100). Authorship (the moat, .35) is highlighted. Judgement, not a metric.
 */
export function IndexScorecard({
  scores,
}: {
  scores: {
    idea: number;
    authorship: number;
    execution: number;
    consequence: number;
    composite: number;
    verdict: string;
  };
}) {
  const rows = [
    { label: 'IDEA', weight: '×.25', v: scores.idea },
    { label: 'AUTHORSHIP', weight: '×.35', v: scores.authorship, moat: true },
    { label: 'EXECUTION', weight: '×.15', v: scores.execution },
    { label: 'CONSEQUENCE', weight: '×.25', v: scores.consequence },
  ];
  const clamp = (n: number) => Math.max(0, Math.min(100, n));
  return (
    <figure
      role="img"
      aria-label={`Cultural-Signal Index predictive read: composite ${scores.composite} of 100. Idea ${scores.idea}, Authorship ${scores.authorship}, Execution ${scores.execution}, Consequence ${scores.consequence}.`}
      className="not-prose bg-mono-black text-mono-white border border-mono-amber/40 p-7 md:p-9"
    >
      <div className="flex items-start justify-between gap-6 border-b border-mono-white/15 pb-6 mb-6">
        <div>
          <p className="text-[10px] tracking-[0.26em] font-display font-bold text-mono-amber mb-3">
            CULTURAL-SIGNAL INDEX · PREDICTIVE READ
          </p>
          <p className="text-sm font-body text-mono-gray max-w-xs leading-relaxed">
            Authorship-weighted analytical projection across four axes — MonoKromatik&rsquo;s judgement, not a
            measured metric.
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className="font-display font-bold text-6xl md:text-7xl text-mono-amber tabular-nums leading-none">
            {scores.composite}
          </div>
          <div className="text-[10px] tracking-[0.2em] font-display font-bold text-mono-gray mt-2">/ 100 COMPOSITE</div>
        </div>
      </div>
      <div className="space-y-4" aria-hidden="true">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-4">
            <div className="w-36 md:w-44 shrink-0 flex items-baseline gap-2">
              <span
                className={`text-[11px] tracking-[0.14em] font-display font-bold ${r.moat ? 'text-mono-amber' : 'text-mono-white'}`}
              >
                {r.label}
              </span>
              <span className="text-[10px] font-display text-mono-gray tabular-nums">{r.weight}</span>
            </div>
            <div className="flex-1 h-2.5 bg-mono-white/12 rounded-[1px] overflow-hidden">
              <span className="block h-full rounded-[1px] bg-mono-amber" style={{ width: `${clamp(r.v)}%` }} />
            </div>
            <span className="w-9 text-right font-display font-bold text-sm tabular-nums text-mono-white">{r.v}</span>
          </div>
        ))}
      </div>
      {scores.verdict && (
        <div className="mt-7 pt-6 border-t border-mono-white/15">
          <p className="text-[10px] tracking-[0.24em] font-display font-bold text-mono-amber mb-3">THE VERDICT</p>
          <p className="font-feature text-lg md:text-xl text-mono-soft-white leading-snug">{scores.verdict}</p>
        </div>
      )}
    </figure>
  );
}

/** A dependency-free horizontal bar chart built strictly from real, sourced data. */
export function BarChart({
  title,
  note,
  data,
}: {
  title: string;
  note?: string;
  data: { label: string; value: number; display: string }[];
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <figure
      role="img"
      aria-label={`${title}: ${data.map((d) => `${d.label} ${d.display}`).join(', ')}`}
      className="not-prose bg-mono-soft-white border border-mono-gray/25 p-6 md:p-7"
    >
      <figcaption className="mb-5">
        <p className="text-[10px] tracking-[0.24em] font-display font-bold text-mono-amber-strong">{title}</p>
        {note && <p className="mt-2 text-sm font-body text-mono-charcoal leading-relaxed">{note}</p>}
      </figcaption>
      <div className="space-y-3" aria-hidden="true">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-[11px] font-display font-bold text-mono-charcoal tabular-nums">
              {d.label}
            </span>
            <div className="flex-1 h-7 bg-mono-gray/15 overflow-hidden">
              <span
                className="flex h-full items-center justify-end bg-mono-amber px-2 text-[11px] font-display font-bold text-mono-black tabular-nums"
                style={{ width: `${Math.max(9, (d.value / max) * 100)}%` }}
              >
                {d.display}
              </span>
            </div>
          </div>
        ))}
      </div>
    </figure>
  );
}
