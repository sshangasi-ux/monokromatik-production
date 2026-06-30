/**
 * The Index "drop" share-card — Movers since the last snapshot. Auto-wired as
 * the og:image for /intelligence/signal-index/movers, so the recurring reveal
 * ("the Index just dropped") travels as a single shareable image.
 */
import { renderMoversCard } from '../../../../lib/og-card';
import { getMovers } from '../../../../lib/index-history';

export const runtime = 'nodejs';
export const alt = 'What moved on the Cultural-Signal Index — MonoKromatik';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  const movers = getMovers(5);
  const list = [
    ...movers.climbers.map((m) => ({ brand: m.brand, score: m.score, scoreDelta: m.scoreDelta, isNew: false })),
    ...movers.newcomers.map((m) => ({ brand: m.brand, score: m.score, scoreDelta: 0, isNew: true })),
  ].slice(0, 5);
  return renderMoversCard({ since: movers.since, movers: list });
}
