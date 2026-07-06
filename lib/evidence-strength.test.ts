// Tests for Evidence Strength — the MEASURED anchor beside the editorial score.
// Run with `npm test` (Node's built-in runner via tsx).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { brandEvidence, evidenceByBrand, type EvidenceTier } from './evidence-strength';

// Minimal work shape the metric reads (evidence + sources + verification).
type V = 'verified' | 'partial' | 'interpretive';
const work = (confirmed: number, reported: number, sources: number, verification: V = 'partial') => ({
  evidence: { confirmed: Array(confirmed).fill('x'), reported: Array(reported).fill('x'), notClaimed: [] },
  sources: Array(sources).fill({ label: 's', url: 'u' }),
  verification,
});

test('empty evidence → score 0, Developing tier', () => {
  const e = brandEvidence([work(0, 0, 0, 'interpretive')]);
  assert.equal(e.score, 0);
  assert.equal(e.tier, 'Developing');
});

test('score is deterministic and monotonic in corroboration', () => {
  const thin = brandEvidence([work(0, 1, 1, 'interpretive')]).score;
  const mid = brandEvidence([work(2, 3, 4, 'partial')]).score;
  const strong = brandEvidence([work(5, 2, 8, 'verified')]).score;
  assert.ok(thin < mid && mid < strong, `expected ${thin} < ${mid} < ${strong}`);
  // Deterministic: same input → same output.
  assert.equal(brandEvidence([work(2, 3, 4, 'partial')]).score, mid);
});

test('score is bounded to 0–100 even with heavy corroboration', () => {
  const e = brandEvidence(Array(10).fill(0).map(() => work(9, 9, 20, 'verified')));
  assert.ok(e.score >= 0 && e.score <= 100, `score ${e.score} out of range`);
});

test('tiers map from the score (Strong ≥75, Moderate ≥45, else Developing)', () => {
  const tier = (c: number, r: number, s: number, v: V): EvidenceTier => brandEvidence([work(c, r, s, v)]).tier;
  assert.equal(tier(0, 1, 1, 'interpretive'), 'Developing');
  assert.equal(tier(6, 3, 10, 'verified'), 'Strong');
});

test('counts aggregate across a brand’s works', () => {
  const e = brandEvidence([work(2, 1, 3, 'verified'), work(1, 2, 2, 'partial')]);
  assert.equal(e.confirmed, 3);
  assert.equal(e.reported, 3);
  assert.equal(e.sources, 5);
  assert.equal(e.verifiedWorks, 1);
  assert.equal(e.works, 2);
});

test('evidenceByBrand keys by brand slug', () => {
  const cs = [
    { brand: 'Nike × Air Afrique', ...work(3, 1, 4, 'verified') },
    { brand: 'Nike × Air Afrique', ...work(1, 0, 2, 'partial') },
    { brand: 'Tyla', ...work(0, 1, 1, 'interpretive') },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ] as any[];
  const map = evidenceByBrand(cs);
  assert.equal(map.get('nike-air-afrique')?.works, 2);
  assert.equal(map.get('tyla')?.works, 1);
});
