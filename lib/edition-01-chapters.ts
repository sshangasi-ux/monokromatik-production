// Edition 01 — the chapters.
//
// Structure, not styling. The route renders this generically, so a chapter is
// added by writing prose here rather than by building a page. That matters for a
// flagship that is backfilled over ten weeks: the shape stays fixed while the
// content deepens.
//
// Exhibits are referenced by KEY, never embedded. The route resolves each key
// against live data, so an exhibit can never drift from the corpus it describes —
// the same rule that governs the cover.
//
// Chapter order is permanent. Editions compare only if the buckets hold still;
// State of Fashion has run the same three for a decade while the themes inside
// them change annually. Add a chapter in Edition 02 by displacing one, not by
// appending.

export type ExhibitKey =
  | 'universe'
  | 'bandLedger'
  | 'contribution'
  | 'evidence'
  | 'scorecard'
  | 'axisLadder'
  | 'rebase'
  | 'panelLedger';

export interface ChapterSection {
  heading?: string;
  paras?: string[];
  /** Renders the named exhibit, with props resolved from live data by the route. */
  exhibit?: ExhibitKey;
}

export interface Chapter {
  n: number;
  slug: string;
  kicker: string;
  title: string;
  standfirst: string;
  sections: ChapterSection[];
  /** Closes every chapter. Three bullets, no more — seven completions across the
   *  edition rather than one marathon. */
  whatThisMeans: string[];
}

export const CHAPTERS: Chapter[] = [
  {
    n: 1,
    slug: 'the-finding',
    kicker: 'THE FINDING',
    title: 'The craft is there. The capture isn’t.',
    standfirst:
      'Across every work we rated, the two axes measuring how it was made outrun the two measuring what it returned. That gap is this edition’s subject.',
    sections: [
      {
        paras: [
          'A rating agency exists to say something a reader could not work out alone. Ours is this: African brand-culture work is consistently better made than it is owned, and better owned than it is repaid.',
          'That is not a complaint about quality. It is the opposite. On the two axes that measure conception and craft — IDEA and EXECUTION — the corpus scores well, and nothing in it scores below 3 for idea at all. The thinness is entirely on the other side of the ledger: who kept the work, and whether anything verifiable followed.',
        ],
      },
      {
        heading: 'One number',
        paras: [
          'Three in four of the works we rated could not show an outcome a third party could check. Not "had no impact" — could not evidence one. Under our rubric a documented outcome scores CONSEQUENCE 4 or above; everything at 3 and below is either plausible-but-unpublished or captured by a non-African counterparty.',
          'That figure is a deficit, and deficits travel further than triumphs. It is also the number most likely to be quoted back at us, so it is worth being precise about what it does and does not say. It does not say the work failed. It says the evidence of success is not in public — which for an industry arguing for investment is a different, and arguably worse, problem.',
        ],
      },
      { exhibit: 'universe' },
      {
        heading: 'Why the gap is the story and the winner is not',
        paras: [
          'The highest-rated work in an edition is trivia. It changes rarely and tells you about one campaign. The gap between how work is made and what it returns is an argument, it moves every edition, and it applies to everyone in the table at once.',
          'This is borrowed from a better-known instrument. The Henley Passport Index has been topped by the same passport for three years running, which is why its releases lead with the mobility gap rather than the winner. A gap regenerates. A champion goes stale.',
        ],
      },
    ],
    whatThisMeans: [
      'If you make African brand-culture work, the binding constraint is probably not craft. It is ownership and evidence.',
      'If you fund it, the absence of published outcomes is the risk you are actually pricing — not the quality of the idea.',
      'If you are rated here, the fastest way to move your score is to publish an outcome, not to make a better case for the work.',
    ],
  },
  {
    n: 2,
    slug: 'how-we-score',
    kicker: 'THE METHOD',
    title: 'Four axes, and the rule that governs all of them.',
    standfirst:
      'Every score in this edition is set against a rubric published in advance, with the band cut-offs stated. Most rating providers publish neither.',
    sections: [
      {
        paras: [
          'The Cultural-Signal Score is an authorship-weighted composite of four editorial judgements, each scored 1–5 against a written standard: IDEA at 25 per cent, AUTHORSHIP at 35, EXECUTION at 15, CONSEQUENCE at 25.',
          'Authorship carries the heaviest weight because it is the question this publication exists to ask. Not who appeared in the work — who originated it, and who kept it.',
        ],
      },
      { exhibit: 'contribution' },
      {
        heading: 'The announcement rule',
        paras: [
          'One rule does more work than the rest of the rubric combined: a launch, a signing, a partnership reveal or a stated intention scores CONSEQUENCE 3 at most, however large the brand or loud the coverage. Consequence is what happened after.',
          'This is where our own scores were most wrong before. An earlier version of this Index treated the size of an announcement as evidence of its effect, which is how a corpus ends up with 58 per cent of everything above 80 and nothing below 50. That is not a rating; it is praise with a number attached.',
          'A score of 5 additionally requires evidence a third party could check. Our own reporting is not evidence of consequence.',
        ],
      },
      { exhibit: 'axisLadder' },
      {
        heading: 'What we are not',
        paras: [
          'This is an expert rating against a published rubric. It is not a survey, not a valuation, and not an admiration poll. We have no fieldwork, no sample and no respondents, so we publish no margin of error — none could honestly be computed.',
          'That distinguishes us cleanly from the two established instruments on this continent. Brand Africa 100 measures consumer admiration through survey fieldwork. Brand Finance measures brand financial value through royalty relief. Neither rates the work.',
        ],
      },
    ],
    whatThisMeans: [
      'A low score is a claim about evidence, not about effort — and it is checkable against a standard we published first.',
      'The announcement rule is the single most common reason a score is lower than a brand expects.',
      'Because we have no fieldwork, we never use survey language. If you see it here, it is an error worth reporting.',
    ],
  },
  {
    n: 3,
    slug: 'the-universe',
    kicker: 'THE UNIVERSE',
    title: 'Where the work sits.',
    standfirst:
      'The rated corpus, its distribution across published bands, and the reason this edition does not publish a league table.',
    sections: [
      {
        paras: [
          'The Index ranks work, not brands. That is a deliberate correction: almost every brand in the corpus carries exactly one scored work, so a brand-level table would dress a single judgement in a company’s name and imply a body of evidence that does not exist.',
        ],
      },
      { exhibit: 'bandLedger' },
      {
        heading: 'Why there is no 1-to-N table',
        paras: [
          'Four axes scored 1–5 at weights of .25/.35/.15/.25 reduce to a lattice with roughly seventy-five achievable values. Across the corpus that produces far fewer distinct scores than works, and most works share a score with something else.',
          'A ranked list would therefore present tie-break noise as findings. The difference between the fortieth and forty-seventh entries would be an artefact of sorting, not a judgement we made. So ties are shown as ties, and the band — not the rank — is the honest position.',
        ],
      },
      {
        heading: 'What a band means',
        paras: [
          'Cut-offs are absolute and were published before scoring: AAA at 90, AA at 80, A at 70, BBB at 60, BB at 50, B at 40, C below. They are not forced percentiles, so the shape of the distribution was not designed. It is what the rubric produced.',
          'Most rating providers publish a score and withhold the boundaries behind it. Publishing ours is the cheapest credibility available to an independent index, and it is the thing that makes a challenge possible.',
        ],
      },
    ],
    whatThisMeans: [
      'Read the band, not the rank. Between tied works, rank is arithmetic rather than judgement.',
      'The distribution is centre-weighted with a scarce top band — the shape a working instrument produces, not a flattering one.',
      'Because cut-offs are absolute, adding weaker or stronger work moves the distribution honestly rather than re-sorting everyone.',
    ],
  },
  {
    n: 4,
    slug: 'authorship',
    kicker: 'THE HEAVIEST AXIS',
    title: 'Who originated it, and who kept it.',
    standfirst:
      'Authorship carries 35 per cent of the composite. It is the axis where visibility is most often mistaken for ownership.',
    sections: [
      {
        paras: [
          'The most common failure this Index records is not bad work. It is work in which African talent, aesthetics or audiences are the input, and the authorship and ownership sit elsewhere.',
          'The rubric is explicit that a 5 requires control — of the IP, the mark, or the rails — and not merely presence. An artist who features on a record they do not own scores differently from one who owns the master. A brand whose rails were acquired scores differently from one that still runs them.',
        ],
      },
      { exhibit: 'scorecard' },
      {
        heading: 'What the low end looks like',
        paras: [
          'At level 2, African talent or aesthetics are used as input while authorship and ownership are external. At level 1, African culture is referenced with no African authorship at all.',
          'Assigning a 1 is a serious claim, because it asserts a universal negative, and we have been wrong about it before. In July 2026 we published three works at AUTHORSHIP 1 on two sources each. Re-researching them before notifying the companies found commissioned, credited African artists inside one of the campaigns — published on the rated party’s own website. Two of the three scores moved.',
          'That correction is recorded on the works themselves. It is also the reason this edition treats thin sourcing on a harsh rating as a publication blocker rather than a note.',
        ],
      },
    ],
    whatThisMeans: [
      'Visibility is not authorship. The axis asks who controls the work, not who appears in it.',
      'A low authorship score is the most consequential thing we publish about a brand, so it carries the highest evidentiary bar.',
      'Where we have got this wrong, the correction is published on the work, with the date and the reason.',
    ],
  },
  {
    n: 5,
    slug: 'consequence',
    kicker: 'THE AXIS THAT WAS ABUSED',
    title: 'What actually followed.',
    standfirst:
      'Consequence asks what measurably changed and who captured the value. It is the axis this edition’s recalibration corrected hardest.',
    sections: [
      {
        paras: [
          'Most of the corpus clusters at CONSEQUENCE 3 — plausible impact with no published evidence, or impact that accrued mainly to a non-African counterparty. That is not a scoring accident. It is the announcement rule doing its job.',
          'The distribution matters more than any single score. When an entire corpus sits at 3, the finding is not that the work is mediocre; it is that the industry does not publish outcomes, and cannot therefore prove its own case.',
        ],
      },
      { exhibit: 'evidence' },
      {
        heading: 'Value created, value surrendered',
        paras: [
          'Level 1 is reserved for negative consequence, or value demonstrably surrendered. It is rare, and it is the level our previous rubric was least able to express.',
          'The clearest instance in this corpus is a case where the earlier score read the size of an event as its meaning. A continental streaming business closing, with distribution control moving offshore, had been scored as a triumph because the transaction was large. Under the current rubric it scores 1: value created, value surrendered. An index whose thesis is African ownership cannot score the loss of African ownership as a success.',
        ],
      },
    ],
    whatThisMeans: [
      'A cluster at level 3 is a finding about disclosure, not about talent.',
      'The fastest available score movement in this Index is publishing a verifiable outcome.',
      'Magnitude is not direction. A large transaction can score 1 if the value left.',
    ],
  },
  {
    n: 6,
    slug: 'what-moved',
    kicker: 'THE REBASE',
    title: 'The ruler moved. The work didn’t.',
    standfirst:
      'Every work in this edition was re-scored against a new rubric. Scores fell. That is the correction working — and it means earlier readings are not comparable.',
    sections: [
      {
        paras: [
          'This edition carries no year-on-year movement, and saying so plainly is more useful than manufacturing some. The scores here are the first set under the current rubric, and the Index has since also changed what it ranks, from brand roll-ups to individual works. Neither change is a movement in the work.',
        ],
      },
      { exhibit: 'rebase' },
      {
        heading: 'Two effects that must not be blended',
        paras: [
          'The mean fell twice, for two different reasons, and conflating them would overstate our own rigour. It fell once while the rubric was unchanged, purely because the rated panel nearly tripled in size. It fell again when the rubric changed.',
          'Only the like-for-like figure — the same entries scored under both rubrics — measures the recalibration. That is the number this edition quotes, and the panel history is published beside it so the other effect is visible rather than hidden.',
        ],
      },
      { exhibit: 'panelLedger' },
      {
        heading: 'The forward view',
        paras: [
          'Because there is no comparable prior reading, movement in this edition is forward-looking rather than historical. An outlook states at least a one-in-three likelihood of a change over twelve months, and a watch states at least one-in-two within ninety days.',
          'Both numbers are published, because a watchlist without a stated probability and a clock is a mood. Every outlook carries the date it was assigned and the specific trigger that would move the score, so a later edition can mark our own calls — including the ones we get wrong.',
        ],
      },
    ],
    whatThisMeans: [
      'No score in this edition should be compared to a score published before it.',
      'A falling mean is evidence of a stricter instrument, not of declining work — provided the panel effect is separated out, which we do.',
      'The outlooks are a falsifiable claim about our judgement. Edition 02 will publish how many were right.',
    ],
  },
  {
    n: 7,
    slug: 'limitations',
    kicker: 'WHAT THIS CANNOT TELL YOU',
    title: 'The limits, up front.',
    standfirst:
      'The four things most likely to be used against this edition, stated by us first.',
    sections: [
      {
        heading: 'This rates work, not brands',
        paras: [
          'Almost every brand in the corpus has exactly one scored work. A brand-level reading would imply a body of evidence that does not yet exist, which is why the Index ranks works and the brand roll-up is presented as a mean with its work count attached.',
        ],
      },
      {
        heading: 'Ties are common, and ranks between them are not meaningful',
        paras: [
          'The scoring lattice produces far fewer distinct values than works. Most works share a score with something else, so band position is the honest reading and rank between tied works is not.',
        ],
      },
      {
        heading: 'The sample is selected, not representative',
        paras: [
          'We write about notable work, which is why nothing here scores below 3 on idea. That is range restriction, and it means the corpus describes the work we chose to examine rather than the field as a whole. This is an expert rating against a published rubric, and it carries no margin of error because none can honestly be computed.',
        ],
      },
      {
        heading: 'Scores are versioned, and corrections are published',
        paras: [
          'Every score carries the rubric version it was set under. Re-scoring under a new rubric is disclosed as a methodology change, never applied silently. Where a published piece has been corrected, the correction, its date and its reason sit on the work itself.',
          'Any rated party may challenge a score with evidence. New evidence can move a score — that is precisely how this instrument is meant to work.',
        ],
      },
    ],
    whatThisMeans: [
      'Cite the work and the band, not a brand rank.',
      'Treat anything below a documented outcome as unproven rather than absent.',
      'If we have something wrong, the correction route is public and the correction gets published.',
    ],
  },
];

export const chapterBySlug = (slug: string): Chapter | undefined =>
  CHAPTERS.find((c) => c.slug === slug);

export const chapterNeighbours = (slug: string) => {
  const i = CHAPTERS.findIndex((c) => c.slug === slug);
  return { prev: i > 0 ? CHAPTERS[i - 1] : null, next: i >= 0 && i < CHAPTERS.length - 1 ? CHAPTERS[i + 1] : null };
};
