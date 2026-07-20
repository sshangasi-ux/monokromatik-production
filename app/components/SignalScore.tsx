// The Cultural-Signal Score atom — a recognisable /100 chip. `sm` for cards,
// `lg` for the case-study decode headline. See docs/CULTURAL_SIGNAL_INDEX.md.

import { signalBand } from '../../lib/signal-index';

export default function SignalScore({
  score,
  size = 'sm',
  className = '',
}: {
  score: number;
  size?: 'sm' | 'lg';
  className?: string;
}) {
  const big = size === 'lg';
  // The letter band is the rating-agency read of the same number. Brand Finance,
  // Interbrand, Kantar and YouGov all publish a score and none publishes the
  // cut-offs behind it; ours are fixed, published and versioned. Showing the band
  // next to the number is what reads as "rating" rather than "review score".
  const band = signalBand(score);
  return (
    <span
      className={`shrink-0 text-right leading-none ${className}`}
      title={band ? `Cultural-Signal Score: ${score}/100 — ${band.band} (${band.label})` : `Cultural-Signal Score: ${score}/100`}
      aria-label={band ? `Cultural-Signal Score ${score} out of 100, band ${band.band}` : `Cultural-Signal Score ${score} out of 100`}
    >
      <span className={`block font-display font-bold text-mono-black ${big ? 'text-5xl md:text-6xl' : 'text-2xl'}`}>
        {score}
        {big && <span className="text-xl md:text-2xl text-mono-gray"> /100</span>}
        {band && (
          <span
            className={`ml-2 align-middle inline-block font-display font-bold tracking-[0.08em] border border-mono-black/25 text-mono-black ${
              big ? 'text-base md:text-lg px-2 py-1' : 'text-[10px] px-1.5 py-0.5'
            }`}
          >
            {band.band}
          </span>
        )}
      </span>
      <span className={`block font-display font-bold text-mono-amber-strong tracking-[0.2em] ${big ? 'text-[11px] mt-2' : 'text-[9px] mt-0.5'}`}>
        {big ? 'CULTURAL-SIGNAL SCORE' : 'SIGNAL'}
      </span>
      {big && band && (
        <span className="block mt-1 text-[11px] font-body text-mono-gray normal-case tracking-normal">
          {band.label}
        </span>
      )}
    </span>
  );
}
