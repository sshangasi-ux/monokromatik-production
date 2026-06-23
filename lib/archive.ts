// The MonoKromatik Archive — one unified, searchable, filterable index over every
// published thing on the network: Signal Brand Reads, Intelligence case studies,
// Reports, Issues and Culture articles. Each content type already has its own list
// page; the archive is the single back-of-house catalogue that cuts across all of
// them by date, kind, theme and Cultural-Signal score.
//
// This is a pure aggregation layer over the existing loaders — no new data source.

import { getAllArticles } from './articles';
import { getAllCaseStudies, isLocked as caseLocked } from './case-studies';
import { getAllReports, isLocked as reportLocked } from './reports';
import { getAllIssues, issueHref } from './issues';
import { compositeScore } from './signal-index';

/** The sections an archive entry can belong to (mirrors the site's lanes). */
export type ArchiveKind =
  | 'Signal'
  | 'Intelligence'
  | 'Report'
  | 'Issue'
  | 'Culture';

export interface ArchiveEntry {
  /** Stable, type-prefixed id, e.g. "cs:nike-air-afrique". */
  id: string;
  kind: ArchiveKind;
  title: string;
  /** One-line description for the row. */
  summary: string;
  /** Canonical route, or undefined if the item isn't live yet (in-development). */
  href?: string;
  /** ISO date string, or undefined for unscheduled/in-development items. */
  date?: string;
  /** Lowercased searchable terms (tags + brand/series/market/source). */
  tags: string[];
  /** Short contextual label shown next to the row (brand, series, source…). */
  meta?: string;
  /** Cultural-Signal composite /100, when the item is scored. */
  score?: number;
  /** True when the item sits behind the membership/premium tier. */
  premium?: boolean;
  /** True when the item exists but isn't published yet. */
  forthcoming?: boolean;
}

function lc(parts: (string | undefined)[]): string[] {
  return parts
    .filter((p): p is string => Boolean(p))
    .flatMap((p) => p.split(/[\s,/]+/))
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Build the full archive, newest first. Items without a date (in-development
 * issues/reports) sort to the end, after everything dated.
 */
export function buildArchive(): ArchiveEntry[] {
  const entries: ArchiveEntry[] = [];

  // Articles split into Signal (carry a Brand Read) vs Culture (everything else).
  for (const a of getAllArticles()) {
    const isSignal = Boolean(a.brandRead?.take);
    entries.push({
      id: `art:${a.slug}`,
      kind: isSignal ? 'Signal' : 'Culture',
      title: a.title,
      summary: a.excerpt,
      href: `/article/${a.slug}`,
      date: a.publishedAt,
      tags: [...(a.tags ?? []), ...lc([a.category, a.sourceName])],
      meta: a.sourceName,
    });
  }

  // Intelligence case studies — scored, sometimes premium.
  for (const c of getAllCaseStudies()) {
    entries.push({
      id: `cs:${c.slug}`,
      kind: 'Intelligence',
      title: c.title,
      summary: c.standfirst,
      href: `/intelligence/case-studies/${c.slug}`,
      date: c.publishedAt,
      tags: [...(c.tags ?? []), ...lc([c.brand, c.collection, c.market])],
      meta: c.brand,
      score: compositeScore(c.decode) ?? undefined,
      premium: caseLocked(c),
    });
  }

  // Reports — only the live ones have a route; others are catalogued as forthcoming.
  for (const r of getAllReports()) {
    const live = r.status === 'live';
    entries.push({
      id: `rp:${r.slug}`,
      kind: 'Report',
      title: r.title,
      summary: r.summary,
      href: live ? `/reports/${r.slug}` : undefined,
      date: r.publishedAt,
      tags: [...(r.tags ?? []), ...lc([r.series, r.status])],
      meta: r.series,
      premium: reportLocked(r),
      forthcoming: !live,
    });
  }

  // Issues — numbered editions; route exists once live.
  for (const i of getAllIssues()) {
    const live = i.status === 'live';
    entries.push({
      id: `is:${i.number}`,
      kind: 'Issue',
      title: `Issue ${i.number} — ${i.title}`,
      summary: i.focus || i.contents,
      href: issueHref(i),
      date: i.publishedAt,
      tags: lc([i.focus, i.status, ...i.features.map((f) => f.franchise)]),
      meta: i.focus,
      forthcoming: !live,
    });
  }

  return sortArchive(entries, 'newest');
}

export type ArchiveSort = 'newest' | 'oldest' | 'score';

export function sortArchive(entries: ArchiveEntry[], sort: ArchiveSort): ArchiveEntry[] {
  const time = (e: ArchiveEntry) => (e.date ? new Date(e.date).getTime() : null);
  const list = [...entries];
  if (sort === 'score') {
    list.sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
    return list;
  }
  list.sort((a, b) => {
    const ta = time(a);
    const tb = time(b);
    if (ta === null && tb === null) return 0;
    if (ta === null) return 1; // undated last
    if (tb === null) return -1;
    return sort === 'newest' ? tb - ta : ta - tb;
  });
  return list;
}

/** Distinct years present in the archive, newest first (for the year facet). */
export function archiveYears(entries: ArchiveEntry[]): string[] {
  const years = new Set<string>();
  for (const e of entries) if (e.date) years.add(e.date.slice(0, 4));
  return [...years].sort().reverse();
}

export const ARCHIVE_KINDS: ArchiveKind[] = [
  'Signal',
  'Intelligence',
  'Report',
  'Issue',
  'Culture',
];
