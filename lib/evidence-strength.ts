// Evidence Strength — the MEASURED anchor beside the (editorial) Cultural-Signal
// Score. The composite score is interpretive editorial judgement; on its own a
// buyer can't tell how well-backed a rating is. This module derives a second,
// fully MEASURED signal — a deterministic count of corroboration behind each
// brand's works: independently-confirmed facts, cited sources, and verification
// status. It answers "how defensible is this rating?" with numbers, not opinion.
//
// Design: it NEVER touches the composite score (locked 2026-06-22). It sits
// alongside it — the rating + a data-quality indicator, the model rating
// agencies (Brand Finance) and survey bodies (AAPOR disclosure) use. Pure +
// deterministic, like signal-index.ts.

import type { CaseStudy } from './case-studies';
import { brandSlug } from './signal-index';

export type EvidenceTier = 'Strong' | 'Moderate' | 'Developing';

export interface EvidenceStrength {
  /** Measured corroboration score 0–100 (deterministic from the counts below). */
  score: number;
  tier: EvidenceTier;
  /** Independently-confirmed evidence points across the brand's works. */
  confirmed: number;
  /** Reported (single-source / attributed) evidence points. */
  reported: number;
  /** Distinct sources cited across the brand's works. */
  sources: number;
  /** Works verified vs partially verified — the editorial verification ledger. */
  verifiedWorks: number;
  works: number;
}

// Verification → a measured corroboration bonus. 'verified' means the claims are
// checkable against primary/corroborated reporting; 'interpretive' adds nothing.
const V_BONUS: Record<string, number> = { verified: 6, partial: 3, interpretive: 0 };

const tierOf = (score: number): EvidenceTier => (score >= 75 ? 'Strong' : score >= 45 ? 'Moderate' : 'Developing');

/** Raw corroboration counts for one work. */
function workCounts(cs: Pick<CaseStudy, 'evidence' | 'sources' | 'verification'>) {
  return {
    confirmed: cs.evidence?.confirmed?.length ?? 0,
    reported: cs.evidence?.reported?.length ?? 0,
    sources: cs.sources?.length ?? 0,
    vBonus: V_BONUS[cs.verification] ?? 0,
    verified: cs.verification === 'verified' ? 1 : 0,
  };
}

/**
 * Evidence Strength for a set of a brand's works. Confirmed facts are weighted
 * most (2.5×) — they're the strongest corroboration — then verification, then
 * sources, then single-source reported claims. The raw total is passed through
 * an exponential saturation so the score rises with corroboration but can't run
 * away with sheer volume.
 */
export function brandEvidence(works: Pick<CaseStudy, 'evidence' | 'sources' | 'verification'>[]): EvidenceStrength {
  let confirmed = 0, reported = 0, sources = 0, vBonus = 0, verifiedWorks = 0;
  for (const w of works) {
    const c = workCounts(w);
    confirmed += c.confirmed;
    reported += c.reported;
    sources += c.sources;
    vBonus += c.vBonus;
    verifiedWorks += c.verified;
  }
  const raw = 2.5 * confirmed + reported + 1.2 * sources + vBonus;
  const score = Math.round(100 * (1 - Math.exp(-raw / 14)));
  return { score, tier: tierOf(score), confirmed, reported, sources, verifiedWorks, works: works.length };
}

/** Evidence Strength for every brand, keyed by brand slug — for the leaderboard/API. */
export function evidenceByBrand(caseStudies: CaseStudy[]): Map<string, EvidenceStrength> {
  const byBrand = new Map<string, CaseStudy[]>();
  for (const cs of caseStudies) {
    const slug = brandSlug(cs.brand);
    (byBrand.get(slug) ?? byBrand.set(slug, []).get(slug)!).push(cs);
  }
  const out = new Map<string, EvidenceStrength>();
  for (const [slug, works] of byBrand) out.set(slug, brandEvidence(works));
  return out;
}

/** A compact, human-readable summary of the measured evidence base. */
export function describeEvidence(e: EvidenceStrength): string {
  const parts = [`${e.confirmed} confirmed`, `${e.sources} source${e.sources === 1 ? '' : 's'}`];
  if (e.verifiedWorks > 0) parts.push(`${e.verifiedWorks} verified`);
  return parts.join(' · ');
}
