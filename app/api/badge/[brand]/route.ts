// Embeddable Cultural-Signal Index badge — an SVG a ranked brand can display on
// its own site. Each embed links back to MonoKromatik (manufactured backlinks +
// pre-qualified referral traffic — the G2 playbook). Served same-origin, cached.
//
//   <a href="https://www.monokromatik.com/intelligence/signal-index/<slug>">
//     <img src="https://www.monokromatik.com/api/badge/<slug>.svg" alt="..." />
//   </a>

import { getPublicCaseStudies } from '../../../../lib/case-studies';
import { rankIndex, brandSlug } from '../../../../lib/signal-index';

export const revalidate = 3600;

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function badgeSvg(brand: string, score: number, rank: number, total: number): string {
  // Soft cap + a clipPath on the name region so even very long brand names can't
  // run into the score block on the right.
  const name = brand.length > 26 ? `${brand.slice(0, 25)}…` : brand;
  const INK = '#141414';
  const AMBER = '#E8A33D';
  const BONE = '#F4F1EA';
  const MUTE = '#9A958C';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="340" height="120" viewBox="0 0 340 120" role="img" aria-label="${esc(brand)} — Cultural-Signal Index score ${score} out of 100, rank ${rank} of ${total}">
  <defs><clipPath id="name"><rect x="22" y="40" width="210" height="26"/></clipPath></defs>
  <rect width="340" height="120" rx="6" fill="${INK}"/>
  <rect x="0" y="0" width="6" height="120" fill="${AMBER}"/>
  <text x="26" y="30" font-family="'Helvetica Neue',Arial,sans-serif" font-size="10" font-weight="700" letter-spacing="2.2" fill="${AMBER}">CULTURAL-SIGNAL INDEX</text>
  <g clip-path="url(#name)"><text x="26" y="59" font-family="Georgia,'Times New Roman',serif" font-size="18" font-weight="700" fill="${BONE}">${esc(name)}</text></g>
  <text x="26" y="92" font-family="'Helvetica Neue',Arial,sans-serif" font-size="11" font-weight="700" letter-spacing="1.2" fill="${MUTE}">RANK #${rank} OF ${total}</text>
  <text x="316" y="74" text-anchor="end" font-family="'Helvetica Neue',Arial,sans-serif" font-size="46" font-weight="800" fill="${BONE}">${score}</text>
  <text x="316" y="94" text-anchor="end" font-family="'Helvetica Neue',Arial,sans-serif" font-size="9.5" font-weight="700" letter-spacing="1.4" fill="${MUTE}">/100 · MONOKROMATIK</text>
</svg>`;
}

export async function GET(_req: Request, { params }: { params: Promise<{ brand: string }> }) {
  const { brand: raw } = await params;
  const slug = raw.replace(/\.svg$/i, '');
  const ranked = rankIndex(getPublicCaseStudies());
  const entry = ranked.find((e) => brandSlug(e.brand) === slug);

  if (!entry) {
    return new Response('Not found', { status: 404 });
  }

  const svg = badgeSvg(entry.brand, entry.score, entry.rank!, ranked.length);
  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
