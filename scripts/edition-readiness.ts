#!/usr/bin/env node
/**
 * Edition 01 readiness — the delivery mechanism for the 30 September 2026 baseline.
 *
 * Runs on a schedule and answers one question: if we shipped today, what would be
 * wrong? It checks the things that would actually embarrass us at launch, not a
 * to-do list someone has to remember to update.
 *
 * Deliberately NOT a progress bar. A percentage would invite us to feel good at
 * 80% while the 20% is "the scores are wrong". Every check is pass/fail with a
 * named consequence, and blockers are distinguished from warnings: a blocker means
 * do not publish.
 *
 *   npm run edition:readiness
 */

import { writeFileSync, mkdirSync, existsSync, appendFileSync } from 'fs';
import { join } from 'path';
import { getAllCaseStudies } from '../lib/case-studies';
import { scoredWorks, limitations, EDITION, craftCaptureGap } from '../lib/edition-01';
import { getHistory, isRebased } from '../lib/index-history';
import { RUBRIC_VERSION } from '../lib/signal-index';

type Level = 'blocker' | 'warn' | 'ok';
interface Check {
  id: string;
  level: Level;
  title: string;
  detail: string;
  /** What goes wrong if we ship with this unresolved. */
  consequence?: string;
}

const BASELINE = new Date(`${EDITION.baseline}T00:00:00Z`);
const now = new Date();
const daysLeft = Math.ceil((BASELINE.getTime() - now.getTime()) / 864e5);

const checks: Check[] = [];
const add = (c: Check) => checks.push(c);

const studies = getAllCaseStudies();
const works = scoredWorks();
const lim = limitations(works);
const gap = craftCaptureGap(works);
const history = getHistory();

/* ---------- 1. Every score is under the current rubric ---------- */
const stale = studies.filter(
  (c) => (c.decode?.length ?? 0) > 0 && c.rubricVersion !== RUBRIC_VERSION,
);
add(
  stale.length === 0
    ? { id: 'rubric', level: 'ok', title: 'All scores under the current rubric', detail: `${works.length} works at ${RUBRIC_VERSION}.` }
    : {
        id: 'rubric',
        level: 'blocker',
        title: `${stale.length} works are not scored under ${RUBRIC_VERSION}`,
        detail: stale.slice(0, 8).map((c) => c.slug).join(', '),
        consequence: 'The edition would publish a mixed-rubric ranking, which is not a ranking.',
      },
);

/* ---------- 2. Nothing rated on an event that has not happened ---------- */
// The AfroPlus/Dakar failure: a work scored months before the event it described.
const FUTURE_HINT = /\b(will (open|run|take place|be held)|scheduled for|takes place in|due to (open|run))\b/i;
const suspect = studies.filter((c) => {
  if ((c.decode?.length ?? 0) === 0) return false;
  const blob = [c.standfirst, ...(c.context ?? [])].join(' ');
  return FUTURE_HINT.test(blob);
});
add(
  suspect.length === 0
    ? { id: 'future', level: 'ok', title: 'No scored work reads as pre-event', detail: 'Nothing scored describes an event in the future tense.' }
    : {
        id: 'future',
        level: 'warn',
        title: `${suspect.length} scored works use pre-event phrasing — check each`,
        detail: suspect.slice(0, 6).map((c) => c.slug).join(', '),
        consequence: 'We already shipped two ratings for events that had not happened. The rubric now forbids it.',
      },
);

/* ---------- 3. Withheld works are stated, not silently absent ---------- */
const withheld = studies.filter((c) => (c.decode?.length ?? 0) === 0);
const badWithheld = withheld.filter((c) => !c.scoreWithheld?.trim());
add(
  badWithheld.length === 0
    ? { id: 'withheld', level: 'ok', title: 'Withheld scores are all explained', detail: `${withheld.length} withheld, each with a published reason.` }
    : {
        id: 'withheld',
        level: 'blocker',
        title: `${badWithheld.length} withheld works give no reason`,
        detail: badWithheld.map((c) => c.slug).join(', '),
        consequence: 'A headed section renders empty and reads as a bug.',
      },
);

/* ---------- 4. Evidence depth where the scores are harshest ---------- */
// Our lowest scores attract the most scrutiny and sit against the best-resourced
// legal teams. Thin sourcing there is where a challenge lands.
const harsh = works.filter((w) => w.levels.AUTHORSHIP <= 2);
const thin = harsh
  .map((w) => ({ w, sources: (studies.find((c) => c.slug === w.slug)?.sources ?? []).length }))
  .filter((x) => x.sources < 4);
add(
  thin.length === 0
    ? { id: 'evidence', level: 'ok', title: 'Harshest ratings are adequately sourced', detail: `${harsh.length} works at AUTHORSHIP ≤2, all with 4+ sources.` }
    : {
        id: 'evidence',
        level: 'blocker',
        title: `${thin.length} of the harshest ratings rest on under 4 sources`,
        detail: thin.map((x) => `${x.w.brand} (${x.sources})`).join(', '),
        consequence: 'We publish a low rating of a named company on thin evidence, then invite them to reply to it.',
      },
);

/* ---------- 5. Movement is honest ---------- */
add(
  isRebased()
    ? {
        id: 'movement',
        level: 'warn',
        title: 'No comparable prior snapshot — movement is suppressed',
        detail: `Latest snapshot crosses a basis change. ${history.length} snapshots on record.`,
        consequence: 'Correct behaviour, but the edition carries no deltas. The outlook mechanic is the movement story.',
      }
    : { id: 'movement', level: 'ok', title: 'Same-basis pair available — movement is reportable', detail: 'Deltas can be computed honestly.' },
);

/* ---------- 6. Forward view assigned ---------- */
const outlooks = studies.filter((c) => c.outlook && c.outlook.direction !== 'stable');
add(
  outlooks.length > 0
    ? { id: 'outlook', level: 'ok', title: `${outlooks.length} works carry a non-Stable outlook`, detail: 'Edition 01 has a forward-looking movement story.' }
    : {
        id: 'outlook',
        level: 'warn',
        title: 'No outlooks assigned',
        detail: 'Every work reads Stable.',
        consequence: 'With no comparable prior snapshot, the edition would carry no movement signal at all.',
      },
);

/* ---------- 7. The limitations we must disclose remain true ---------- */
add({
  id: 'limits',
  level: 'ok',
  title: 'Disclosed limitations (verify the copy still matches)',
  detail: `${lim.singleWorkShare}% of ${lim.brands} brands have one scored work · ${lim.ties.tiedWorks}/${lim.ties.total} works tie across ${lim.ties.distinctScores} distinct scores · lowest IDEA level is ${lim.lowestIdeaLevel} · craft-capture gap ${gap.gap.toFixed(2)}`,
});

/* ---------- 8. Operator actions that cannot be automated ---------- */
const T14 = new Date(BASELINE.getTime() - 14 * 864e5).toISOString().slice(0, 10);
const T21 = new Date(BASELINE.getTime() - 21 * 864e5).toISOString().slice(0, 10);
const T7 = new Date(BASELINE.getTime() - 7 * 864e5).toISOString().slice(0, 10);
const operator = [
  { by: T21, what: 'Embargoed send to the named press shortlist (7-day embargo, one fixed lift time, no exclusives).' },
  { by: T14, what: 'Notify every rated brand with right of reply. See docs/collateral/brand-notification-edition-01.md.' },
  { by: T7, what: 'Publish the methodology page alone, before the scores.' },
  { by: EDITION.baseline, what: 'Publish ungated; commit publicly to Edition 02’s date the same day.' },
];

/* ---------- Report ---------- */
const blockers = checks.filter((c) => c.level === 'blocker');
const warns = checks.filter((c) => c.level === 'warn');
const icon = (l: Level) => (l === 'blocker' ? '🔴' : l === 'warn' ? '🟡' : '✅');

const lines: string[] = [];
const say = (s: string) => { lines.push(s); console.log(s); };

say(`# Edition ${EDITION.number} readiness — ${now.toISOString().slice(0, 10)}`);
say('');
say(`**Baseline: ${EDITION.baseline} · ${daysLeft} days out · rubric ${RUBRIC_VERSION}**`);
say('');
say(
  blockers.length
    ? `🔴 **${blockers.length} blocker(s).** Not publishable today.`
    : warns.length
      ? `🟡 Publishable today, with ${warns.length} thing(s) to be aware of.`
      : '✅ No blockers and no warnings.',
);
say('');
for (const c of checks) {
  say(`${icon(c.level)} **${c.title}**`);
  say(`   ${c.detail}`);
  if (c.consequence && c.level !== 'ok') say(`   _If unresolved: ${c.consequence}_`);
}
say('');
say('## Operator actions (cannot be automated)');
for (const o of operator) {
  const due = Math.ceil((new Date(`${o.by}T00:00:00Z`).getTime() - now.getTime()) / 864e5);
  say(`- **${o.by}** (${due > 0 ? `in ${due}d` : `${Math.abs(due)}d ago`}) — ${o.what}`);
}
say('');
say(`_Scored works: ${works.length} · brands: ${lim.brands} · snapshots: ${history.length}_`);

mkdirSync(join(process.cwd(), 'output'), { recursive: true });
writeFileSync(
  join(process.cwd(), 'output/edition-readiness.json'),
  JSON.stringify(
    { generatedAt: now.toISOString(), baseline: EDITION.baseline, daysLeft, blockers: blockers.length, warnings: warns.length, checks, operator },
    null,
    2,
  ),
);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, lines.join('\n') + '\n');

// Blockers fail the run so the schedule surfaces them, rather than going green
// with problems buried in a log nobody opens.
if (blockers.length && process.env.EDITION_STRICT !== 'false') process.exit(1);
