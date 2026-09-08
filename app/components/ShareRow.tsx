'use client';

import { useState } from 'react';
import { track } from '../../lib/analytics';

/**
 * Share row — WhatsApp-first, because in the markets this publication covers
 * WhatsApp is the dominant sharing surface, well ahead of email. Falls back to
 * X and a copy-link button. Deliberately dependency-free (no share SDKs): plain
 * wa.me / intent URLs so it works everywhere and leaks nothing.
 */
export default function ShareRow({
  url,
  text,
  source = 'share-row',
}: {
  url: string;
  text: string;
  source?: string;
}) {
  const [copied, setCopied] = useState(false);
  const enc = encodeURIComponent;
  const wa = `https://wa.me/?text=${enc(`${text} ${url}`)}`;
  const x = `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      track('share_copy', { source });
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — no-op */
    }
  };

  const base =
    'inline-flex items-center gap-2 px-4 py-2.5 font-display font-bold text-xs tracking-[0.12em] transition-colors';

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-[11px] tracking-[0.24em] font-display font-bold text-mono-gray">SHARE</span>
      <a
        href={wa}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track('share_whatsapp', { source })}
        className={`${base} bg-[#25D366] text-mono-black hover:bg-[#1ebe5a]`}
      >
        WHATSAPP
      </a>
      <a
        href={x}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track('share_x', { source })}
        className={`${base} bg-mono-black text-mono-white hover:bg-mono-charcoal`}
      >
        X / TWITTER
      </a>
      <button type="button" onClick={copy} className={`${base} border border-mono-black text-mono-black hover:bg-mono-white`}>
        {copied ? 'LINK COPIED' : 'COPY LINK'}
      </button>
    </div>
  );
}
