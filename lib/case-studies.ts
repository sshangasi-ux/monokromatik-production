// Data layer for the Intelligence tier's Case Studies — the structured,
// source-led decode of a brand/creative move across MonoKromatik's six
// dimensions (Context / Strategic Bet / Creative Move / Evidence / African
// Read / Lesson), plus the four-axis decode matrix.
//
// Mirrors lib/articles.ts deliberately: a JSON file is the source of truth,
// this module is the typed accessor surface. The access layer below is the
// seam for the future premium/monetised tier — case studies are PUBLIC today,
// but getPublicCaseStudies()/isLocked() let gating switch on later with no
// caller changes (see the Intelligence "monetises" strategic spine).

import caseStudiesData from '../data/case-studies.json';

/** Editorial confidence in the analysis, same vocabulary as Article.brandRead. */
export type Verification = 'verified' | 'partial' | 'interpretive';

/** Access tier — the gating hook. Everything is 'public' for now. */
export type CaseStudyAccess = 'public' | 'premium';

/** One axis of the four-dimension decode matrix (idea/authorship/etc.). */
export interface CaseStudyDecode {
  label: string;
  level: 1 | 2 | 3 | 4 | 5;
  note: string;
}

/** A cited source in the case-study ledger. */
export interface CaseStudySource {
  publisher: string;
  label: string;
  href: string;
  use: string;
}

/** A credited media asset (hero/quote imagery). */
export interface CaseStudyMedia {
  src: string;
  alt: string;
  caption?: string;
  credit: string;
  sourceLabel?: string;
  sourceHref?: string;
}

/** The evidence ledger — what's confirmed vs reported vs deliberately not claimed. */
export interface CaseStudyEvidence {
  confirmed: string[];
  reported: string[];
  notClaimed: string[];
}

/** A single brand-builder lesson: a bold lede + its body. */
export interface CaseStudyLesson {
  title: string;
  body: string;
}

export interface CaseStudy {
  slug: string;
  title: string;
  standfirst: string;
  brand: string;
  collection: string;
  market: string;
  readingTime?: string;
  access: CaseStudyAccess;
  verification: Verification;
  verificationNote?: string;
  publishedAt: string;
  tags?: string[];
  decode: CaseStudyDecode[];
  /** The scoring rubric this decode was set under (docs/SCORING-RUBRIC.md).
   *  Scores are versioned, not permanent — re-scoring under a new rubric is a
   *  disclosed methodology change, never a silent edit. */
  rubricVersion?: string;
  /** ISO date the decode was last set/reviewed. */
  scoredOn?: string;
  // The six-dimension analysis — each is an array of paragraphs.
  context: string[];
  strategicBet: string[];
  creativeMove: string[];
  africanRead: string[];
  evidence: CaseStudyEvidence;
  lessons: CaseStudyLesson[];
  pullQuotes?: string[];
  sources: CaseStudySource[];
  media: CaseStudyMedia[];
  /** Optional supporting video embed (same shape as Article) — a sourced clip
   *  that enriches the decode. Rendered by CaseStudyFeature. */
  videoUrl?: string;
  videoType?: 'youtube' | 'vimeo' | 'file';
  videoCredit?: string;
  videoSourceUrl?: string;
  /** Optional cross-link to a related surface (e.g. the issue it also runs in). */
  related?: { label: string; href: string };
}

const caseStudies = caseStudiesData as CaseStudy[];

/** Every case study, newest first. */
export function getAllCaseStudies(): CaseStudy[] {
  return [...caseStudies].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

/** A single case study by slug, or undefined. */
export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return caseStudies.find((c) => c.slug === slug);
}

/** Case studies in a named collection, newest first. */
export function getCaseStudiesByCollection(collection: string, limit?: number): CaseStudy[] {
  const list = getAllCaseStudies().filter(
    (c) => c.collection.toLowerCase() === collection.toLowerCase()
  );
  return typeof limit === 'number' ? list.slice(0, limit) : list;
}

// ---------- Access / gating seam (premium tier, not yet enabled) ----------

/** True when a case study is behind the (future) premium tier. */
export function isLocked(c: CaseStudy): boolean {
  return c.access === 'premium';
}

/** Case studies safe to render in full to anyone. Today this is all of them. */
export function getPublicCaseStudies(): CaseStudy[] {
  return getAllCaseStudies().filter((c) => !isLocked(c));
}
