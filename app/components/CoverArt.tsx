'use client';

/**
 * CoverArt — MonoKromatik's owned, generative duotone visual engine.
 *
 * A self-contained brand composition (charcoal field, signal grid, amber orbit
 * rings, a travelling signal marker and an oversized numeral watermark) that
 * needs no photography. It is the answer to un-hotlinkable / missing imagery:
 * every report, dossier and card can carry a striking same-origin visual that
 * is always "the brand leading first" rather than a broken remote image.
 *
 * Used three ways:
 *  1. behind IssueCover (the magazine-cover composition),
 *  2. as section/hero art on report + issue pages,
 *  3. as MediaImage's branded fallback when a source fails to load.
 *
 * Deterministic: the same `seed` always yields the same composition, so a given
 * article/report keeps a stable visual identity. See design-system/MASTER.md.
 */

function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295; // 0..1
}

type Props = {
  /** Stable identity (article slug, report title, alt text…). */
  seed?: string;
  /** Big watermark glyph — issue number ("001") or initials. Defaults to seed-derived digits. */
  numeral?: string;
  /** Animate the orbit/marker (hero surfaces only). Off for cards/fallbacks. */
  motion?: boolean;
  /** Show the corner mast + tagline lapels. */
  lapels?: boolean;
  className?: string;
};

export default function CoverArt({
  seed = 'monokromatik',
  numeral,
  motion = false,
  lapels = true,
  className = '',
}: Props) {
  const r = hash(seed);
  const r2 = hash(seed + '~');
  const glyph = numeral ?? String(Math.floor(r * 900) + 100); // 100..999
  // Seed-driven placement so each composition feels authored, not templated.
  const orbitTop = 6 + Math.round(r * 16); // %
  const lineRight = 10 + Math.round(r2 * 16); // %
  const rotate = Math.round((r - 0.5) * 14); // -7..7 deg

  return (
    <div
      className={`absolute inset-0 overflow-hidden bg-mono-charcoal pointer-events-none select-none ${className}`}
      aria-hidden="true"
      data-motion={motion ? 'on' : 'off'}
    >
      {/* signal grid, masked to a soft radial so it reads as depth not wallpaper */}
      <div className="ca-grid absolute inset-0" />
      {/* amber wash so the field is never a flat block */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 90% at 78% 18%, rgba(204,85,0,0.20), transparent 55%)',
        }}
      />
      {/* concentric orbit rings */}
      <div
        className="ca-orbit ca-a absolute rounded-full border border-mono-amber/35"
        style={{ top: `${orbitTop}%` }}
      />
      <div
        className="ca-orbit ca-b absolute rounded-full border border-mono-soft-white/15"
        style={{ top: `${orbitTop + 11}%` }}
      />
      <div
        className="ca-orbit ca-c absolute rounded-full border border-mono-amber/15"
        style={{ top: `${orbitTop + 24}%` }}
      />
      {/* travelling signal marker on a pulse line */}
      <div
        className="ca-line absolute top-[14%] h-[64%] w-px bg-mono-amber/45"
        style={{ right: `${lineRight}%` }}
      />
      <div
        className="ca-marker absolute top-[14%] h-[10px] w-[10px] rounded-full bg-mono-amber"
        style={{ right: `calc(${lineRight}% - 4.5px)` }}
      />
      {/* oversized numeral watermark */}
      <div
        className="absolute bottom-[2%] right-[3%] font-display font-bold leading-none text-mono-soft-white/[0.05] tracking-[-0.09em] text-[26vw] md:text-[15vw]"
        style={{ transform: `rotate(${rotate}deg)` }}
      >
        {glyph}
      </div>
      {lapels && (
        <div className="absolute bottom-[8%] right-[8%] hidden sm:block text-right">
          <p className="text-[9px] tracking-[0.5em] font-display font-bold text-mono-amber/80">
            AFRICAN INFLUENCE
          </p>
          <p className="mt-2 text-[9px] tracking-[0.42em] font-display text-mono-soft-white/40">
            SIGNAL / INTELLIGENCE / ISSUE
          </p>
        </div>
      )}

      <style jsx>{`
        .ca-grid {
          background-image: linear-gradient(rgba(245, 245, 245, 0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(245, 245, 245, 0.035) 1px, transparent 1px);
          background-size: 64px 64px;
          mask-image: radial-gradient(circle at 74% 40%, #000 0%, transparent 62%);
          -webkit-mask-image: radial-gradient(circle at 74% 40%, #000 0%, transparent 62%);
        }
        .ca-orbit {
          right: -8%;
          transform-origin: center;
        }
        .ca-a {
          width: min(64vw, 720px);
          height: min(64vw, 720px);
        }
        .ca-b {
          right: 4%;
          width: min(46vw, 540px);
          height: min(46vw, 540px);
        }
        .ca-c {
          right: 16%;
          width: min(28vw, 330px);
          height: min(28vw, 330px);
        }
        [data-motion='on'] .ca-a {
          animation: ca-orbit 22s linear infinite;
        }
        [data-motion='on'] .ca-b {
          animation: ca-orbit 28s linear infinite reverse;
        }
        [data-motion='on'] .ca-c {
          animation: ca-orbit 16s linear infinite;
        }
        [data-motion='on'] .ca-line {
          animation: ca-pulse 3.4s ease-in-out infinite;
        }
        [data-motion='on'] .ca-marker {
          animation: ca-travel 5.8s ease-in-out infinite;
        }
        @keyframes ca-orbit {
          from {
            transform: rotate(0deg) scale(1);
          }
          50% {
            transform: rotate(180deg) scale(1.04);
          }
          to {
            transform: rotate(360deg) scale(1);
          }
        }
        @keyframes ca-pulse {
          0%,
          100% {
            opacity: 0.18;
          }
          50% {
            opacity: 0.7;
          }
        }
        @keyframes ca-travel {
          0%,
          100% {
            transform: translateY(0);
            opacity: 0.45;
          }
          50% {
            transform: translateY(46%);
            opacity: 1;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .ca-orbit,
          .ca-line,
          .ca-marker {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
