// Every surface that states a brand's Index position must rank over the SAME
// universe of works. Four surfaces do it: the Index page, the brand page, the
// embeddable badge (/api/badge/<slug>.svg) and the OG/Twitter share cards.
//
// Why this file exists: the badge and share cards ranked over
// getPublicCaseStudies() while the pages ranked over getAllCaseStudies(). The
// RATINGS are public even where the analysis is gated, so the public-only call
// was a different, smaller Index — it 404'd the badge for 25 of 69 brands
// (including ranks #1–#4, Ethiopian Airlines among them) and gave every
// remaining brand a rank computed out of 44 instead of 69. The badge is the
// backlink asset: a brand embeds it on its own site, so a wrong rank is a wrong
// claim published under our name.
//
// These tests assert the invariant, not the specific numbers, so they keep
// holding as works are added and re-scored.

import test from 'node:test';
import assert from 'node:assert/strict';
import { getAllCaseStudies, getPublicCaseStudies } from './case-studies';
import { rankIndex, rankWorks, brandSlug } from './signal-index';

// The canonical ranking — what /intelligence/signal-index publishes. THE INDEX
// RANKS WORK, so this is the work-level ranking. The brand roll-up still exists
// for the per-brand pages but it is not the Index.
const canonical = rankWorks(getAllCaseStudies());
const brandRollup = rankIndex(getAllCaseStudies());

test('the canonical Index ranks every scored work, and only scored works', () => {
  const scored = getAllCaseStudies().filter((c) => (c.decode?.length ?? 0) > 0).map((c) => c.slug);
  const ranked = new Set(canonical.map((e) => e.slug));
  for (const slug of scored) assert.ok(ranked.has(slug), `${slug} is scored but not ranked`);
  assert.equal(canonical.length, scored.length, 'ranked count must equal scored-work count');
  // A withheld work (decode: []) must never appear — it has no score to rank.
  const withheld = getAllCaseStudies().filter((c) => (c.decode?.length ?? 0) === 0).map((c) => c.slug);
  for (const slug of withheld) assert.ok(!ranked.has(slug), `${slug} is withheld but was ranked`);
});

test('every brand in the roll-up is represented by at least one ranked work', () => {
  const workBrands = new Set(canonical.map((e) => e.brandSlug));
  for (const b of brandRollup) {
    assert.ok(workBrands.has(brandSlug(b.brand)), `${b.brand} is in the roll-up but has no ranked work`);
  }
});

test('a public-only ranking is NOT the Index — badges must not use it', () => {
  // This is the trap, asserted explicitly so the difference stays visible: if
  // these ever became equal the guard below would pass vacuously.
  const pub = rankIndex(getPublicCaseStudies());
  if (pub.length === canonical.length) return; // nothing gated right now — fine
  assert.ok(
    pub.length < canonical.length,
    'public-only ranking should be a strict subset while premium works exist',
  );
});

test('every brand resolves a badge showing its BEST work at the site rank', async () => {
  // Calls the ACTUAL route handler — not a re-implementation of it. A test that
  // recomputes the ranking itself would pass no matter what the route does,
  // which is exactly how this bug survived.
  const { GET } = await import('../app/api/badge/[brand]/route');

  // One badge per brand, reporting that brand's highest-ranked work.
  const seen = new Set<string>();
  for (const e of canonical) {
    if (seen.has(e.brandSlug)) continue; // canonical is score-sorted, so first = best
    seen.add(e.brandSlug);
    const res = await GET(new Request(`https://x/api/badge/${e.brandSlug}.svg`), {
      params: Promise.resolve({ brand: `${e.brandSlug}.svg` }),
    });
    assert.equal(res.status, 200, `badge 404s for ${e.brandSlug} (best work #${e.rank})`);
    const svg = await res.text();
    // The badge prints "RANK #n OF total" and the score — both must match the site.
    assert.match(svg, new RegExp(`RANK #${e.rank} OF ${canonical.length}\\b`), `badge rank/total wrong for ${e.brandSlug}`);
    assert.match(svg, new RegExp(`>${e.score}</text>`), `badge score wrong for ${e.brandSlug}`);
  }
});

test('an unknown slug 404s rather than serving another brand a badge', async () => {
  const { GET } = await import('../app/api/badge/[brand]/route');
  const res = await GET(new Request('https://x/api/badge/not-a-brand.svg'), {
    params: Promise.resolve({ brand: 'not-a-brand.svg' }),
  });
  assert.equal(res.status, 404);
});

test('ranks are a dense 1..N sequence with no gaps or duplicates', () => {
  const ranks = canonical.map((e) => e.rank!).sort((a, b) => a - b);
  assert.deepEqual(
    ranks,
    Array.from({ length: canonical.length }, (_, i) => i + 1),
    'rank sequence must be 1..N exactly — a badge prints "RANK #x OF N"',
  );
});

test('work slugs are unique — two works must not share an Index row', () => {
  const seen = new Set<string>();
  for (const e of canonical) {
    assert.ok(!seen.has(e.slug), `duplicate work slug in the Index: ${e.slug}`);
    seen.add(e.slug);
  }
});
