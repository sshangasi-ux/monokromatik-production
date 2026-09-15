/**
 * Per-report OG image. Next.js auto-wires this into the report page's
 * <meta property="og:image"> tag based on file location convention:
 *   app/reports/[slug]/opengraph-image.tsx
 * is exposed at:
 *   /reports/[slug]/opengraph-image
 *
 * Mirrors app/article/[id]/opengraph-image.tsx so a shared report link (esp.
 * on LinkedIn) shows a branded, title-specific card instead of the generic
 * site image. Cached until the report content changes.
 */
import { renderOgCard } from '../../../lib/og-card';
import { getReportBySlug } from '../../../lib/reports';

// Node runtime — lib/reports reads reports.json from disk via `fs`.
export const runtime = 'nodejs';

export const alt = 'MonoKromatik Network';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const report = getReportBySlug(slug);

  if (!report) {
    return renderOgCard({
      title: 'MonoKromatik Network',
      category: 'Intelligence Report',
    });
  }

  return renderOgCard({
    title: report.title,
    category: report.series,
  });
}
