// MonoKromatik — editorial franchises (Planner v3, the 3rd coverage axis).
//
// Region and source-category are the first two axes. This adds the EDITORIAL
// franchise — how MonoKromatik actually packages intelligence as recurring product
// lines. It answers a different question from "what region/topic": "are we
// producing across all our franchises, or only decoding campaigns (The Work) while
// Will It Land? and Brand Weather go quiet?"
//
// The data doesn't carry a franchise field on every item, so this classifies one
// deterministically from the fields that DO exist: a case study's `collection`, a
// report's `series`, an issue feature's explicit `franchise`, and an article's
// `category` + Brand-Read flag. Pure + testable — no LLM, no network.

export const EDITORIAL_FRANCHISES = [
  'The Work', // case-study decodes of campaigns / brand moves
  'Will It Land?', // provocative tests of global work against African market reality
  'Brand Weather', // landscape briefings, market reports, the macro read
  'The Boardroom', // leaders, operators, the people behind the work (Conversations)
  'Roots', // heritage / legacy culture
  'Arena', // sport / competition culture
  'Waves', // music / screen / style / internet culture
] as const;

export type EditorialFranchise = (typeof EDITORIAL_FRANCHISES)[number] | 'Unclassified';

/** Signals available on a published item, normalised across content types. */
export interface FranchiseSignals {
  kind: 'article' | 'case-study' | 'report' | 'issue-feature';
  title?: string;
  category?: string; // article: culture | music | sports | …
  collection?: string; // case study
  series?: string; // report
  franchise?: string; // issue feature: explicit, free-text
  tags?: string[];
  hasBrandRead?: boolean; // article carries a Signal Brand Read
}

const hay = (s: FranchiseSignals): string =>
  [s.title, s.collection, s.series, s.franchise, ...(s.tags || [])]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

/** Map a free-text franchise/collection label (e.g. issue features) to canonical. */
export function normalizeFranchise(raw?: string): EditorialFranchise | null {
  const t = (raw || '').toLowerCase();
  if (!t) return null;
  if (t.includes('will it land')) return 'Will It Land?';
  if (t.includes('brand weather')) return 'Brand Weather';
  if (t.includes('boardroom') || t.includes('backroom')) return 'The Boardroom';
  if (t.includes('the work')) return 'The Work';
  if (t.includes('roots')) return 'Roots';
  if (t.includes('arena')) return 'Arena';
  if (t.includes('waves')) return 'Waves';
  return null;
}

/** Classify a published item into its editorial franchise. Deterministic. */
export function classifyFranchise(s: FranchiseSignals): EditorialFranchise {
  // 1. Explicit / strong labels first.
  const explicit = normalizeFranchise(s.franchise) || normalizeFranchise(s.collection);
  if (explicit) return explicit;

  const text = hay(s);
  const hasAny = (...words: string[]) => words.some((w) => text.includes(w));

  // 2. Reports are the landscape/briefing line.
  if (s.kind === 'report') return 'Brand Weather';

  // 3. Case studies are decodes of work — unless framed as a relevance test.
  if (s.kind === 'case-study') {
    if (hasAny('will it land', 'relevance', 'provocation', 'under test')) return 'Will It Land?';
    return 'The Work';
  }

  // 4. Issue features without a recognised franchise: infer from keywords.
  if (s.kind === 'issue-feature') {
    if (hasAny('boardroom', 'backroom', 'ceo', 'founder', 'leader')) return 'The Boardroom';
    if (hasAny('weather', 'market', 'briefing', 'landscape')) return 'Brand Weather';
    return 'The Work';
  }

  // 5. Articles: a Brand Read decodes a move (The Work); otherwise a culture pillar.
  if (s.hasBrandRead) return 'The Work';
  switch ((s.category || '').toLowerCase()) {
    case 'sports':
      return 'Arena';
    case 'music':
    case 'entertainment':
      return 'Waves';
    case 'culture':
      return 'Roots';
    default:
      return 'Unclassified';
  }
}
