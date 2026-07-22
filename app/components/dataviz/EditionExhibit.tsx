// The edition's exhibit registry.
//
// Every exhibit is numbered from ONE array, so a number cannot drift between the
// cover, a chapter and the exhibits index. The cover previously hardcoded 1–8
// inline, which is exactly the failure this fixes: three surfaces numbering the
// same graphics independently is a contradiction waiting to happen.
//
// Props are resolved from live data here, once. A caller names an exhibit; it
// cannot pass it the wrong numbers.

import Exhibit from './Exhibit';
import UniverseStrip from './UniverseStrip';
import { BandLedger, RebaseExhibit, PanelLedger } from './CorpusExhibits';
import { ContributionBar, EvidenceRow, AxisLadder, WorkScorecard } from './WorkExhibits';
import {
  EDITION,
  scoredWorks,
  axisSummary,
  bandCounts,
  editionStats,
  limitations,
} from '../../../lib/edition-01';
import { getHistory } from '../../../lib/index-history';
import { brandEvidence } from '../../../lib/evidence-strength';
import { getAllCaseStudies, getCaseStudyBySlug } from '../../../lib/case-studies';
import type { ExhibitKey } from '../../../lib/edition-01-chapters';

/** Canonical order. The index in this array IS the exhibit number. */
export const EXHIBIT_ORDER: ExhibitKey[] = [
  'universe',
  'bandLedger',
  'contribution',
  'evidence',
  'scorecard',
  'axisLadder',
  'rebase',
  'panelLedger',
];

export const exhibitNumber = (key: ExhibitKey) => EXHIBIT_ORDER.indexOf(key) + 1;

export const EXHIBIT_TITLES: Record<ExhibitKey, string> = {
  universe: 'The rated universe',
  bandLedger: 'The band ledger',
  contribution: 'How a score is built',
  evidence: 'The evidence behind a reading',
  scorecard: 'A worked scorecard',
  axisLadder: 'The rubric, made visible',
  rebase: 'Before and after the rescoring',
  panelLedger: 'How the rated universe was built',
};

export default function EditionExhibit({ exhibit }: { exhibit: ExhibitKey }) {
  const works = scoredWorks();
  const stats = editionStats(works);
  const lim = limitations(works);
  const axes = axisSummary(works);
  const n = exhibitNumber(exhibit);
  const title = EXHIBIT_TITLES[exhibit];

  const lead = works[0];
  const leadStudy = getCaseStudyBySlug(lead.slug);
  const leadEvidence = brandEvidence(getAllCaseStudies().filter((c) => c.brand === lead.brand));
  const history = getHistory();
  const lastV1 = [...history].reverse().find((h) => (h.rubricVersion ?? 'v1') === 'v1');
  const firstV2 = history.find((h) => h.rubricVersion === 'v2.0');

  switch (exhibit) {
    case 'universe':
      return (
        <Exhibit
          n={n}
          title={title}
          subtitle={`All ${stats.works} scored works on the 0–100 Cultural-Signal scale, grouped by published band. Works that tie are stacked.`}
          source={`${stats.works} scored works · ${stats.brands} brands`}
          note={`Each tick is one work, not a brand's record — ${lim.singleWorkShare}% of brands here have exactly one scored work. Ties are real and shown as ties: ${lim.ties.tiedWorks} of ${lim.ties.total} works share a score with something else, across only ${lim.ties.distinctScores} distinct values. Rank positions between tied works would be arithmetic noise, so this edition does not publish a 1–${stats.works} league table.`}
        >
          <UniverseStrip works={works} />
        </Exhibit>
      );

    case 'bandLedger':
      return (
        <Exhibit
          n={n}
          title={title}
          subtitle={`Scored works by published band, in rating order. ${stats.works} works.`}
          source={`${stats.works} scored works`}
          note="Bands are absolute cut-offs published in advance, not forced percentiles — the shape of this distribution was not designed, it is what the rubric produced. Band order is the scale and is never re-sorted by count."
        >
          <BandLedger bands={bandCounts(works)} />
        </Exhibit>
      );

    case 'contribution':
      return (
        <Exhibit
          n={n}
          title={title}
          subtitle="Each axis occupies a slot as wide as its weight, filled to the level awarded. Shown here at the corpus mean."
          source="Mean level per axis across all scored works"
          note="A radar chart is deliberately not used here. Its spokes are equal by construction, so it would render AUTHORSHIP (35%) and EXECUTION (15%) as the same size, and its enclosed area is not proportional to the composite. Length is the honest encoding for weighted components."
        >
          <ContributionBar levels={Object.fromEntries(axes.map((a) => [a.axis, a.mean])) as Record<string, number>} />
        </Exhibit>
      );

    case 'evidence':
      return (
        <Exhibit
          n={n}
          title={title}
          subtitle="How many scored works sit behind the rating, and how much corroboration."
          source={`${lead.brand} · evidence tier from cited sources and confirmed facts`}
          note="We publish no confidence interval because we have no sampling and could not honestly compute one. What is shown is what can be counted: works behind the reading, and a qualitative corroboration tier. With one scored work behind almost every brand, that count is the most important number on the card."
        >
          <EvidenceRow works={leadEvidence.works} tier={leadEvidence.tier} score={leadEvidence.score} />
        </Exhibit>
      );

    case 'scorecard':
      return (
        <Exhibit
          n={n}
          title={title}
          subtitle={`${lead.brand} — the highest-rated work in Edition ${EDITION.number}.`}
          source={`${lead.brand} · scored work`}
          note={`The card shows a band, not a rank. With only ${lim.ties.distinctScores} distinct scores across ${stats.works} works, rank between tied works is arithmetic noise; the band is the honest position.`}
        >
          <WorkScorecard
            brand={lead.brand}
            title={lead.title}
            score={lead.score}
            levels={lead.levels}
            works={leadEvidence.works}
            tier={leadEvidence.tier}
            evidenceScore={leadEvidence.score}
            scoredOn={leadStudy?.scoredOn}
            rubric={EDITION.rubric}
          />
        </Exhibit>
      );

    case 'axisLadder':
      return (
        <Exhibit
          n={n}
          title={title}
          subtitle={`All five levels of the highest-weighted axis, with the level awarded to ${lead.brand} marked.`}
          source={`docs/SCORING-RUBRIC.md ${EDITION.rubric}`}
          note="Levels are not equal intervals and should not be read as a percentage scale. They are named standards; the distance between a 3 and a 4 is a difference in kind, not in degree."
        >
          <AxisLadder axis="AUTHORSHIP" level={lead.levels.AUTHORSHIP} />
        </Exhibit>
      );

    case 'rebase':
      if (!lastV1 || !firstV2) return null;
      return (
        <Exhibit
          n={n}
          title={title}
          subtitle={`Band distribution under the previous rubric (${lastV1.date}) beside the first reading under ${EDITION.rubric} (${firstV2.date}).`}
          source="Index snapshots · brand basis, before the Index moved to ranking works"
          note="There is deliberately no arrow, slope or connector between these two distributions. A connector would assert that entries moved. They did not — the ruler did. A Sankey or slope chart across this boundary would render our own methodology change as roughly sixty downgrades, and it is the one chart we will not build."
        >
          <RebaseExhibit
            unit="brands"
            before={{ label: `Previous rubric · ${lastV1.date}`, scores: lastV1.entries.map((e) => e.score) }}
            after={{ label: `Rubric ${EDITION.rubric} · ${firstV2.date}`, scores: firstV2.entries.map((e) => e.score) }}
          />
        </Exhibit>
      );

    case 'panelLedger':
      return (
        <Exhibit
          n={n}
          title={title}
          subtitle="Entries per snapshot, with the comparability basis beneath each."
          source="Index snapshot history"
          note="This plots count, never mean. The panel is not a fixed cohort — it nearly tripled — so a line of means across these snapshots would not be a time series of the same thing. It is shown beside the rescoring for a reason: the mean also fell while the rubric was unchanged, purely because the panel grew, and any honest reading has to separate the two."
        >
          <PanelLedger snapshots={history} />
        </Exhibit>
      );
  }
}
