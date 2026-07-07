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
  /** One optional bar-chart exhibit built strictly from real, sourced data. */
  exhibit?: {
    title: string;
    note?: string;
    data: { label: string; value: number; display: string }[];
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
