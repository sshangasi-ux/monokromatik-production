// MonoKromatik — Case Study data model.
//
// A case study is a research-grade intelligence piece in one of the brand's
// competencies (The Work / Will It Land? / Intelligence). It is deliberately
// structured so facts stay separable from MonoKromatik interpretation, every
// claim is anchored to a credited source, and the four-dimension "decode"
// expresses judgement (not a fabricated score). This is the shape the generator
// (lib/generate-case-study.ts) emits and the renderer
// (app/issues/case-study/[slug]/page.tsx) consumes.

export type Competency = 'THE WORK' | 'WILL IT LAND' | 'INTELLIGENCE';

export type EvidenceStandard =
  | 'SOURCE-LED ANALYSIS'
  | 'EDITORIAL ESSAY'
  | 'COMMISSIONING BRIEF'
  | 'SIGNAL BRIEFING';

/** One axis of the editorial decode. Level is judgement, 1 (weak) – 5 (strong). */
export interface DecodeDimension {
  label: 'IDEA' | 'AUTHORSHIP' | 'EXECUTION' | 'CONSEQUENCE';
  level: 1 | 2 | 3 | 4 | 5;
  note: string;
}

export interface CaseStudySource {
  publisher: string;
  label: string;
  href: string;
  /** Why this source is used — what it does and does not substantiate. */
  use: string;
}

export interface CaseStudySection {
  title: string;
  /** Markdown-light paragraphs; rendered in order. */
  paragraphs: string[];
}

/** Keeps the brand's promise: confirmed vs reported vs explicitly-not-claimed. */
export interface VerificationLedger {
  confirmed: string[];
  reported: string[];
  notClaimed: string[];
}

export interface CaseStudy {
  slug: string;
  competency: Competency;
  /** Display franchise line, e.g. "THE WORK / CASE STUDY 002". */
  franchise: string;
  title: string;
  standfirst: string;
  market: string;
  readingTime: string;
  evidence: EvidenceStandard;
  decode: DecodeDimension[];
  sections: CaseStudySection[];
  pullQuotes: string[];
  sources: CaseStudySource[];
  verification: VerificationLedger;
  /** Optional self-hosted hero photo (/article-media/…). Cover art renders if absent. */
  heroImage?: string;
  generatedAt: string;
  /** 'review' until a human merges it live. */
  status: 'review' | 'published';
}

/** The competency a case study belongs to → its default evidence standard. */
export const DEFAULT_EVIDENCE: Record<Competency, EvidenceStandard> = {
  'THE WORK': 'SOURCE-LED ANALYSIS',
  'WILL IT LAND': 'SOURCE-LED ANALYSIS',
  INTELLIGENCE: 'SIGNAL BRIEFING',
};

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
