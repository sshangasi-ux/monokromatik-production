// Public Cultural-Signal Index data feed — the machine-readable face of the Index.
// The scores are public; this makes them citable and consumable (JSON for apps/AI
// engines, CSV for analysts/spreadsheets). The licensed tiers add the refresh
// cadence, segmentation and team rights — this open endpoint is the on-ramp.
//
//   GET /api/index            → JSON (ranking + axes + movement + methodology)
//   GET /api/index?format=csv → CSV (one row per ranked brand)

import { getPublicCaseStudies } from '../../../lib/case-studies';
import { rankIndex, brandSlug, AXIS_WEIGHTS, AXIS_LABELS } from '../../../lib/signal-index';
import { getMovement, isNewlyRanked, trackingSince } from '../../../lib/index-history';

export const revalidate = 300;

const SITE = 'https://www.monokromatik.com';
const CACHE = 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400';

function buildRows() {
  const ranked = rankIndex(getPublicCaseStudies());
  return ranked.map((e) => {
    const slug = brandSlug(e.brand);
    const movement = getMovement(slug);
    const axes: Record<string, number> = {};
    for (const ax of AXIS_LABELS) axes[ax] = e.axisAverages[ax] ?? 0;
    return {
      rank: e.rank!,
      brand: e.brand,
      slug,
      score: e.score,
      works: e.works,
      axes,
      movement,
      newlyRanked: isNewlyRanked(slug),
      url: `${SITE}/intelligence/signal-index/${slug}`,
    };
  });
}

function csvEscape(v: string | number): string {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(req: Request) {
  const rows = buildRows();
  const format = new URL(req.url).searchParams.get('format');

  if (format === 'csv') {
    const header = ['rank', 'brand', 'slug', 'score', 'works', 'idea', 'authorship', 'execution', 'consequence', 'score_delta', 'rank_delta', 'url'];
    const lines = rows.map((r) =>
      [
        r.rank, r.brand, r.slug, r.score, r.works,
        r.axes.IDEA, r.axes.AUTHORSHIP, r.axes.EXECUTION, r.axes.CONSEQUENCE,
        r.movement?.scoreDelta ?? '', r.movement?.rankDelta ?? '', r.url,
      ].map(csvEscape).join(',')
    );
    const csv = [header.join(','), ...lines].join('\n') + '\n';
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="cultural-signal-index.csv"',
        'Cache-Control': CACHE,
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  const body = {
    name: 'The Cultural-Signal Index',
    description:
      'An authorship-weighted ranking of how brand and cultural work scores on African creative idea, authorship, execution and consequence.',
    version: '1.0',
    documentation: `${SITE}/intelligence/signal-index/api`,
    terms: 'Free to use and cite with attribution to MonoKromatik and a link to the source page. Licensed tiers add refresh cadence, history, segmentation and team rights.',
    publisher: { name: 'MonoKromatik', url: SITE },
    url: `${SITE}/intelligence/signal-index`,
    license: `${SITE}/intelligence/license`,
    methodology: {
      scale: '0–100 composite, authorship-weighted; each axis scored 1–5',
      axes: AXIS_LABELS.map((label) => ({ label, weight: AXIS_WEIGHTS[label] })),
      note: 'Interpretive editorial judgement — defensible and evidence-led, not a measured market metric. Axis levels are set by editors.',
      reference: `${SITE}/intelligence/signal-index/methodology`,
    },
    generatedAt: new Date().toISOString(),
    trackingSince: trackingSince(),
    count: rows.length,
    index: rows,
  };

  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': CACHE,
      'Access-Control-Allow-Origin': '*',
    },
  });
}
