// Client-safe shared types + helpers for the asset-valuation tool. No data
// imports live here, so the client search component can import it without
// pulling the corpus JSON into the browser bundle. The index builder
// (lib/asset-index.ts, server-only) imports from here too.

export type Archetype = 'RETAINED' | 'EXPORTED' | 'HOLLOWED' | 'CONTESTED';

/** Canonical one-line glosses — mirrors the Value-Capture Checker's framework. */
export const ARCHETYPE_NOTE: Record<Archetype, string> = {
  RETAINED: 'Authored, owned and captured at home.',
  EXPORTED: 'Authored here, owned and captured elsewhere.',
  HOLLOWED: 'Owned in name, hollowed in economics.',
  CONTESTED: 'Ownership genuinely still in play.',
};

export interface AssetRead {
  key: string; // brandSlug — the join + match key
  display: string; // the asset's display name
  norm: string; // normalised name for fuzzy matching (lowercase, alnum-spaced)
  sector?: string;
  /** Canonical value-capture verdict, drawn from the source record (never invented). */
  verdict?: Archetype;
  owner?: string;
  ownerCountry?: string;
  ownership?: 'african' | 'foreign' | 'mixed';
  /** The real prose read from the source (Ownership 100 note / deal read / excerpt). */
  take?: string;
  /** Cultural-Signal Index composite /100, when the brand is scored. */
  score?: number;
  band?: string; // letter band (AAA…C)
  rank?: number; // Ownership 100 rank
  href?: string; // link to the deep on-site read
  sources: string[]; // which data sources contributed
}

/** Lowercase, strip punctuation to single spaces — the fuzzy-match normaliser. */
export function normName(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}
