/**
 * Site-level Twitter card. Same visual as opengraph-image.tsx.
 */
import { renderOgCard } from '../lib/og-card';

export const runtime = 'nodejs';

export const alt = 'MonoKromatik Network — African Stories BBC Won\'t Tell You';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return renderOgCard({
    title: 'African Stories BBC Won\'t Tell You',
    category: 'MonoKromatik Network',
  });
}
