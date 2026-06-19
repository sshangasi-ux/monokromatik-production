// Data layer for the Intelligence tier's Issues — the curated magazine editions.
// Mirrors lib/articles.ts / lib/case-studies.ts / lib/reports.ts: a JSON file is
// the source of truth, this module is the typed accessor surface.
//
// Scope note: this models the issue CATALOGUE and each issue's table of contents
// (its feature manifest), NOT the feature bodies. The feature pages under
// app/issues/<n>/<slug>/ are bespoke, heterogeneous editorial layouts (a
// six-dimension case study, a four-signal briefing, relevance tests, a
// commission brief) and stay as hand-built components — the manifest just points
// at their routes. Adding Issue 002/003 and their features becomes data, not new
// hardcoded index pages.

import issuesData from '../data/issues.json';

export type IssueStatus = 'live' | 'in-development';

/** A reference to a feature within an issue's table of contents. */
export interface IssueFeatureRef {
  franchise: string;
  title: string;
  description: string;
  href: string;
  status: string;
  /** lucide-react icon name, mapped to a component at render time. */
  icon?: string;
}

export interface Issue {
  /** Display number, e.g. "001". Also the route segment under /issues. */
  number: string;
  title: string;
  /** Edition descriptor, e.g. "Founding Issue". */
  focus: string;
  /** One-line contents summary for the catalogue card. */
  contents: string;
  status: IssueStatus;
  publishedAt?: string;
  features: IssueFeatureRef[];
}

const issues = issuesData as Issue[];

const STATUS_ORDER: Record<IssueStatus, number> = { live: 0, 'in-development': 1 };

/** Every issue, live first then in-development, ascending number within each. */
export function getAllIssues(): Issue[] {
  return [...issues].sort(
    (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || a.number.localeCompare(b.number)
  );
}

/** A single issue by its display number ("001"), or undefined. */
export function getIssueByNumber(number: string): Issue | undefined {
  return issues.find((i) => i.number === number);
}

/** Published, readable issues. */
export function getLiveIssues(): Issue[] {
  return getAllIssues().filter((i) => i.status === 'live');
}

/** The route for an issue's contents page — only meaningful once live. */
export function issueHref(issue: Issue): string | undefined {
  return issue.status === 'live' ? `/issues/${issue.number}` : undefined;
}
