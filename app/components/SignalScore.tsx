// The Cultural-Signal Score atom — a recognisable /100 chip. `sm` for cards,
// `lg` for the case-study decode headline. See docs/CULTURAL_SIGNAL_INDEX.md.

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
  return (
    <span
      className={`shrink-0 text-right leading-none ${className}`}
      title={`Cultural-Signal Score: ${score}/100`}
      aria-label={`Cultural-Signal Score ${score} out of 100`}
    >
      <span className={`block font-display font-bold text-mono-black ${big ? 'text-5xl md:text-6xl' : 'text-2xl'}`}>
        {score}
        {big && <span className="text-xl md:text-2xl text-mono-gray"> /100</span>}
      </span>
      <span className={`block font-display font-bold text-mono-amber-strong tracking-[0.2em] ${big ? 'text-[11px] mt-2' : 'text-[9px] mt-0.5'}`}>
        {big ? 'CULTURAL-SIGNAL SCORE' : 'SIGNAL'}
      </span>
    </span>
  );
}
