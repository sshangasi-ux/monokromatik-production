// The data behind every exhibit, as a table.
//
// WHY THIS EXISTS. The single biggest thing a small publisher can do to get cited
// is to put the underlying numbers at a predictable URL — data-availability
// statements that link to an actual file are associated with materially higher
// citation impact, while "available on request" shows none. So every exhibit is
// downloadable as CSV, keyed the same way it is numbered.
//
// Each table derives from the same functions that render the chart, so the CSV
// can never disagree with the graphic above it — the rule the whole edition runs
// on.

import type { ExhibitKey } from './edition-01-chapters';
import { EDITION, scoredWorks, axisSummary, bandCounts } from './edition-01';
import { SIGNAL_BANDS, signalBand } from './signal-index';
import { getHistory } from './index-history';
import { brandEvidence } from './evidence-strength';
import { getAllCaseStudies } from './case-studies';

export interface ExhibitTable {
  key: ExhibitKey;
  title: string;
  /** A one-line description of what each row is — printed as a CSV comment. */
  about: string;
  columns: string[];
  rows: (string | number)[][];
}

const bandRange = (band: string): string => {
  const i = SIGNAL_BANDS.findIndex((b) => b.band === band);
  if (i < 0) return '';
  const b = SIGNAL_BANDS[i];
  const upper = i === 0 ? 100 : SIGNAL_BANDS[i - 1].min - 1;
  return b.min === 0 ? '<40' : `${b.min}-${upper}`;
};

export function exhibitTable(key: ExhibitKey): ExhibitTable | null {
  const works = scoredWorks();
  const history = getHistory();

  switch (key) {
    case 'universe':
      // The whole ranking — the one table that is the Index.
      return {
        key,
        title: 'The rated universe',
        about: 'One row per scored work, highest score first. Score is the authorship-weighted composite; band is the published letter grade.',
        columns: ['rank', 'brand', 'work', 'score', 'band', 'idea', 'authorship', 'execution', 'consequence', 'market', 'verification'],
        rows: works.map((w, i) => [
          i + 1,
          w.brand,
          w.title,
          w.score,
          w.band,
          w.levels.IDEA,
          w.levels.AUTHORSHIP,
          w.levels.EXECUTION,
          w.levels.CONSEQUENCE,
          w.market,
          w.verification,
        ]),
      };

    case 'bandLedger':
      return {
        key,
        title: 'The band ledger',
        about: 'Count of scored works in each published band, in rating order. Cut-offs are absolute, not percentiles.',
        columns: ['band', 'score_range', 'works'],
        rows: bandCounts(works).map((b) => [b.band, bandRange(b.band), b.count]),
      };

    case 'contribution':
      return {
        key,
        title: 'How a score is built',
        about: 'Per-axis mean level across all scored works, the axis weight, and the mean contribution that weight yields toward the /100 composite.',
        columns: ['axis', 'weight_pct', 'mean_level', 'mean_contribution'],
        rows: axisSummary(works).map((a) => [
          a.axis,
          Math.round(a.weight * 100),
          a.mean.toFixed(2),
          ((a.mean / 5) * a.weight * 100).toFixed(2),
        ]),
      };

    case 'rebase': {
      // The two distributions, side by side — the honest before/after.
      const lastV1 = [...history].reverse().find((h) => (h.rubricVersion ?? 'v1') === 'v1');
      const firstV2 = history.find((h) => h.rubricVersion === 'v2.0');
      if (!lastV1 || !firstV2) return null;
      const dist = (scores: number[]) =>
        SIGNAL_BANDS.map((b) => scores.filter((s) => signalBand(s)?.band === b.band).length);
      const before = dist(lastV1.entries.map((e) => e.score));
      const after = dist(firstV2.entries.map((e) => e.score));
      return {
        key,
        title: 'Before and after the rescoring',
        about: `Band counts under the previous rubric (${lastV1.date}) and the first reading under ${EDITION.rubric} (${firstV2.date}). These are NOT the same works moving — the ruler changed. Do not read a row as a transition.`,
        columns: ['band', `count_${lastV1.date}`, `count_${firstV2.date}`],
        rows: SIGNAL_BANDS.map((b, i) => [b.band, before[i], after[i]]),
      };
    }

    case 'panelLedger':
      return {
        key,
        title: 'How the rated universe was built',
        about: 'Entries per snapshot and the comparability basis (rubric/unit). Count only — the panel is not a fixed cohort, so a mean across rows is not a time series of the same thing.',
        columns: ['date', 'entries', 'rubric', 'unit', 'mean_score'],
        rows: history.map((s) => [
          s.date,
          s.entries.length,
          s.rubricVersion ?? 'v1',
          s.unit ?? 'brand',
          (s.entries.reduce((a, e) => a + e.score, 0) / (s.entries.length || 1)).toFixed(1),
        ]),
      };

    // The three single-work exhibits illustrate one card. Their citable data is
    // that work's decode — a single, honest row rather than a fabricated table.
    case 'scorecard':
    case 'axisLadder':
    case 'evidence': {
      const lead = works[0];
      const ev = brandEvidence(getAllCaseStudies().filter((c) => c.brand === lead.brand));
      return {
        key,
        title: key === 'evidence' ? 'The evidence behind a reading' : key === 'axisLadder' ? 'The rubric, made visible' : 'A worked scorecard',
        about: `The highest-rated work in Edition ${EDITION.number}, shown as the worked example. One row.`,
        columns: ['brand', 'work', 'score', 'band', 'idea', 'authorship', 'execution', 'consequence', 'scored_works', 'evidence_tier', 'evidence_score'],
        rows: [[
          lead.brand,
          lead.title,
          lead.score,
          lead.band,
          lead.levels.IDEA,
          lead.levels.AUTHORSHIP,
          lead.levels.EXECUTION,
          lead.levels.CONSEQUENCE,
          ev.works,
          ev.tier ?? '',
          ev.score,
        ]],
      };
    }
  }
}

/** RFC-4180 CSV, with the edition credit and the `about` line as leading comments. */
export function exhibitCsv(t: ExhibitTable): string {
  const esc = (v: string | number) => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const credit = `MonoKromatik Cultural-Signal Index, Edition ${EDITION.number}, rubric ${EDITION.rubric}, baseline ${EDITION.baseline}`;
  const lines = [
    `# ${t.title}`,
    `# ${t.about}`,
    `# Source: ${credit}. https://www.monokromatik.com/intelligence/signal-index/edition-01`,
    `# Free to use and cite with attribution to MonoKromatik and a link to the source.`,
    t.columns.join(','),
    ...t.rows.map((r) => r.map(esc).join(',')),
  ];
  return lines.join('\n') + '\n';
}
