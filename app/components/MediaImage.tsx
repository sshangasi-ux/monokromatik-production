'use client';

import { useState } from 'react';
import CoverArt from './CoverArt';

// Pipeline article images are self-hosted under /article-media (same-origin) and
// pass through untouched. But some images are hardcoded *remote* URLs that never
// go through the self-host backfill (e.g. official campaign assets on the Issue
// pages, like media.about.nike.com), and those hosts often hotlink-protect /
// omit CORS, blanking the image on our domain. For those — and only those —
// route through a caching proxy as a safety net so nothing is ever broken.
// Local and own-domain URLs are never proxied.
export function proxify(src: string): string {
  if (!/^https?:\/\//i.test(src)) return src; // local (/article-media, /fallback-hero.svg)
  try {
    const { hostname } = new URL(src);
    if (hostname.endsWith('monokromatik.com') || hostname.endsWith('images.weserv.nl')) return src;
    const bare = src.replace(/^https?:\/\//i, '');
    return `https://images.weserv.nl/?url=${encodeURIComponent(bare)}&w=1600&output=webp&we`;
  } catch {
    return src;
  }
}

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
  // When there's no source, or the remote source fails to load (e.g. publisher
  // hotlink protection that no proxy can defeat), fall back to the brand's own
  // generative CoverArt rather than a flat placeholder — the surface still reads
  // as authored MonoKromatik imagery, never a broken box.
  const failed = errored || !src;
  const showDuotone = duotone && !failed;

  const img = failed ? (
    <CoverArt seed={alt || 'monokromatik'} lapels={!fill} />
  ) : (
    <>
      {!loaded && (
        <span className="img-shimmer absolute inset-0" aria-hidden="true" />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={proxify(src!)}
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
