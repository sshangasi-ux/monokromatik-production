'use client';

import { useState } from 'react';
import { Check, Copy, Share2 } from 'lucide-react';
import { track } from '../../lib/analytics';

/**
 * WhatsApp-first share loop — the growth mechanic Morning Brew / The Hustle /
 * Trapital run, in a code-only form that needs no Kit dashboard config. One-tap
 * WhatsApp (the diaspora + SA distribution reality, cf. The Continent's WhatsApp
 * push), copy-link, and native share.
 *
 * Two uses, same component:
 *  - default (no url): the post-signup referral loop, pointing at /pulse, shown
 *    the moment someone subscribes (peak willingness-to-share);
 *  - with url/shareText/heading: a "gift this" loop, e.g. an unlocked flagship
 *    report passing a pre-unlocked read to a friend.
 */

const PULSE_URL = 'https://www.monokromatik.com/pulse';
const PULSE_TEXT =
  'The Weekly Signal — brand, culture & commercial intelligence for Africa and its diaspora. Free:';
const PULSE_TITLE = 'The Weekly Signal';

export default function ReferralShare({
  tone = 'light',
  source,
  url = PULSE_URL,
  shareText = PULSE_TEXT,
  shareTitle = PULSE_TITLE,
  heading,
  event = 'referral_share',
}: {
  tone?: 'light' | 'dark';
  source?: string;
  /** The link people share. Defaults to the Pulse signup. */
  url?: string;
  /** Text that precedes the URL in WhatsApp / native share. */
  shareText?: string;
  /** Title for the native share sheet. */
  shareTitle?: string;
  /** The prompt line above the buttons. Defaults to the post-signup copy. */
  heading?: React.ReactNode;
  /** Analytics event name (gift vs referral). */
  event?: string;
}) {
  const [copied, setCopied] = useState(false);
  const dark = tone === 'dark';

  const fire = (channel: string) => track(event, { channel, source });

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = url;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch { /* best-effort */ }
      document.body.removeChild(ta);
    }
    setCopied(true);
    fire('copy');
    window.setTimeout(() => setCopied(false), 2000);
  };

  const nativeShare = async () => {
    const nav = typeof navigator !== 'undefined' ? (navigator as Navigator) : null;
    if (nav && typeof nav.share === 'function') {
      try {
        await nav.share({ title: shareTitle, text: shareText, url });
        fire('native');
      } catch { /* user dismissed */ }
    } else {
      copy();
    }
  };

  const waHref = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${url}`)}`;

  const defaultHeading = (
    <>
      <span className="font-semibold">You&rsquo;re in.</span>{' '}Know someone who&rsquo;d value this? Pass on the Signal.
    </>
  );

  const base = 'inline-flex items-center gap-1.5 px-3 py-2 font-display text-xs font-bold uppercase tracking-[0.08em] transition-colors';
  const outline = dark
    ? 'border border-mono-white/40 text-mono-white hover:border-mono-amber hover:text-mono-amber-bright'
    : 'border border-mono-charcoal/40 text-mono-charcoal hover:border-mono-amber hover:text-mono-amber-strong';

  return (
    <div className={`mt-4 pt-4 ${dark ? 'border-t border-mono-white/15' : 'border-t border-mono-charcoal/15'}`}>
      <p className={`mb-3 font-body text-sm ${dark ? 'text-mono-soft-white' : 'text-mono-charcoal'}`}>
        {heading ?? defaultHeading}
      </p>
      <div className="flex flex-wrap gap-2">
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => fire('whatsapp')}
          className="inline-flex items-center gap-1.5 bg-mono-amber px-3 py-2 font-display text-xs font-bold uppercase tracking-[0.08em] text-mono-black transition-colors hover:bg-mono-amber/90"
        >
          <Share2 size={14} /> WhatsApp
        </a>
        <button type="button" onClick={copy} className={`${base} ${outline}`}>
          {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy link</>}
        </button>
        <button type="button" onClick={nativeShare} className={`${base} ${outline}`}>
          <Share2 size={14} /> Share
        </button>
      </div>
    </div>
  );
}
