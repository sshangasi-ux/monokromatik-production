// Tests for the Cultural-Signal Index math — the moat. Run with `npm test`
// (Node's built-in test runner via tsx, no extra deps).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AXIS_WEIGHTS, compositeScore, rankIndex, brandSlug, workSignal } from './signal-index';

// Helper: a full 4-axis decode at the given levels (1–5).
type Lvl = 1 | 2 | 3 | 4 | 5;
const decode = (idea: Lvl, authorship: Lvl, execution: Lvl, consequence: Lvl) => [
  { label: 'IDEA', level: idea, note: '' },
  { label: 'AUTHORSHIP', level: authorship, note: '' },
  { label: 'EXECUTION', level: execution, note: '' },
  { label: 'CONSEQUENCE', level: consequence, note: '' },
];

test('AXIS_WEIGHTS sum to 1.0', () => {
  const sum = Object.values(AXIS_WEIGHTS).reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(sum - 1) < 1e-9, `weights sum to ${sum}, expected 1`);
});

test('compositeScore: all 5s = 100, all 3s = 60', () => {
  assert.equal(compositeScore(decode(5, 5, 5, 5)), 100);
  assert.equal(compositeScore(decode(3, 3, 3, 3)), 60);
});

test('compositeScore: weighted example is exact', () => {
  // IDEA 5(.25) + AUTHORSHIP 4(.8×.35=.28) + EXECUTION 3(.6×.15=.09) + CONSEQUENCE 2(.4×.25=.10) = .72 → 72
  assert.equal(compositeScore(decode(5, 4, 3, 2)), 72);
});

test('compositeScore: AUTHORSHIP is weighted heaviest', () => {
  // With other axes equal, a high AUTHORSHIP must beat a high EXECUTION.
  const highAuthorship = compositeScore(decode(3, 5, 3, 3))!;
  const highExecution = compositeScore(decode(3, 3, 5, 3))!;
  assert.ok(highAuthorship > highExecution, `${highAuthorship} should exceed ${highExecution}`);
});

test('compositeScore: empty / undefined decode → null', () => {
  assert.equal(compositeScore([]), null);
  assert.equal(compositeScore(undefined), null);
});

test('rankIndex: orders by score desc with 1-based ranks; unscored excluded', () => {
  const cs = [
    { brand: 'Alpha', decode: decode(5, 5, 5, 5) }, // 100
    { brand: 'Bravo', decode: decode(3, 3, 3, 3) }, // 60
    { brand: 'Ghost', decode: [] }, // unscored → excluded
  ];
  const ranked = rankIndex(cs);
  assert.equal(ranked.length, 2);
  assert.equal(ranked[0].brand, 'Alpha');
  assert.equal(ranked[0].rank, 1);
  assert.equal(ranked[1].brand, 'Bravo');
  assert.equal(ranked[1].rank, 2);
});

test('rankIndex: a brand mean averages its works', () => {
  const ranked = rankIndex([
    { brand: 'Same', decode: decode(5, 5, 5, 5) }, // 100
    { brand: 'Same', decode: decode(3, 3, 3, 3) }, // 60
  ]);
  assert.equal(ranked.length, 1);
  assert.equal(ranked[0].score, 80); // mean of 100 and 60
  assert.equal(ranked[0].works, 2);
});

test('brandSlug: handles ×, &, /, punctuation and empties', () => {
  assert.equal(brandSlug('Rema × Diesel'), 'rema-diesel');
  assert.equal(brandSlug('Nike × Air Afrique'), 'nike-air-afrique');
  assert.equal(brandSlug('A & B / C'), 'a-b-c');
  assert.equal(brandSlug(''), 'unknown');
});

test('workSignal: returns score + axes ordered IDEA→AUTHORSHIP→EXECUTION→CONSEQUENCE', () => {
  const ws = workSignal({ decode: decode(5, 4, 3, 2) })!;
  assert.equal(ws.score, 72);
  assert.deepEqual(ws.axes.map((a) => a.label), ['IDEA', 'AUTHORSHIP', 'EXECUTION', 'CONSEQUENCE']);
});
