'use client';

interface Props {
  compact?: boolean;
}

export default function Issue001KineticArtwork({ compact = false }: Props) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="absolute inset-0 issue-grid opacity-30" />
      <div className="issue-orbit issue-orbit-a absolute rounded-full border border-mono-amber/35" />
      <div className="issue-orbit issue-orbit-b absolute rounded-full border border-mono-white/15" />
      <div className="issue-orbit issue-orbit-c absolute rounded-full border border-mono-amber/15" />
      <div className="absolute right-[8%] top-[16%] w-px h-[62%] bg-mono-amber/40 issue-pulse-line" />
      <div className="absolute right-[calc(8%-5px)] top-[16%] h-[11px] w-[11px] rounded-full bg-mono-amber issue-marker" />
      <div className={`absolute ${compact ? 'bottom-[18%] right-[8%] text-[11vw]' : 'bottom-[3%] right-[3%] text-[24vw]'} font-display font-bold leading-none text-mono-white/[0.045] tracking-[-0.09em]`}>001</div>
      <div className="absolute bottom-[13%] right-[8%] hidden lg:block text-right">
        <p className="text-[9px] tracking-[0.5em] font-display font-bold text-mono-amber/80">AFRICAN INFLUENCE</p>
        <p className="mt-2 text-[9px] tracking-[0.44em] font-display text-mono-white/40">SIGNAL / INTELLIGENCE / ISSUE</p>
      </div>
      <style jsx>{`
        .issue-grid {
          background-image:
            linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px);
          background-size: 70px 70px;
          mask-image: radial-gradient(circle at 74% 48%, #000 0%, transparent 60%);
        }
        .issue-orbit {
          transform-origin: center;
          animation: orbit 20s linear infinite;
        }
        .issue-orbit-a {
          right: -10%; top: 8%; width: min(62vw, 780px); height: min(62vw, 780px);
        }
        .issue-orbit-b {
          right: 2%; top: 19%; width: min(45vw, 570px); height: min(45vw, 570px);
          animation-direction: reverse; animation-duration: 26s;
        }
        .issue-orbit-c {
          right: 15%; top: 31%; width: min(28vw, 360px); height: min(28vw, 360px);
          animation-duration: 14s;
        }
        .issue-pulse-line { animation: pulseLine 3.4s ease-in-out infinite; }
        .issue-marker { animation: markerTravel 5.8s ease-in-out infinite; }
        @keyframes orbit {
          from { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.045); }
          to { transform: rotate(360deg) scale(1); }
        }
        @keyframes pulseLine {
          0%, 100% { opacity: .18; }
          50% { opacity: .75; }
        }
        @keyframes markerTravel {
          0%, 100% { transform: translateY(0); opacity: .45; }
          50% { transform: translateY(38vh); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .issue-orbit, .issue-pulse-line, .issue-marker { animation: none; }
        }
      `}</style>
    </div>
  );
}
