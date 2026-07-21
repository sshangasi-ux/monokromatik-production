// The rubric, in code — the 20 level definitions behind every score.
//
// These are the same words as docs/SCORING-RUBRIC.md v2.0. They live here so the
// site can SHOW what a level means next to the level it awarded, rather than
// linking to a document and hoping. A score is only as defensible as the reader's
// ability to check the standard it was set against.
//
// Changing any of these is a methodology event, not a copy edit. Bump
// RUBRIC_VERSION in lib/signal-index.ts and date the change in the doc.

import type { Axis } from './edition-01';

export interface RubricLevel {
  level: 1 | 2 | 3 | 4 | 5;
  meaning: string;
}

export const RUBRIC_LEVELS: Record<Axis, RubricLevel[]> = {
  IDEA: [
    { level: 5, meaning: 'Genuinely new for the category. Nobody in this market had done it. Reframes what the category can attempt.' },
    { level: 4, meaning: 'Strong idea, well adapted. Recognisable elsewhere, but new to this market or this brand.' },
    { level: 3, meaning: "Competent and conventional — the category's standard play, run knowingly and well." },
    { level: 2, meaning: 'Derivative. A borrowed idea with little adaptation to context.' },
    { level: 1, meaning: 'No discernible idea. Activity without a thesis.' },
  ],
  AUTHORSHIP: [
    { level: 5, meaning: 'Conceived, made and owned by African/diaspora principals, including control of the IP, the mark or the rails.' },
    { level: 4, meaning: 'African/diaspora-led with meaningful ownership, but a material layer — capital, platform, distribution — sits elsewhere.' },
    { level: 3, meaning: 'Genuine African/diaspora participation in the making, but creative direction or ownership is external.' },
    { level: 2, meaning: 'African/diaspora talent or aesthetics used as input. Authorship and ownership are external.' },
    { level: 1, meaning: 'African culture referenced or extracted with no African authorship at all.' },
  ],
  EXECUTION: [
    { level: 5, meaning: 'Flawless and coherent across every surface. Sets the standard others copy.' },
    { level: 4, meaning: "Strong and consistent; minor gaps that don't undercut the whole." },
    { level: 3, meaning: 'Solid where it counts, uneven elsewhere.' },
    { level: 2, meaning: 'Visible weaknesses that undercut the idea.' },
    { level: 1, meaning: 'Poorly made. The execution defeats the idea.' },
  ],
  CONSEQUENCE: [
    { level: 5, meaning: 'A durable, third-party-verifiable outcome, with value demonstrably captured by the African/diaspora party. Audited or published figures, sustained position, or structural change persisting twelve months or more.' },
    { level: 4, meaning: 'A real, documented outcome — but durability is unproven, or capture is partial or shared.' },
    { level: 3, meaning: 'Plausible impact with no published evidence; or impact that accrued mainly to a non-African counterparty.' },
    { level: 2, meaning: 'Little discernible consequence. The moment passed.' },
    { level: 1, meaning: 'Negative consequence, or value demonstrably surrendered.' },
  ],
};

export const rubricLevel = (axis: Axis, level: number): string =>
  RUBRIC_LEVELS[axis]?.find((l) => l.level === level)?.meaning ?? '';

/** The announcement rule — the single most load-bearing constraint in v2.0. */
export const ANNOUNCEMENT_RULE =
  'A launch, a signing, a partnership reveal or a stated intention scores CONSEQUENCE 3 at most, however large the brand or loud the coverage. Consequence is what happened after.';
