// "Who's Buying Africa" — the ownership tracker. A curated, sourced record of
// deals that move ownership of African (and diaspora) brands, with a value-capture
// verdict: does the ownership/upside stay on the continent, or get exported?
import data from '../data/acquisitions.json';

export type Verdict = 'exported' | 'retained' | 'mixed';

export interface DealSource {
  publisher: string;
  url?: string;
  label?: string;
}

export interface Acquisition {
  id: string;
  acquirer: string;
  acquirerParent?: string;
  target: string;
  targetCountry: string;
  sector: string;
  value: string;
  /** YYYY or YYYY-MM */
  date: string;
  status: 'completed' | 'reported' | 'pending';
  verdict: Verdict;
  read: string;
  sources: DealSource[];
  /** Slug of the on-site article with the full sourced breakdown, if any. */
  relatedArticle?: string;
}

const ALL = data as Acquisition[];

/** Deals, most recent first. */
export function getAcquisitions(): Acquisition[] {
  return [...ALL].sort((a, b) => b.date.localeCompare(a.date));
}

export interface AcquisitionSummary {
  total: number;
  exported: number;
  retained: number;
  mixed: number;
  sectors: string[];
}

export function getAcquisitionSummary(): AcquisitionSummary {
  const by = (v: Verdict) => ALL.filter((d) => d.verdict === v).length;
  return {
    total: ALL.length,
    exported: by('exported'),
    retained: by('retained'),
    mixed: by('mixed'),
    sectors: Array.from(new Set(ALL.map((d) => d.sector))).sort(),
  };
}

export const VERDICT_LABEL: Record<Verdict, string> = {
  exported: 'Value exported',
  retained: 'Value retained',
  mixed: 'Mixed',
};
