'use client';

import { useState } from 'react';

const FALLBACK = '/fallback-hero.svg';

// Images are self-hosted under /article-media (webp, same-origin) by the media
// sourcer, so no proxy is needed. Any URL that still fails (e.g. a not-yet-
// localised remote URL) falls back to the branded SVG below.

const ASPECT: Record<string, string> = {
  video: 'aspect-video',
  '4/3': 'aspect-[4/3]',
  '16/9': 'aspect-[16/9]',
  square: 'aspect-square',
  portrait: 'aspect-[3/4]',
  auto: '',
};

type Props = {
  src?: string | null;
  alt: string;
  /** Fill an existing positioned (relative) ancestor instead of adding a wrapper. */
  fill?: boolean;
  /** Aspect ratio for the self-contained wrapper (ignored when `fill`). */
  aspect?: keyof typeof ASPECT;
  /** Apply the monochrome → amber brand treatment (reveals color on group-hover). */
  duotone?: boolean;
  /** Scale up slightly on group-hover. */
  zoomOnHover?: boolean;
  /** Eager-load above-the-fold images (skips lazy + raises fetch priority). */
  priority?: boolean;
  className?: string;
  wrapperClassName?: string;
};

/**
 * Brand image primitive: CLS-safe (fixed aspect / fill), charcoal skeleton with
 * an amber shimmer while loading, fade-in on load, branded fallback on error,
 * and the MonoKromatik monochrome-duotone treatment by default. See
 * design-system/MASTER.md.
 */
export default function MediaImage({
  src,
  alt,
  fill = false,
  aspect = 'video',
  duotone = true,
  zoomOnHover = true,
  priority = false,
  className = '',
  wrapperClassName = '',
}: Props) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const url = errored || !src ? FALLBACK : src;
  const showDuotone = duotone && !errored;

  const img = (
    <>
      {!loaded && (
        <span className="img-shimmer absolute inset-0" aria-hidden="true" />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => {
          setErrored(true);
          setLoaded(true);
        }}
        className={[
          fill ? 'absolute inset-0' : '',
          'h-full w-full object-cover',
          'transition-[opacity,transform,filter] duration-500 ease-out',
          loaded ? 'opacity-100' : 'opacity-0',
          showDuotone ? 'img-duotone' : '',
          zoomOnHover ? 'group-hover:scale-105' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      />
    </>
  );

  if (fill) return img;

  return (
    <div
      className={`relative overflow-hidden bg-mono-charcoal ${ASPECT[aspect]} ${wrapperClassName}`}
    >
      {img}
    </div>
  );
}
