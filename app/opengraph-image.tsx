/**
 * Site-level default OG card. Used for the homepage, category pages,
 * and any route that doesn't define its own opengraph-image.
 */
import { renderOgCard } from '../lib/og-card';

export const runtime = 'nodejs';

export const alt = 'Monokromatik — The Intelligence Behind African Influence.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return renderOgCard({
    title: 'The Intelligence Behind African Influence.',
    category: 'Monokromatik Network',
  });
}
