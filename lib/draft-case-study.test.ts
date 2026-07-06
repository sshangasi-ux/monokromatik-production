// Tests for the case-study drafter's pure core — assembly + fail-closed
// validation. The API call itself is covered by a CI dry-run, not here.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractJson, assembleCaseStudy, validateDraft, AXES } from './draft-case-study';

const STAMP = '2026-07-06T00:00:00.000Z';

// A complete, valid raw draft.
const goodRaw = {
  title: 'Maison Test × Lagos: authorship as the product',
  brand: 'Maison Test × Lagos',
  standfirst: 'A decode of a real African-authored brand move.',
  collection: 'African-Authored Brand Moves',
  market: 'Nigeria · Diaspora',
  tags: ['fashion', 'lagos', 'authorship'],
  decode: [
    { label: 'IDEA', level: 5, note: 'Sharp, original idea.' },
    { label: 'AUTHORSHIP', level: 4, note: 'African creatives held the pen.' },
    { label: 'EXECUTION', level: 4, note: 'Crafted across touchpoints.' },
    { label: 'CONSEQUENCE', level: 3, note: 'Early but measurable shift.' },
  ],
  context: ['It happened, and here is why it matters.'],
  strategicBet: ['The bet being made.'],
  creativeMove: ['The craft move.'],
  africanRead: ['Who shaped it and who captured value.'],
  evidence: { confirmed: ['Fact A corroborated.', 'Fact B corroborated.'], reported: ['A single-source claim.'], notClaimed: ['No audited revenue.'] },
  lessons: [{ title: 'Own the pen.', body: 'Authorship is the moat.' }],
  pullQuotes: ['A sharp line.'],
  sources: [
    { publisher: 'Outlet One', label: 'Headline one', href: 'https://example.com/one', use: 'establishes the launch' },
    { publisher: 'Outlet Two', label: 'Headline two', href: 'https://example.com/two', use: 'corroborates' },
  ],
  verificationNote: 'Launch and authorship confirmed across two outlets; figures reported only.',
};

test('extractJson tolerates code fences and surrounding prose', () => {
  const wrapped = 'Here you go:\n```json\n{"a":1,"b":"x"}\n```\nDone.';
  assert.deepEqual(extractJson(wrapped), { a: 1, b: 'x' });
  assert.deepEqual(extractJson('{"a":2}'), { a: 2 });
  assert.equal(extractJson('no json here'), null);
});

test('assembleCaseStudy builds a schema-complete study and hard-sets verification=partial', () => {
  const cs = assembleCaseStudy(goodRaw, STAMP)!;
  assert.ok(cs);
  assert.equal(cs.verification, 'partial'); // never model-chosen
  assert.equal(cs.access, 'public');
  assert.equal(cs.publishedAt, STAMP);
  assert.equal(cs.slug, 'maison-test-lagos-authorship-as-the-product');
  assert.equal(cs.decode.length, 4);
  assert.deepEqual(cs.decode.map((d) => d.label), [...AXES]); // canonical order
  assert.equal(cs.media.length, 0);
  assert.match(cs.readingTime ?? '', /MIN READ$/);
});

test('a model-supplied verification field is ignored (cannot inflate to verified)', () => {
  const cs = assembleCaseStudy({ ...goodRaw, verification: 'verified' }, STAMP)!;
  assert.equal(cs.verification, 'partial');
});

test('validateDraft passes a complete draft', () => {
  const cs = assembleCaseStudy(goodRaw, STAMP);
  const v = validateDraft(cs, new Set());
  assert.ok(v.ok, `expected ok, got: ${v.reasons.join('; ')}`);
});

test('validateDraft rejects a brand already on the Index', () => {
  const cs = assembleCaseStudy(goodRaw, STAMP);
  const v = validateDraft(cs, new Set(['maison-test-lagos']));
  assert.equal(v.ok, false);
  assert.ok(v.reasons.some((r) => /already scored/.test(r)));
});

test('validateDraft rejects fewer than 2 sources', () => {
  const cs = assembleCaseStudy({ ...goodRaw, sources: goodRaw.sources.slice(0, 1) }, STAMP);
  const v = validateDraft(cs, new Set());
  assert.equal(v.ok, false);
  assert.ok(v.reasons.some((r) => /≥2 sources/.test(r)));
});

test('validateDraft rejects a missing axis', () => {
  const cs = assembleCaseStudy({ ...goodRaw, decode: goodRaw.decode.slice(0, 3) }, STAMP);
  const v = validateDraft(cs, new Set());
  assert.equal(v.ok, false);
  assert.ok(v.reasons.some((r) => /four axes/.test(r)));
});

test('validateDraft rejects thin evidence and empty dimensions', () => {
  const thin = assembleCaseStudy({ ...goodRaw, evidence: { confirmed: [], reported: [], notClaimed: [] }, context: [] }, STAMP);
  const v = validateDraft(thin, new Set());
  assert.equal(v.ok, false);
  assert.ok(v.reasons.some((r) => /evidence/.test(r)));
  assert.ok(v.reasons.some((r) => /empty context/.test(r)));
});

test('normalizeSources drops non-http hrefs', () => {
  const cs = assembleCaseStudy({ ...goodRaw, sources: [...goodRaw.sources.slice(0, 1), { publisher: 'X', label: 'y', href: 'not-a-url' }] }, STAMP)!;
  assert.equal(cs.sources.length, 1);
});
