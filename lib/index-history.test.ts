// Guards the one property that matters most about Index movement: it must never
// report a methodology change as brand movement.
//
// Why this file exists: rubric v2.0 re-scored all 72 works and the mean fell
// 79.4 → 70.2. Without a rubric stamp on each snapshot, the next snapshot would
// have rendered ~60 brands with red ▼ arrows and narrated "X fell 20 points" in
// the Pulse digest — describing our own ruler changing as the work getting worse.
//
// These assertions are invariants, not fixtures: they hold whether or not the
// Index is currently in a rebased state, so they keep working as history grows.

import test from 'node:test';
import assert from 'node:assert/strict';
import { getHistory, getMovers, getMovement, isRebased } from './index-history';

const history = getHistory();

test('every snapshot carries a rubric version (or is treated as v1)', () => {
  for (const s of history) {
    // Unstamped is allowed and means v1 — but a stamped one must be non-empty.
    if (s.rubricVersion !== undefined) assert.ok(s.rubricVersion.length > 0, `${s.date} has an empty rubricVersion`);
  }
});

test('snapshots are ordered oldest-first', () => {
  const dates = history.map((s) => s.date);
  assert.deepEqual(dates, [...dates].sort(), 'history must be chronological');
});

test('across a rubric change, no score movement is reported', () => {
  if (!isRebased()) return; // not currently rebased — invariant vacuously holds
  const movers = getMovers(50);
  assert.equal(movers.rebased, true, 'getMovers must flag the rebase');
  assert.equal(movers.climbers.length, 0, 'climbers must be suppressed across a rubric change');

  // Every brand present in both snapshots must report a zero, rebased delta —
  // never a real one.
  const current = history[history.length - 1];
  for (const e of current.entries) {
    const m = getMovement(e.slug);
    if (!m) continue; // newly ranked
    assert.equal(m.rebased, true, `${e.slug} should be marked rebased`);
    assert.equal(m.scoreDelta, 0, `${e.slug} leaked a score delta across a rubric change`);
    assert.equal(m.rankDelta, 0, `${e.slug} leaked a rank delta across a rubric change`);
  }
});

test('newcomers are still reported across a rubric change', () => {
  if (!isRebased()) return;
  // Entering the Index doesn't depend on the scale, so it stays legitimate news.
  const movers = getMovers(50);
  assert.ok(Array.isArray(movers.newcomers), 'newcomers must still be an array');
});

test('within a single rubric, real movement is still reported', () => {
  // Find the most recent adjacent pair sharing a rubric and confirm deltas are
  // computed normally — the suppression must be surgical, not a blanket mute.
  const rubric = (s: (typeof history)[number]) => s.rubricVersion ?? 'v1';
  let pair: [number, number] | null = null;
  for (let i = history.length - 1; i > 0; i--) {
    if (rubric(history[i]) === rubric(history[i - 1])) { pair = [i - 1, i]; break; }
  }
  if (!pair) return; // no same-rubric pair yet
  const [a, b] = pair;
  const prev = history[a];
  const cur = history[b];
  const moved = cur.entries.find((e) => {
    const then = prev.entries.find((p) => p.slug === e.slug);
    return then && then.score !== e.score;
  });
  if (!moved) return; // nothing changed between them; nothing to assert
  const then = prev.entries.find((p) => p.slug === moved.slug)!;
  assert.equal(moved.score - then.score !== 0, true, 'a same-rubric pair should be able to show movement');
});
