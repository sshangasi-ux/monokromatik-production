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
import { rankIndex, brandSlug } from './signal-index';

// The canonical ranking — what /intelligence/signal-index publishes.
const canonical = rankIndex(getAllCaseStudies());

test('the canonical Index ranks every brand that has a scored work', () => {
  const scored = new Set(
    getAllCaseStudies().filter((c) => (c.decode?.length ?? 0) > 0).map((c) => brandSlug(c.brand)),
  );
  const ranked = new Set(canonical.map((e) => brandSlug(e.brand)));
  for (const slug of scored) assert.ok(ranked.has(slug), `${slug} has a scored work but is not ranked`);
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

test('every ranked brand resolves a real badge, at the rank the site shows', async () => {
  // Calls the ACTUAL route handler — not a re-implementation of it. A test that
  // recomputes the ranking itself would pass no matter what the route does,
  // which is exactly how this bug survived.
  const { GET } = await import('../app/api/badge/[brand]/route');

  for (const e of canonical) {
    const slug = brandSlug(e.brand);
    const res = await GET(new Request(`https://x/api/badge/${slug}.svg`), {
      params: Promise.resolve({ brand: `${slug}.svg` }),
    });
    assert.equal(res.status, 200, `badge 404s for ranked brand ${slug} (#${e.rank})`);
    const svg = await res.text();
    // The badge prints "RANK #n OF total" and the score — both must match the site.
    assert.match(svg, new RegExp(`RANK #${e.rank} OF ${canonical.length}\\b`), `badge rank/total wrong for ${slug}`);
    assert.match(svg, new RegExp(`>${e.score}</text>`), `badge score wrong for ${slug}`);
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

test('brand slugs are unique — two brands must not share a badge URL', () => {
  const seen = new Map<string, string>();
  for (const e of canonical) {
    const slug = brandSlug(e.brand);
    const prior = seen.get(slug);
    assert.equal(prior, undefined, `slug collision: "${e.brand}" and "${prior}" both → /api/badge/${slug}.svg`);
    seen.set(slug, e.brand);
  }
});
