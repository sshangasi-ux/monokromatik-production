// Guards the outlook mechanic — specifically the part that costs us something.
//
// An outlook is a public, dated, falsifiable claim about our own judgement. The
// only thing that makes it worth publishing is that a later edition can mark it.
// These tests protect the marking rules, because a hit rate is trivial to inflate
// by accident: count unresolved calls as hits, or let Stable always "win", and
// the number becomes marketing.

import test from 'node:test';
import assert from 'node:assert/strict';
import { scoreOutlook, outlookDistribution, onWatch, OUTLOOK_DEFINITIONS, type Outlook } from './outlook';
import { getAllCaseStudies } from './case-studies';

const at = (direction: Outlook['direction'], watch = false): Outlook => ({
  direction,
  assignedOn: '2026-07-21',
  rationale: 'x'.repeat(50),
  watch,
});

test('a rise vindicates Positive and refutes Negative', () => {
  assert.equal(scoreOutlook(at('positive'), 70, 80), 'hit');
  assert.equal(scoreOutlook(at('negative'), 70, 80), 'miss');
});

test('a fall vindicates Negative and refutes Positive', () => {
  assert.equal(scoreOutlook(at('negative'), 70, 60), 'hit');
  assert.equal(scoreOutlook(at('positive'), 70, 60), 'miss');
});

test('Stable is marked, not assumed — a move against Stable is a miss', () => {
  // The easiest way to fake a good hit rate is to let the default always pass.
  assert.equal(scoreOutlook(at('stable'), 70, 70), 'hit');
  assert.equal(scoreOutlook(at('stable'), 70, 75), 'miss');
  assert.equal(scoreOutlook(at('stable'), 70, 65), 'miss');
});

test('Developing is only vindicated by actual movement', () => {
  assert.equal(scoreOutlook(at('developing'), 70, 75), 'hit');
  assert.equal(scoreOutlook(at('developing'), 70, 65), 'hit');
  assert.equal(scoreOutlook(at('developing'), 70, 70), 'miss', 'total stillness refutes "could go either way"');
});

test('an unmoved directional call is UNRESOLVED, never a hit', () => {
  // Counting "no movement yet" as a win is how a forecast record gets inflated.
  assert.equal(scoreOutlook(at('positive'), 70, 70), 'unresolved');
  assert.equal(scoreOutlook(at('negative'), 70, 70), 'unresolved');
});

test('an undated outlook cannot be marked at all', () => {
  const undated = { direction: 'positive', assignedOn: '', rationale: 'x' } as Outlook;
  assert.equal(scoreOutlook(undated, 70, 90), 'unresolved');
  assert.equal(scoreOutlook(null, 70, 90), 'unresolved');
});

test('every published outlook carries a date and a real trigger', () => {
  for (const c of getAllCaseStudies()) {
    if (!c.outlook) continue;
    assert.match(c.outlook.assignedOn, /^\d{4}-\d{2}-\d{2}$/, `${c.slug} outlook has no assigned date`);
    assert.ok(
      c.outlook.rationale.trim().length >= 40,
      `${c.slug} outlook rationale is too thin to be marked later`,
    );
    assert.ok(
      (c.decode?.length ?? 0) > 0,
      `${c.slug} has an outlook but no score — nothing to move`,
    );
    if (c.outlook.watch) {
      assert.notEqual(c.outlook.direction, 'stable', `${c.slug}: Stable cannot be on watch`);
    }
  }
});

test('the distribution covers every work exactly once', () => {
  const scored = getAllCaseStudies().filter((c) => (c.decode?.length ?? 0) > 0);
  const dist = outlookDistribution(scored);
  assert.equal(dist.length, OUTLOOK_DEFINITIONS.length);
  assert.equal(
    dist.reduce((s, d) => s + d.count, 0),
    scored.length,
    'every scored work must fall in exactly one outlook bucket (unassigned = stable)',
  );
});

test('onWatch returns only works that actually assert the 90-day threshold', () => {
  const scored = getAllCaseStudies().filter((c) => (c.decode?.length ?? 0) > 0);
  for (const w of onWatch(scored)) assert.equal(w.outlook?.watch, true);
});
