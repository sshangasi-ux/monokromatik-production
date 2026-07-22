// Per-exhibit data download.
//
//   /api/exhibit/<key>          → CSV (the default; what a journalist wants)
//   /api/exhibit/<key>?format=json
//
// Keyed by the same string that numbers the exhibit, so a link on the page and
// the download it points at can never disagree. This is the OWID move — the data
// lives at a predictable suffix off the thing that displays it — and it is the
// single highest-leverage citability primitive we have.

import { exhibitTable, exhibitCsv } from '../../../../lib/exhibit-data';
import { EXHIBIT_ORDER } from '../../../components/dataviz/EditionExhibit';
import type { ExhibitKey } from '../../../../lib/edition-01-chapters';

export const revalidate = 3600;

export function generateStaticParams() {
  return EXHIBIT_ORDER.map((key) => ({ key }));
}

export async function GET(req: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key: raw } = await params;
  // Tolerate a .csv suffix so /api/exhibit/universe.csv also works.
  const key = raw.replace(/\.(csv|json)$/i, '') as ExhibitKey;

  if (!EXHIBIT_ORDER.includes(key)) {
    return new Response('Unknown exhibit', { status: 404 });
  }

  const table = exhibitTable(key);
  if (!table) {
    // A valid key with no data yet (e.g. rebase before a v2.0 snapshot exists).
    return new Response('No data for this exhibit', { status: 404 });
  }

  const format = new URL(req.url).searchParams.get('format');
  if (format === 'json') {
    return Response.json(table, {
      headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800' },
    });
  }

  return new Response(exhibitCsv(table), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="monokromatik-edition-01-${key}.csv"`,
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
