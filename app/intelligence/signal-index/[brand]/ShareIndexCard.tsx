'use client';

import { useState } from 'react';
import { Share2, Check, Link2 } from 'lucide-react';
import { track } from '../../../../lib/analytics';

const SITE = 'https://www.monokromatik.com';

/**
 * Share-the-ranking row. Every ranked brand becomes a distributor: one tap fires
 * the per-brand Index share-card (the opengraph-image route) to X / LinkedIn, or
 * the native share sheet on mobile. Shares are tracked so we can see the loop
 * working. Pairs with the embeddable badge below — badge = on your own site,
 * share = on social.
 */
export default function ShareIndexCard({
  slug,
  brand,
  score,
  rank,
  total,
  scoreDelta,
}: {
  slug: string;
  brand: string;
  score: number;
  rank: number;
  total: number;
  scoreDelta?: number | null;
}) {
  const [copied, setCopied] = useState(false);
  const url = `${SITE}/intelligence/signal-index/${slug}`;
  const move = typeof scoreDelta === 'number' && scoreDelta !== 0 ? ` (${scoreDelta > 0 ? '▲' : '▼'}${Math.abs(scoreDelta)})` : '';
  const text = `${brand} ranks #${rank} of ${total} on the MonoKromatik Cultural-Signal Index — ${score}/100${move}.`;

  const fire = (network: string) => track('index_share', { network, brand: slug, score });

  const onX = () => {
    fire('x');
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank', 'noopener');
  };
  const onLinkedIn = () => {
    fire('linkedin');
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank', 'noopener');
  };
  const onNative = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      fire('native');
      try {
        await navigator.share({ title: `${brand} — Cultural-Signal Index`, text, url });
      } catch {
        /* user dismissed */
      }
    } else {
      onCopy();
    }
  };
  const onCopy = async () => {
    fire('copy');
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  const btn = 'inline-flex items-center gap-2 px-4 py-2.5 text-[11px] tracking-[0.16em] font-display font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mono-amber-bright';

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button onClick={onNative} className={`${btn} bg-mono-amber text-mono-black hover:bg-mono-amber-hover`} aria-label={`Share ${brand}'s ranking`}>
        <Share2 size={14} /> SHARE THIS RANKING
      </button>
      <button onClick={onX} className={`${btn} border border-mono-white/25 text-mono-white hover:border-mono-amber-bright hover:text-mono-amber-bright`}>
        ON X
      </button>
      <button onClick={onLinkedIn} className={`${btn} border border-mono-white/25 text-mono-white hover:border-mono-amber-bright hover:text-mono-amber-bright`}>
        ON LINKEDIN
      </button>
      <button onClick={onCopy} className={`${btn} border border-mono-white/25 text-mono-white hover:border-mono-amber-bright hover:text-mono-amber-bright`} aria-label="Copy link">
        {copied ? <><Check size={14} /> COPIED</> : <><Link2 size={14} /> COPY LINK</>}
      </button>
    </div>
  );
}
