/**
 * Site-level Twitter card. Same visual as opengraph-image.tsx.
 */
import { renderOgCard } from '../lib/og-card';

export const runtime = 'nodejs';

export const alt = 'Monokromatik — African Culture. Global Influence. Brand Intelligence.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return renderOgCard({
    title: 'African Culture. Global Influence. Brand Intelligence.',
    category: 'Monokromatik Network',
  });
}
