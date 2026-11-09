'use client';

import { useState } from 'react';
import Link from 'next/link';
import { track } from '../../lib/analytics';

// The lead magnet: a real, sourced asset — The African Ownership Map (/ownership-map),
// a one-page rendering of the live Ownership-100 ledger. On a successful join we
// REVEAL the asset immediately (open the map + download the CSV); nothing is emailed
// as an attachment and no Kit automation is assumed, so the promise is one the code
// actually keeps. The signup itself reuses the existing /api/newsletter path (Kit
// v4/v3), the same backend every other form on the site uses — this adds a capture
// surface, not a second list. `source` is passed through to the API (and fired on
// the GA `newsletter_signup` event) so placements are separable in analytics.

const MAP_PATH = '/ownership-map';
const CSV_PATH = '/api/index?format=csv';

type Tone = 'light' | 'dark';

interface Props {
  /** Analytics source tag, e.g. `article-inline:<slug>` or `exit-intent:<slug>`. */
  source: string;
  tone?: Tone;
  heading?: string;
  blurb?: string;
  /** Called after a successful subscribe (e.g. to let an exit modal show a close affordance). */
  onSuccess?: () => void;
  className?: string;
}

export default function LeadMagnetCapture({
  source,
  tone = 'light',
  heading = 'Get The African Ownership Map',
  blurb = 'One page: Africa’s most valuable brands, sorted by who really owns them — every entry sourced. Free when you join The Weekly Signal.',
  onSuccess,
  className = '',
}: Props) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const dark = tone === 'dark';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'loading') return;
    setStatus('loading');
    setMessage('');
    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), source }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        setStatus('success');
        track('newsletter_signup', { source });
        setMessage(data.message || 'You’re in — The Weekly Signal lands every Sunday.');
        setEmail('');
        onSuccess?.();
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please check your connection and try again.');
    }
  };

  // Success state — deliver the asset. The map opens in a new tab; the CSV is the
  // same machine-readable feed the ledger already publishes.
  if (status === 'success') {
    return (
      <div className={`${dark ? 'text-mono-white' : 'text-mono-black'} ${className}`} role="status">
        <p className="text-xs tracking-[0.28em] font-display font-bold text-mono-amber-strong mb-2">
          YOUR MAP IS READY
        </p>
        <p className={`font-feature font-bold text-xl mb-1 ${dark ? 'text-mono-white' : 'text-mono-black'}`}>
          ✓ {message}
        </p>
        <p className={`font-body text-sm mb-5 ${dark ? 'text-mono-soft-white' : 'text-mono-charcoal'}`}>
          Here’s The African Ownership Map — keep it, print it, share it.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href={MAP_PATH}
            onClick={() => track('lead_magnet_open', { asset: 'ownership-map', source })}
            className="inline-flex items-center justify-center gap-2 bg-mono-amber text-mono-black px-6 py-3.5 font-display font-bold hover:bg-mono-amber/90 transition-colors"
          >
            OPEN THE MAP
          </Link>
          <a
            href={CSV_PATH}
            onClick={() => track('lead_magnet_download', { asset: 'ownership-map', mode: 'csv', source })}
            className={`inline-flex items-center justify-center gap-2 px-6 py-3.5 font-display font-bold transition-colors border ${
              dark
                ? 'border-mono-white/40 text-mono-white hover:bg-mono-white/10'
                : 'border-mono-black text-mono-black hover:bg-mono-white'
            }`}
          >
            DOWNLOAD THE DATA (CSV)
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <p className="text-xs tracking-[0.28em] font-display font-bold text-mono-amber-strong mb-2">
        FREE DOWNLOAD
      </p>
      {/* Inline color: when this card sits inside an article, the page's global
          `.article-content h3` rule would otherwise force the heading to black
          (invisible on the dark band). An inline style outranks that selector. */}
      <h3
        className="font-feature font-bold text-2xl md:text-3xl leading-tight mb-2"
        style={{ color: dark ? 'var(--mono-white)' : 'var(--mono-black)' }}
      >
        {heading}
      </h3>
      <p className={`font-body text-sm md:text-base mb-5 ${dark ? 'text-mono-soft-white' : 'text-mono-charcoal'}`}>
        {blurb}
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3" aria-label="Get the African Ownership Map">
        <input
          type="email"
          value={email}
          onChange={(ev) => setEmail(ev.target.value)}
          placeholder="your@email.com"
          required
          autoComplete="email"
          disabled={status === 'loading'}
          aria-label="Email address"
          className={`flex-1 px-5 py-4 font-body rounded-none border-2 focus:outline-none transition-colors ${
            dark
              ? 'bg-mono-white text-mono-black border-transparent focus:border-mono-amber'
              : 'bg-mono-white text-mono-black border-mono-gray/50 focus:border-mono-amber'
          }`}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-8 py-4 bg-mono-amber text-mono-black font-display font-bold hover:bg-mono-amber/90 transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          {status === 'loading' ? 'SENDING…' : 'SEND ME THE MAP'}
        </button>
      </form>
      {status === 'error' && (
        <p className="mt-3 text-red-500 font-body text-sm" role="alert">✗ {message}</p>
      )}
      <p className={`mt-3 font-body text-xs ${dark ? 'text-mono-gray' : 'text-mono-gray'}`}>
        The Weekly Signal · brand, culture and commercial intelligence for Africa and its diaspora. Unsubscribe anytime.
      </p>
    </div>
  );
}
