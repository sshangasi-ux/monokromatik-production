// Data layer for The Ownership 100 — the ranked ledger franchise. Mirrors the
// other accessors: the JSON file is the source of truth, this is the typed
// surface. Every entry is traceable to a published Who's Buying Africa brief
// (articleSlug) or a deal in the ownership tracker (dealId).

import data from '../data/ownership-100.json';

export type OwnershipStatus = 'Retained' | 'Exported' | 'Contested';

export interface Ownership100Entry {
  rank: number;
  brand: string;
  sector: string;
  owner: string;
  ownerCountry: string;
  /** african = value kept on the continent; foreign = controlling equity offshore. */
  ownership: 'african' | 'foreign' | 'mixed';
  status: OwnershipStatus;
  note: string;
  articleSlug?: string;
  dealId?: string;
  /**
   * Provenance for a tracked entry that does not yet have a full on-site brief:
   * the named basis for the ownership claim (e.g. "Company filings · Reuters").
   * Entries carry a brief (articleSlug), a deal (dealId), or a sourceLabel — a
   * ledger row is never an unsourced assertion.
   */
  sourceLabel?: string;
}

export interface Ownership100 {
  title: string;
  edition: string;
  cohortSize: number;
  target: number;
  updatedAt: string;
  standfirst: string;
  methodology: string;
  entries: Ownership100Entry[];
}

const doc = data as Ownership100;

/** The full ledger document. */
export function getOwnership100(): Ownership100 {
  return doc;
}

/** Entries in rank order. */
export function getOwnership100Entries(): Ownership100Entry[] {
  return [...doc.entries].sort((a, b) => a.rank - b.rank);
}

/** Tally by status — powers the headline stat strip. */
export function getOwnership100Tally(): Record<OwnershipStatus, number> {
  const t: Record<OwnershipStatus, number> = { Retained: 0, Exported: 0, Contested: 0 };
  for (const e of doc.entries) t[e.status] += 1;
  return t;
}
