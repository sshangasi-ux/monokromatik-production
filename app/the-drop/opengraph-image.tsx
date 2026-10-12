/**
 * OG image for /the-drop — so a forwarded link renders a branded "The Drop"
 * card on WhatsApp, LinkedIn and iMessage (the whole point of the digest:
 * it travels as a designed object, not a bare URL). Reuses the shared card.
 */
import { renderOgCard } from '../../lib/og-card';

export const runtime = 'nodejs';

export const alt = 'The Drop — the week in African ownership | MonoKromatik';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return renderOgCard({
    title: 'The Drop',
    category: 'The week in African ownership',
  });
}
