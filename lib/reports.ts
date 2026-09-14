// Data layer for the Intelligence tier's Reports — designed briefings, dossiers
// and collectible editions. Mirrors lib/case-studies.ts and lib/articles.ts:
// a JSON file is the source of truth, this module is the typed accessor surface.
//
// Reports carry a `status` (the commissioning lifecycle) and an `access` tier
// that maps to the product ladder on the page — Open Signal Briefings (open),
// Premium Reports (premium), Partner Editions (partner). The access helpers are
// the seam for the monetised tier: isLocked()/getOpenReports() let gating switch
// on later with no caller changes. Nothing is `live` yet, so no detail bodies
// are invented here — records describe the slate honestly until real research
// is completed.

import reportsData from '../data/reports.json';

/** Commissioning lifecycle of a report. */
export type ReportStatus = 'live' | 'in-development' | 'planned';

/** Access tier — maps to the product ladder. The gating hook. */
export type ReportAccess = 'open' | 'premium' | 'partner';

/** A single point in a data-driven exhibit. `tag` is an optional right-side
 *  qualifier used by the value-stack ("foreign-mediated", "leaky", …). */
export interface ExhibitDatum {
  label: string;
  value: number;
  display: string;
  tag?: string;
}

/**
 * A designed, sourced exhibit. `type` selects the visual form; every type stays
 * dependency-free (CSS/SVG) and reads its numbers from real, cited data. When
 * `type` is omitted it renders as a horizontal bar chart (back-compat).
 *   bar      — horizontal bars (default)                 → data[]
 *   line     — a value-over-time growth curve            → data[] (label = x tick)
 *   split    — one 100%-stacked share bar                → data[] (values are shares)
 *   stack    — scaled magnitude bars with a landing tag  → data[] (+ datum.tag)
 *   donut    — a single headline proportion              → value + valueLabel + sublabel
 *   matrix   — a who-captures-value scorecard (0–4 balls)→ cols[] + rows[]
 *   quadrant — a 2×2 positioning map                     → xAxis + yAxis + points[]
 */
export interface Exhibit {
  title: string;
  note?: string;
  type?: 'bar' | 'line' | 'split' | 'stack' | 'donut' | 'matrix' | 'quadrant';
  /** PDF-only placement hint: render this exhibit after the section at this
   *  1-based index (the interleaved consultancy layout). The on-site report
   *  ignores it and shows every exhibit in the visual block above the gate. */
  after?: number;
  data?: ExhibitDatum[];
  /** line: unit shown on the axis caption, e.g. "streams (bn)". */
  unit?: string;
  /** donut: the headline proportion (0–100) and its labels. */
  value?: number;
  valueLabel?: string;
  sublabel?: string;
  /** matrix: column headers + scored rows (cells 0–4 = empty→full Harvey ball). */
  cols?: string[];
  rows?: { label: string; tag?: string; cells: number[] }[];
  /** quadrant: axis end-labels [start, end] and plotted points (x,y in 0–100). */
  xAxis?: [string, string];
  yAxis?: [string, string];
  points?: { label: string; x: number; y: number; highlight?: boolean }[];
}

export interface Report {
  slug: string;
  title: string;
  /** The franchise line, e.g. "FOUNDING REPORT", "MARKET BRIEFING". */
  series: string;
  status: ReportStatus;
  access: ReportAccess;
  summary: string;
  tags: string[];
  /** Human-readable status detail, e.g. "Issue 001 development". */
  statusNote?: string;
  /** Set once status === 'live'. */
  publishedAt?: string;
  /** Long-form body — present only once a report is written (status 'live'). */
  sections?: { heading: string; paragraphs: string[] }[];
  /**
   * The predictive Cultural-Signal Index read (0–100 per axis + weighted
   * composite) for "Will It Land?" dossiers. Rendered as a scorecard — the
   * authorship-weighted verdict, not a measured metric.
   */
  index?: {
    idea: number;
    authorship: number;
    execution: number;
    consequence: number;
    composite: number;
    verdict: string;
  };
  /** Key figures shown as a stat strip beneath the standfirst. */
  keyStats?: { value: string; label: string }[];
  /** The primary exhibit — a designed, sourced data cut. Defaults to a bar chart
   *  when `type` is omitted (back-compat). */
  exhibit?: Exhibit;
  /** Additional exhibits — same shape as `exhibit` — for flagship pieces that
   *  carry more than one designed, sourced data cut. */
  exhibits?: Exhibit[];
  /**
   * The counter-case — the "Bear Case / Room for Disagreement" module. A visible,
   * first-class part of every paid piece: the strongest arguments against our own
   * read, stated plainly. Borrowed from transparent-epistemics newsrooms — it is
   * what makes a demanding reader trust the rest of the analysis, because we
   * pre-empt their objection on the page rather than hiding it.
   */
  counterCase?: {
    /** Defaults to "THE BEAR CASE" when omitted. */
    heading?: string;
    /** One short standfirst framing why the counter-case matters here. */
    intro?: string;
    /** The individual counter-arguments, each a full point. */
    points: string[];
  };
}

const reports = reportsData as Report[];

const STATUS_ORDER: Record<ReportStatus, number> = { live: 0, 'in-development': 1, planned: 2 };

/** Every report, most-progressed first (live → in-development → planned). */
export function getAllReports(): Report[] {
  return [...reports].sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
}

/** A single report by slug, or undefined. */
export function getReportBySlug(slug: string): Report | undefined {
  return reports.find((r) => r.slug === slug);
}

/** Reports at a given lifecycle status. */
export function getReportsByStatus(status: ReportStatus): Report[] {
  return getAllReports().filter((r) => r.status === status);
}

/** Published, readable reports. Empty until the first edition ships. */
export function getLiveReports(): Report[] {
  return getReportsByStatus('live');
}

// ---------- Access / gating seam (premium + partner tiers) ----------

/** True when a report sits behind the premium or partner tier. */
export function isLocked(r: Report): boolean {
  return r.access !== 'open';
}

/** Reports free to read in full. */
export function getOpenReports(): Report[] {
  return getAllReports().filter((r) => !isLocked(r));
}
