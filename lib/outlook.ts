// Outlook — the forward-looking half of the Index.
//
// WHY THIS EXISTS. A score says what a work is worth now. An outlook says which
// way it is likely to move next, and that is the only movement signal Edition 01
// can honestly carry: the 20 July snapshot is the first under rubric v2.0 and the
// 21 July snapshot is the first at work level, so there is no same-basis pair to
// compute a delta from. An outlook needs no history. It turns a frozen annual
// into a live surface on day one.
//
// THE RULE THAT MAKES IT AN INSTRUMENT. S&P and Moody's both attach a stated
// probability and a clock:
//   Outlook — at least a ONE-IN-THREE likelihood of a rating action over the
//             intermediate term.
//   Watch   — at least a ONE-IN-TWO likelihood of a change WITHIN 90 DAYS.
// Without both numbers a watchlist is just a mood. We publish both, and we
// publish the definitions, which Brand Finance and Interbrand do not.
//
// THE PART THAT COSTS US SOMETHING. Every outlook is dated and stored, so a later
// edition can score our own hit rate — how often a Positive outlook actually
// preceded a rise. That is a falsifiable claim about our own judgement, which is
// the point. Nothing here is worth publishing if we are not willing to be marked
// on it.

export type OutlookDirection = 'positive' | 'negative' | 'stable' | 'developing';

export interface Outlook {
  direction: OutlookDirection;
  /** ISO date the outlook was assigned. Required — an outlook without a clock
   *  cannot be scored later, and an unscoreable forecast is decoration. */
  assignedOn: string;
  /** What would have to happen for the score to move. Must name a specific,
   *  checkable trigger — not a sentiment. This is what gets marked. */
  rationale: string;
  /** Escalates to the 90-day, one-in-two threshold. Use sparingly. */
  watch?: boolean;
}

export interface OutlookDefinition {
  direction: OutlookDirection;
  label: string;
  meaning: string;
}

/** Published definitions. These are the contract; changing them is a dated
 *  methodology change, exactly like changing a band cut-off. */
export const OUTLOOK_DEFINITIONS: OutlookDefinition[] = [
  {
    direction: 'positive',
    label: 'Positive',
    meaning:
      'At least a one-in-three likelihood the score rises within twelve months — typically because evidence of consequence is pending rather than absent.',
  },
  {
    direction: 'negative',
    label: 'Negative',
    meaning:
      'At least a one-in-three likelihood the score falls within twelve months — typically because the rating rests on reported figures that may not hold, or on a position that is eroding.',
  },
  {
    direction: 'developing',
    label: 'Developing',
    meaning:
      'A pending event could move the score either way. Used when the trigger is known and binary, and its direction is not.',
  },
  {
    direction: 'stable',
    label: 'Stable',
    meaning:
      'No one-in-three likelihood of movement identified. Stable is the default and the majority: it is a finding, not an absence of one.',
  },
];

export const OUTLOOK_THRESHOLD = 'at least a one-in-three likelihood over the next twelve months';
export const WATCH_THRESHOLD = 'at least a one-in-two likelihood within 90 days';

export const outlookDefinition = (d: OutlookDirection): OutlookDefinition =>
  OUTLOOK_DEFINITIONS.find((o) => o.direction === d) ?? OUTLOOK_DEFINITIONS[3];

/** Display label, including the watch escalation. */
export function outlookLabel(o: Outlook | null | undefined): string {
  if (!o) return 'Stable';
  const base = outlookDefinition(o.direction).label;
  return o.watch ? `${base} · Watch` : base;
}

/** An unassigned work is Stable by default — the same convention the agencies
 *  use, and honest: most work is not about to move. */
export const DEFAULT_OUTLOOK: Outlook = {
  direction: 'stable',
  assignedOn: '',
  rationale: 'No one-in-three likelihood of movement identified.',
};

export interface OutlookCount {
  direction: OutlookDirection;
  label: string;
  count: number;
}

/** Distribution across a set of works — the summary the edition publishes. */
export function outlookDistribution(
  works: { outlook?: Outlook | null }[],
): OutlookCount[] {
  return OUTLOOK_DEFINITIONS.map((d) => ({
    direction: d.direction,
    label: d.label,
    count: works.filter((w) => (w.outlook?.direction ?? 'stable') === d.direction).length,
  }));
}

/** Works currently on watch — the 90-day list. */
export function onWatch<T extends { outlook?: Outlook | null }>(works: T[]): T[] {
  return works.filter((w) => w.outlook?.watch);
}

/**
 * Scoring our own calls.
 *
 * Given an outlook assigned at a past score, and the score now, did the call go
 * the way we said? Returns null while the outlook is too young to judge, so a
 * hit rate can never be inflated by counting unresolved calls as correct.
 *
 * `stable` is judged as correct only if the score genuinely did not move — a
 * Stable that preceded a large move is a miss, and must be counted as one.
 */
export type OutlookResult = 'hit' | 'miss' | 'unresolved';

export function scoreOutlook(
  o: Outlook | null | undefined,
  scoreThen: number,
  scoreNow: number,
): OutlookResult {
  if (!o || !o.assignedOn) return 'unresolved';
  const delta = scoreNow - scoreThen;
  switch (o.direction) {
    case 'positive':
      return delta > 0 ? 'hit' : delta < 0 ? 'miss' : 'unresolved';
    case 'negative':
      return delta < 0 ? 'hit' : delta > 0 ? 'miss' : 'unresolved';
    case 'developing':
      // We said it could move either way; movement of any size vindicates that,
      // and total stillness does not.
      return delta !== 0 ? 'hit' : 'miss';
    case 'stable':
      return delta === 0 ? 'hit' : 'miss';
  }
}
