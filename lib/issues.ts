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
  /**
   * In-development issues are normally not linkable. Set `preview: true` to give
   * an in-development edition a readable PREVIEW page (its planned slate + cover)
   * so the roadmap is public before the features are written.
   */
  preview?: boolean;
  features: IssueFeatureRef[];
  /**
   * The art-directed cover. `image` is the drop-in slot for commissioned or
   * AI-base art (replaceable per issue). When absent, IssueCover renders its
   * designed type-only fallback. `accent` is the per-issue secondary colour.
   */
  cover?: {
    /** Web-optimised cover art (webp/avif). The slot the site renders. */
    image?: string;
    imageCredit?: string;
    /** Per-issue accent (CSS colour). Defaults to brand amber when unset. */
    accent?: string;
    /**
     * Cover tone. 'light' renders the lockup ink-on-bone (for warm/bright cover
     * art); 'dark' (default) renders white-on-ink for dark art or the fallback.
     */
    tone?: 'light' | 'dark';
    /**
     * When true, `image` is a fully-composed cover (masthead, title and
     * coverlines already baked into the art). IssueCover then shows it whole —
     * no overlaid type lockup — keeping only the action buttons and an
     * accessible heading.
     */
    composed?: boolean;
    /** Cover blurbs, set like a magazine's coverlines. */
    coverlines?: string[];
    /** The cover dek / sell line under the title. */
    dek?: string;
    /**
     * Print-collectible master assets. Set only once print-resolution art
     * exists; the site never serves these (they're for the run / downloads).
     * See docs/ISSUE_COVER_ART_DIRECTION_AND_PRINT_PIPELINE.md for the spec.
     */
    print?: {
      /** ≥300dpi flattened master at trim+bleed (e.g. a TIFF or layered source). */
      master?: string;
      /** Press-ready export for the run (CMYK PDF/X or TIFF). */
      pressReady?: string;
      /** Effective resolution at trim, in dpi. Target ≥ 300. */
      dpi?: number;
      /** Trim size, e.g. "210×297mm" (A4 portrait). */
      trim?: string;
      /** Bleed per edge, e.g. "3mm". */
      bleed?: string;
      /** Working colour space for the press file. */
      colorSpace?: 'CMYK' | 'sRGB' | 'AdobeRGB';
    };
  };
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

/** The route for an issue's contents page — live editions, or previewable ones. */
export function issueHref(issue: Issue): string | undefined {
  return issue.status === 'live' || issue.preview ? `/issues/${issue.number}` : undefined;
}
