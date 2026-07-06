/**
 * Twitter-specific Cultural-Signal Index share-card. Twitter prefers
 * `twitter:image` when present — same visual as opengraph-image, separate file
 * by Next.js convention.
 */
import { renderIndexCard } from '../../../../lib/og-card';
import { getPublicCaseStudies } from '../../../../lib/case-studies';
import { rankIndex, brandSlug, AXIS_LABELS } from '../../../../lib/signal-index';
import { getMovement } from '../../../../lib/index-history';
import { brandEvidence } from '../../../../lib/evidence-strength';

export const runtime = 'nodejs';

export const alt = 'Cultural-Signal Index score — MonoKromatik';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params;
  const ranked = rankIndex(getPublicCaseStudies());
  const entry = ranked.find((e) => brandSlug(e.brand) === brand);

  if (!entry) {
    const top = ranked[0];
    return renderIndexCard({
      brand: top?.brand ?? 'MonoKromatik',
      score: top?.score ?? 0,
      rank: top?.rank ?? 1,
      total: ranked.length || 1,
    });
  }

  const movement = getMovement(brand);
  const works = getPublicCaseStudies().filter((c) => brandSlug(c.brand) === brand);
  const evidence = brandEvidence(works);
  return renderIndexCard({
    brand: entry.brand,
    score: entry.score,
    rank: entry.rank!,
    total: ranked.length,
    scoreDelta: movement?.scoreDelta ?? null,
    axes: AXIS_LABELS.map((label) => ({ label, level: entry.axisAverages[label] ?? 0 })),
    evidence: { score: evidence.score, tier: evidence.tier },
  });
}
