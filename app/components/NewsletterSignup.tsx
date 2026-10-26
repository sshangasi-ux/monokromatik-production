'use client';

import { useState } from 'react';
import { track } from '../../lib/analytics';
import ReferralShare from './ReferralShare';

type Variant = 'default' | 'footer' | 'sidebar' | 'inline';

interface Props {
  variant?: Variant;
  source?: string;
}

export default function NewsletterSignup({ variant = 'default', source }: Props) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const sourceTag = source ?? variant;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'loading') return;
    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), source: sourceTag }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        setStatus('success');
        track('newsletter_signup', { source: sourceTag });
        setMessage(data.message || 'Welcome to The Weekly Signal. Check your email to confirm.');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please check your connection and try again.');
    }
  };

  const ctaIdle = 'JOIN THE WEEKLY SIGNAL';
  const ctaLoading = 'SUBSCRIBING…';

  if (variant === 'inline') {
    // Bare capture row — no card, no heading. The surrounding section supplies
    // the copy (e.g. the homepage hero). Built to sit on a dark background.
    return (
      <div className="w-full">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3" aria-label="Newsletter signup">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            autoComplete="email"
            className="flex-1 px-5 py-4 bg-mono-white text-mono-black font-body rounded-none border-2 border-transparent focus:outline-none focus:border-mono-amber transition-colors"
            disabled={status === 'loading'}
            aria-label="Email address"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-8 py-4 bg-mono-amber text-mono-black font-display font-bold hover:bg-mono-amber/90 transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {status === 'loading' ? ctaLoading : 'JOIN FREE'}
          </button>
        </form>
        {status === 'success' && (
          <>
            <p className="mt-3 text-mono-amber-bright font-body text-sm" role="status">✓ {message}</p>
            <ReferralShare tone="dark" source={`${sourceTag}-success`} />
          </>
        )}
        {status === 'error' && <p className="mt-3 text-red-400 font-body text-sm" role="alert">✗ {message}</p>}
      </div>
    );
  }

  if (variant === 'footer') {
    return (
      <div className="bg-mono-black text-mono-white p-8 rounded-lg">
        <h3 className="text-2xl font-display font-bold mb-4">THE WEEKLY SIGNAL</h3>
        <p className="text-mono-soft-white font-body mb-6">
          Brand, culture and commercial intelligence for Africa and its diaspora. Delivered weekly.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4" aria-label="Newsletter signup">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              autoComplete="email"
              className="flex-1 px-4 py-3 bg-mono-white text-mono-black font-body rounded focus:outline-none focus:ring-2 focus:ring-mono-amber"
              disabled={status === 'loading'}
              aria-label="Email address"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-8 py-3 bg-mono-amber text-mono-black font-display font-bold rounded hover:bg-mono-amber/90 transition-colors disabled:opacity-50"
            >
              {status === 'loading' ? ctaLoading : ctaIdle}
            </button>
          </div>
          {status === 'success' && <p className="text-green-400 font-body text-sm" role="status">✓ {message}</p>}
          {status === 'error' && <p className="text-red-400 font-body text-sm" role="alert">✗ {message}</p>}
        </form>
        {status === 'success' && <ReferralShare tone="dark" source={`${sourceTag}-success`} />}
      </div>
    );
  }

  if (variant === 'sidebar') {
    return (
      <div className="bg-mono-soft-white p-6 border-l-4 border-mono-amber">
        <h4 className="text-xl font-display font-bold text-mono-black mb-3">Get The Weekly Signal</h4>
        <p className="text-mono-charcoal font-body text-sm mb-4">
          The campaigns, culture and commercial intelligence shaping Africa and its diaspora.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3" aria-label="Newsletter signup">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            autoComplete="email"
            className="w-full px-4 py-2 bg-mono-white text-mono-black font-body rounded border border-mono-gray focus:outline-none focus:ring-2 focus:ring-mono-amber"
            disabled={status === 'loading'}
            aria-label="Email address"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full px-4 py-2 bg-mono-amber text-mono-black font-display font-bold rounded hover:bg-mono-amber/90 transition-colors disabled:opacity-50"
          >
            {status === 'loading' ? ctaLoading : 'SUBSCRIBE'}
          </button>
          {status === 'success' && <p className="text-green-600 font-body text-xs" role="status">✓ {message}</p>}
          {status === 'error' && <p className="text-red-600 font-body text-xs" role="alert">✗ {message}</p>}
        </form>
        {status === 'success' && <ReferralShare tone="light" source={`${sourceTag}-success`} />}
      </div>
    );
  }

  return (
    <div className="bg-mono-white p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h3 className="text-3xl font-display font-bold text-mono-black mb-2">THE WEEKLY SIGNAL</h3>
        <div className="h-1 w-20 bg-mono-amber mx-auto mb-4" />
        <p className="text-mono-charcoal font-body text-lg">
          Brand, culture and commercial intelligence for Africa and its diaspora.
        </p>
        <p className="text-mono-gray font-body">Useful insight. Verified sourcing. No noise.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4" aria-label="Newsletter signup">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
            autoComplete="email"
            className="flex-1 px-5 py-4 bg-mono-soft-white text-mono-black font-body rounded-lg border-2 border-transparent focus:outline-none focus:border-mono-amber transition-colors"
            disabled={status === 'loading'}
            aria-label="Email address"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-8 py-4 bg-mono-amber text-mono-black font-display font-bold text-lg rounded-lg hover:bg-mono-amber/90 transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {status === 'loading' ? ctaLoading : ctaIdle}
          </button>
        </div>
        {status === 'success' && <p className="text-green-600 font-body text-center" role="status">✓ {message}</p>}
        {status === 'error' && <p className="text-red-600 font-body text-center" role="alert">✗ {message}</p>}
      </form>
      {status === 'success' && (
        <div className="mt-6 max-w-md mx-auto">
          <ReferralShare tone="light" source={`${sourceTag}-success`} />
        </div>
      )}
      <div className="mt-6 text-center">
        <p className="text-mono-gray font-body text-sm">
          <span className="text-mono-amber-strong">●</span> AI-assisted discovery. Human-directed intelligence. Verified sourcing.
        </p>
      </div>
    </div>
  );
}
