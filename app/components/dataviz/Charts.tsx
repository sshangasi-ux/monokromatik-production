// Brand-styled, dependency-free SVG data-viz for MonoKromatik's intelligence
// surfaces. Monochrome + amber per design-system/MASTER.md §10: accessible
// (role/aria-label, value labels — never colour alone), responsive, no heavy
// chart library. Pure components (no hooks) so they work in server components.

import type { ReactNode } from 'react';
import type { Exhibit } from '../../../lib/reports';

const AMBER = 'var(--mono-amber)';
const AMBER_STRONG = 'var(--mono-amber-strong)';
const CHARCOAL = 'var(--mono-charcoal)';
const GRAYFILL = 'rgba(102,102,102,0.18)';
const INK = 'var(--mono-ink)';

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

/* ── Extended exhibit library ─────────────────────────────────────────────
 * Every exhibit renders inside one shared card (ExFrame) so a bar, a curve, a
 * donut and a scorecard all read as one family. All dependency-free (CSS/SVG),
 * always on the light report surface. Data is real and cited in the note. */

function ExFrame({ title, note, ariaLabel, children }: { title: string; note?: string; ariaLabel: string; children: ReactNode }) {
  return (
    <figure role="img" aria-label={ariaLabel} className="not-prose bg-mono-soft-white border border-mono-gray/25 p-6 md:p-7">
      <figcaption className="mb-5">
        <p className="text-[10px] tracking-[0.24em] font-display font-bold text-mono-amber-strong">{title}</p>
        {note && <p className="mt-2 text-sm font-body text-mono-charcoal leading-relaxed">{note}</p>}
      </figcaption>
      {children}
    </figure>
  );
}

/** A value-over-time growth curve (area + line + emphasised endpoint). */
function LineChart({ ex }: { ex: Exhibit }) {
  const data = ex.data ?? [];
  const W = 680, H = 300, L = 46, R = 26, T = 22, B = 48;
  const pw = W - L - R, ph = H - T - B;
  const max = Math.max(...data.map((d) => d.value), 1);
  const n = data.length;
  const x = (i: number) => L + (n <= 1 ? pw / 2 : (i / (n - 1)) * pw);
  const y = (v: number) => T + (1 - v / max) * ph;
  const line = data.map((d, i) => `${x(i).toFixed(1)},${y(d.value).toFixed(1)}`).join(' ');
  const area = `${L},${T + ph} ${line} ${x(n - 1)},${T + ph}`;
  const grids = [0, 0.5, 1];
  return (
    <ExFrame title={ex.title} note={ex.note} ariaLabel={`${ex.title}: ${data.map((d) => `${d.label} ${d.display ?? d.value}`).join(', ')}`}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="presentation" style={{ display: 'block' }}>
        {grids.map((g) => (
          <line key={g} x1={L} x2={W - R} y1={T + g * ph} y2={T + g * ph} stroke="rgba(0,0,0,0.08)" strokeWidth={1} />
        ))}
        <polygon points={area} fill={AMBER} opacity={0.12} />
        <polyline points={line} fill="none" stroke={AMBER} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
        {data.map((d, i) => (
          <circle key={i} cx={x(i)} cy={y(d.value)} r={i === n - 1 ? 5.5 : 3} fill={i === n - 1 ? AMBER : CHARCOAL} />
        ))}
        {data.map((d, i) => (
          <text key={i} x={x(i)} y={H - 26} textAnchor="middle" fontFamily="var(--font-display)" fontWeight={700} fontSize={13} fill={CHARCOAL}>{d.label}</text>
        ))}
        {data[n - 1]?.display && (
          <text x={x(n - 1)} y={Math.max(y(max) + 4, y(data[n - 1].value) - 12)} textAnchor="end" fontFamily="var(--font-display)" fontWeight={700} fontSize={16} fill={AMBER}>{data[n - 1].display}</text>
        )}
      </svg>
    </ExFrame>
  );
}

/** One 100%-stacked share bar with a swatch legend. */
function SplitBar({ ex }: { ex: Exhibit }) {
  const data = ex.data ?? [];
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const fills = [AMBER, INK, 'rgba(102,102,102,0.55)'];
  return (
    <ExFrame title={ex.title} note={ex.note} ariaLabel={`${ex.title}: ${data.map((d) => `${d.label} ${d.display}`).join(', ')}`}>
      <div className="flex h-11 w-full overflow-hidden rounded-[1px]" aria-hidden="true">
        {data.map((d, i) => (
          <div key={d.label} className="flex items-center justify-center text-[12px] font-display font-bold tabular-nums" style={{ width: `${(d.value / total) * 100}%`, background: fills[i % fills.length], color: i === 0 ? '#000' : '#fff' }}>
            {d.display}
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2" aria-hidden="true">
        {data.map((d, i) => (
          <div key={d.label} className="flex items-center gap-2 text-[11px] font-display font-bold text-mono-charcoal">
            <span className="inline-block h-2.5 w-2.5" style={{ background: fills[i % fills.length] }} />
            {d.label}
          </div>
        ))}
      </div>
    </ExFrame>
  );
}

/** Scaled magnitude bars, each carrying a right-side "where value lands" tag. */
function ValueStack({ ex }: { ex: Exhibit }) {
  const data = ex.data ?? [];
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <ExFrame title={ex.title} note={ex.note} ariaLabel={`${ex.title}: ${data.map((d) => `${d.label} ${d.display}${d.tag ? ` (${d.tag})` : ''}`).join(', ')}`}>
      <div className="space-y-3.5" aria-hidden="true">
        {data.map((d) => (
          <div key={d.label}>
            <div className="flex items-baseline justify-between gap-3 mb-1.5">
              <span className="text-[12px] font-display font-bold text-mono-charcoal">{d.label}</span>
              {d.tag && <span className="text-[9.5px] tracking-[0.14em] font-display font-bold text-mono-amber-strong uppercase">{d.tag}</span>}
            </div>
            <div className="h-6 bg-mono-gray/15 overflow-hidden">
              <span className="flex h-full items-center justify-end bg-mono-amber px-2 text-[11px] font-display font-bold text-mono-black tabular-nums" style={{ width: `${Math.max(12, (d.value / max) * 100)}%` }}>
                {d.display}
              </span>
            </div>
          </div>
        ))}
      </div>
    </ExFrame>
  );
}

/** A single headline proportion as a ring. */
function Donut({ ex }: { ex: Exhibit }) {
  const v = Math.max(0, Math.min(100, ex.value ?? 0));
  const r = 56, c = 2 * Math.PI * r, cx = 90, cy = 90;
  return (
    <ExFrame title={ex.title} note={ex.note} ariaLabel={`${ex.title}: ${ex.valueLabel ?? v + '%'} ${ex.sublabel ?? ''}`}>
      <div className="flex items-center gap-7" aria-hidden="true">
        <svg viewBox="0 0 180 180" width={150} height={150} style={{ flex: 'none' }}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={GRAYFILL} strokeWidth={20} />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={AMBER} strokeWidth={20} strokeDasharray={`${(v / 100) * c} ${c}`} strokeLinecap="butt" transform={`rotate(-90 ${cx} ${cy})`} />
          <text x={cx} y={cy + 2} textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-feature)" fontWeight={700} fontSize={40} fill={AMBER}>{ex.valueLabel ?? `${v}%`}</text>
        </svg>
        {ex.sublabel && <p className="font-feature text-lg text-mono-ink leading-snug max-w-[16rem]">{ex.sublabel}</p>}
      </div>
    </ExFrame>
  );
}

/** A who-captures-value scorecard — rows scored 0–4 (empty→full) across columns. */
function ScoreMatrix({ ex }: { ex: Exhibit }) {
  const cols = ex.cols ?? [];
  const rows = ex.rows ?? [];
  const ball = (lvl: number, key: string) => {
    const r = 8, c = 2 * Math.PI * r;
    return (
      <svg key={key} viewBox="0 0 22 22" width={20} height={20} aria-hidden="true">
        <circle cx={11} cy={11} r={r} fill="none" stroke="rgba(102,102,102,0.45)" strokeWidth={2.5} />
        <circle cx={11} cy={11} r={r} fill="none" stroke={AMBER} strokeWidth={5} strokeDasharray={`${(Math.max(0, Math.min(4, lvl)) / 4) * c} ${c}`} transform="rotate(-90 11 11)" />
      </svg>
    );
  };
  return (
    <ExFrame title={ex.title} note={ex.note} ariaLabel={`${ex.title}: ${rows.map((r) => `${r.label} — ${cols.map((c, i) => `${c} ${r.cells[i]}/4`).join(', ')}`).join('; ')}`}>
      <div className="overflow-x-auto" aria-hidden="true">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr>
              <th className="pb-2" />
              {cols.map((c) => (
                <th key={c} className="pb-2 px-1 text-center text-[9.5px] tracking-[0.1em] font-display font-bold text-mono-charcoal uppercase">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-t border-mono-gray/20">
                <td className="py-2.5 pr-3">
                  <span className="block text-[12px] font-display font-bold text-mono-ink">{row.label}</span>
                  {row.tag && <span className="block text-[9.5px] tracking-[0.12em] font-display font-bold text-mono-amber-strong uppercase mt-0.5">{row.tag}</span>}
                </td>
                {cols.map((c, i) => (
                  <td key={c} className="py-2.5 text-center"><div className="flex justify-center">{ball(row.cells[i] ?? 0, c)}</div></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[10px] tracking-[0.08em] font-display text-mono-gray uppercase">○ none · ◐ partial · ● full ownership / capture</p>
    </ExFrame>
  );
}

/** A 2×2 positioning map with plotted, labelled points. */
function Quadrant({ ex }: { ex: Exhibit }) {
  const pts = ex.points ?? [];
  const [xL, xR] = ex.xAxis ?? ['', ''];
  const [yB, yT] = ex.yAxis ?? ['', ''];
  const W = 560, H = 470, L = 30, Rr = 30, T = 34, B = 44;
  const pw = W - L - Rr, ph = H - T - B;
  const px = (x: number) => L + (x / 100) * pw;
  const py = (y: number) => T + (1 - y / 100) * ph;
  return (
    <ExFrame title={ex.title} note={ex.note} ariaLabel={`${ex.title}: ${pts.map((p) => p.label).join(', ')}`}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="presentation" style={{ display: 'block' }}>
        <rect x={L} y={T} width={pw} height={ph} fill="rgba(0,0,0,0.02)" stroke="rgba(0,0,0,0.12)" strokeWidth={1} />
        <line x1={L + pw / 2} y1={T} x2={L + pw / 2} y2={T + ph} stroke="rgba(0,0,0,0.14)" strokeDasharray="4 4" />
        <line x1={L} y1={T + ph / 2} x2={L + pw} y2={T + ph / 2} stroke="rgba(0,0,0,0.14)" strokeDasharray="4 4" />
        <text x={L} y={T + ph + 26} fontFamily="var(--font-display)" fontWeight={700} fontSize={11} fill={CHARCOAL}>{xL}</text>
        <text x={L + pw} y={T + ph + 26} textAnchor="end" fontFamily="var(--font-display)" fontWeight={700} fontSize={11} fill={CHARCOAL}>{xR}</text>
        <text x={L + 2} y={T + ph - 6} fontFamily="var(--font-display)" fontWeight={700} fontSize={11} fill={CHARCOAL}>{yB}</text>
        <text x={L + 2} y={T + 14} fontFamily="var(--font-display)" fontWeight={700} fontSize={11} fill={CHARCOAL}>{yT}</text>
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={px(p.x)} cy={py(p.y)} r={p.highlight ? 8 : 5.5} fill={p.highlight ? AMBER : CHARCOAL} />
            <text x={px(p.x)} y={py(p.y) - 12} textAnchor="middle" fontFamily="var(--font-display)" fontWeight={700} fontSize={12.5} fill={p.highlight ? AMBER_STRONG : INK}>{p.label}</text>
          </g>
        ))}
      </svg>
    </ExFrame>
  );
}

/** Dispatcher — renders any exhibit by its `type` (defaults to the bar chart). */
export function ReportExhibit({ exhibit }: { exhibit: Exhibit }) {
  switch (exhibit.type) {
    case 'line': return <LineChart ex={exhibit} />;
    case 'split': return <SplitBar ex={exhibit} />;
    case 'stack': return <ValueStack ex={exhibit} />;
    case 'donut': return <Donut ex={exhibit} />;
    case 'matrix': return <ScoreMatrix ex={exhibit} />;
    case 'quadrant': return <Quadrant ex={exhibit} />;
    case 'bar':
    default:
      return <BarChart title={exhibit.title} note={exhibit.note} data={exhibit.data ?? []} />;
  }
}
