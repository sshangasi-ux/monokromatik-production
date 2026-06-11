'use client';

import MediaImage from './MediaImage';
import CoverArt from './CoverArt';

/**
 * IssueCover — the MonoKromatik magazine-cover composition.
 *
 * A front-end, fully-owned cover: masthead, issue number, an oversized cover
 * line and stacked cover-lines over the generative CoverArt field. An optional
 * *self-hosted* photo can sit behind the art, duotoned to brand — but the cover
 * is designed to be complete and striking with no photography at all, so it
 * never depends on remote/licensed imagery to look finished.
 *
 * This is the brand "leading visually first" surface referenced on the Issue
 * 001 cover study. See design-system/MASTER.md.
 */

type Props = {
  /** e.g. "001" — drives the watermark + masthead index. */
  issueNumber: string;
  /** Small kicker above the cover line, e.g. "FOUNDING ISSUE" or a franchise. */
  kicker: string;
  /** The oversized cover headline. Use <br/> via array for line control. */
  title: string;
  /** Secondary cover lines listed down the cover. */
  coverlines?: string[];
  /** Bottom rule, e.g. "CAMPAIGNS · VOICES · COMMERCE · DIASPORA". */
  footer?: string;
  /** Optional self-hosted hero photo (e.g. /article-media/…). Remote URLs are fine but the art stands alone. */
  photo?: string;
  /** 'portrait' (3/4 collectible cover) or 'wide' (16/9 hero band). */
  aspect?: 'portrait' | 'wide';
  /** Animate the field (hero placements). */
  motion?: boolean;
  className?: string;
};

export default function IssueCover({
  issueNumber,
  kicker,
  title,
  coverlines = [],
  footer,
  photo,
  aspect = 'portrait',
  motion = true,
  className = '',
}: Props) {
  const ratio = aspect === 'portrait' ? 'aspect-[3/4]' : 'aspect-[16/9]';

  return (
    <div
      className={`relative ${ratio} overflow-hidden bg-mono-black text-mono-soft-white shadow-2xl ${className}`}
    >
      {/* Optional photo bed — duotoned; the generative art layers above it. */}
      {photo && (
        <div className="absolute inset-0 opacity-40">
          <MediaImage fill duotone src={photo} alt="" priority zoomOnHover={false} />
        </div>
      )}

      <CoverArt seed={`${issueNumber}-${title}`} numeral={issueNumber} motion={motion} lapels={false} />

      {/* Legibility scrim — keeps cover lines readable over art or photo. */}
      <div className="absolute inset-0 bg-gradient-to-t from-mono-black via-mono-black/55 to-mono-black/35" />

      <div className="relative h-full p-6 md:p-8 flex flex-col justify-between">
        <div className="flex items-center justify-between text-[10px] tracking-[0.3em] font-display font-bold">
          <span className="text-mono-amber">MONOKROMATIK</span>
          <span className="text-mono-gray">{issueNumber}</span>
        </div>

        <div>
          <p className="text-[10px] tracking-[0.32em] font-display font-bold text-mono-amber mb-4 md:mb-6">
            {kicker}
          </p>
          <h2 className="font-display font-bold leading-[0.94] tracking-tight text-3xl md:text-5xl">
            {title}
          </h2>
          {coverlines.length > 0 && (
            <ul className="mt-6 space-y-2">
              {coverlines.map((line) => (
                <li
                  key={line}
                  className="flex items-start gap-2 text-sm font-body text-mono-soft-white/85 leading-snug"
                >
                  <span className="mt-[6px] h-[5px] w-[5px] shrink-0 rounded-full bg-mono-amber" />
                  {line}
                </li>
              ))}
            </ul>
          )}
        </div>

        {footer && (
          <p className="pt-4 border-t border-mono-soft-white/20 text-[10px] tracking-[0.16em] font-display text-mono-gray">
            {footer}
          </p>
        )}
      </div>
    </div>
  );
}
