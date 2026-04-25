'use client';

import { useState } from 'react';

export default function NewsletterSignup({ variant = 'default' }: { variant?: 'default' | 'footer' | 'sidebar' }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Welcome to The Pulse! Check your email to confirm.');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  if (variant === 'footer') {
    return (
      <div className="bg-mono-black text-mono-white p-8 rounded-lg">
        <h3 className="text-2xl font-display font-bold mb-4">GET THE PULSE</h3>
        <p className="text-mono-soft-white font-body mb-6">
          Every Sunday, 8AM GMT. The African stories BBC won't tell you. 5-minute read. No spam.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1 px-4 py-3 bg-mono-white text-mono-black font-body rounded focus:outline-none focus:ring-2 focus:ring-mono-amber"
              disabled={status === 'loading'}
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-8 py-3 bg-mono-amber text-mono-white font-display font-bold rounded hover:bg-mono-amber/90 transition-colors disabled:opacity-50"
            >
              {status === 'loading' ? 'SUBSCRIBING...' : 'JOIN 1,247 READERS'}
            </button>
          </div>

          {status === 'success' && (
            <p className="text-green-400 font-body text-sm">✓ {message}</p>
          )}
          {status === 'error' && (
            <p className="text-red-400 font-body text-sm">✗ {message}</p>
          )}
        </form>

        <p className="text-mono-gray font-body text-sm mt-4">
          ⚡ Last week: Burna Boy's secret collab, PSL playoff drama, Nairobi tech boom
        </p>
      </div>
    );
  }

  if (variant === 'sidebar') {
    return (
      <div className="bg-mono-soft-white p-6 border-l-4 border-mono-amber">
        <h4 className="text-xl font-display font-bold text-mono-black mb-3">
          Never Miss a Story
        </h4>
        <p className="text-mono-charcoal font-body text-sm mb-4">
          Join 1,247 diaspora readers getting The Pulse every Sunday.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="w-full px-4 py-2 bg-mono-white text-mono-black font-body rounded border border-mono-gray focus:outline-none focus:ring-2 focus:ring-mono-amber"
            disabled={status === 'loading'}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full px-4 py-2 bg-mono-amber text-mono-white font-display font-bold rounded hover:bg-mono-amber/90 transition-colors disabled:opacity-50"
          >
            {status === 'loading' ? 'JOINING...' : 'SUBSCRIBE'}
          </button>

          {status === 'success' && (
            <p className="text-green-600 font-body text-xs">✓ {message}</p>
          )}
          {status === 'error' && (
            <p className="text-red-600 font-body text-xs">✗ {message}</p>
          )}
        </form>
      </div>
    );
  }

  // Default variant (for homepage hero)
  return (
    <div className="bg-mono-white p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h3 className="text-3xl font-display font-bold text-mono-black mb-2">
          GET THE PULSE
        </h3>
        <div className="h-1 w-20 bg-mono-amber mx-auto mb-4"></div>
        <p className="text-mono-charcoal font-body text-lg">
          Every Sunday, 8AM GMT. The African stories BBC won't tell you.
        </p>
        <p className="text-mono-gray font-body">
          5-minute read. No spam. Unsubscribe anytime.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
            className="flex-1 px-5 py-4 bg-mono-soft-white text-mono-black font-body rounded-lg border-2 border-transparent focus:outline-none focus:border-mono-amber transition-colors"
            disabled={status === 'loading'}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-8 py-4 bg-mono-amber text-mono-white font-display font-bold text-lg rounded-lg hover:bg-mono-amber/90 transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {status === 'loading' ? 'JOINING...' : 'JOIN 1,247 READERS'}
          </button>
        </div>

        {status === 'success' && (
          <p className="text-green-600 font-body text-center">✓ {message}</p>
        )}
        {status === 'error' && (
          <p className="text-red-600 font-body text-center">✗ {message}</p>
        )}
      </form>

      <div className="mt-6 text-center">
        <p className="text-mono-gray font-body text-sm">
          <span className="text-mono-amber">⚡</span> Last week: Burna Boy's secret collab, PSL playoff drama, Nairobi tech boom
        </p>
      </div>
    </div>
  );
}
