/**
 * Per-brand Cultural-Signal Index share-card. Next.js auto-wires this into the
 * brand page's <meta property="og:image"> by file convention:
 *   app/intelligence/signal-index/[brand]/opengraph-image.tsx
 * So when a ranked brand (or anyone) shares its Index page, the unfurl is a
 * screenshot-perfect score card — the artifact that turns every ranked brand
 * into a distributor.
 */
import { renderIndexCard } from '../../../../lib/og-card';
import { getAllCaseStudies } from '../../../../lib/case-studies';
import { rankWorks, brandSlug, AXIS_LABELS } from '../../../../lib/signal-index';
import { getMovement } from '../../../../lib/index-history';
import { brandEvidence } from '../../../../lib/evidence-strength';

// Node runtime: lib/case-studies + lib/index-history read from disk.
export const runtime = 'nodejs';

export const alt = 'Cultural-Signal Index score — MonoKromatik';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params;
  // Rank over ALL scored works — must match the Index page and the brand page,
  // or a shared card reports a different rank than the page it links to.
  const ranked = rankWorks(getAllCaseStudies());
  const entry = ranked.find((e) => e.brandSlug === brand);

  if (!entry) {
    // Fallback for stale slugs — never 500 the unfurl. Render a neutral house
    // card: the old fallback rendered the TOP-RANKED brand's card, so an unknown
    // slug unfurled as another brand's score. Attributing one brand's rating to
    // another is the worst failure this surface can have.
    return renderIndexCard({
      brand: 'The Cultural-Signal Index',
      score: 0,
      rank: 0,
      total: ranked.length || 1,
    });
  }

  const movement = getMovement(brand);
  const works = getAllCaseStudies().filter((c) => brandSlug(c.brand) === brand);
  const evidence = brandEvidence(works);
  return renderIndexCard({
    brand: entry.brand,
    score: entry.score,
    rank: entry.rank,
    total: ranked.length,
    scoreDelta: movement?.scoreDelta ?? null,
    axes: AXIS_LABELS.map((label) => ({ label, level: entry.levels[label] ?? 0 })),
    evidence: { score: evidence.score, tier: evidence.tier },
  });
}
