'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, Lock } from 'lucide-react';
import { track } from '../../lib/analytics';

// Soft email-gate for the free flagship reports. The children (the back half of
// the report + the Bear Case) are ALWAYS server-rendered into the DOM, so
// crawlers, no-JS readers and accessibility tools see the full report — SEO is
// untouched. On the client, a first-time visitor sees the content visually
// collapsed behind a fade with an email capture; submitting subscribes them via
// /api/newsletter (source-tagged) and unlocks every gated report thereafter
// (localStorage). This trades a bypassable wall for list-building without
// hurting the SEO these titles exist to win.
const UNLOCK_KEY = 'mk_flagship_unlocked_v1';

export default function FlagshipGate({ slug, children }: { slug: string; children: React.ReactNode }) {
  // Start unlocked so the server-rendered HTML shows the full content (SEO / no-JS);
  // flip to gated on mount only for a first-time visitor who hasn't unlocked before.
  const [gated, setGated] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle');
  const [err, setErr] = useState('');

  useEffect(() => {
    let unlocked = false;
    try {
      unlocked = localStorage.getItem(UNLOCK_KEY) === '1';
    } catch {
      /* storage blocked — leave ungated rather than trap the reader */
      unlocked = true;
    }
    if (!unlocked) {
      setGated(true);
      // Defer the impression so it doesn't race GA's init on a cold page load
      // (the conversion events all fire on interaction, well after GA is ready).
      const t = setTimeout(() => track('flagship_gate_shown', { slug }), 600);
      return () => clearTimeout(t);
    }
  }, [slug]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErr('');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: `flagship:${slug}` }),
      });
      if (res.ok) {
        try {
          localStorage.setItem(UNLOCK_KEY, '1');
        } catch {
          /* ignore */
        }
        track('newsletter_signup', { source: `flagship:${slug}` });
        track('flagship_gate_unlock', { slug });
        setGated(false);
      } else {
        const data = await res.json().catch(() => ({}));
        setStatus('error');
        setErr(data?.error || 'Please try again.');
      }
    } catch {
      setStatus('error');
      setErr('Network error. Please try again.');
    }
  };

  if (!gated) return <>{children}</>;

  return (
    <div className="relative">
      <div className="relative max-h-[240px] overflow-hidden">
        {children}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-mono-paper" />
      </div>
      <div className="relative -mt-16 border border-mono-black bg-mono-white p-7 md:p-9 shadow-[6px_6px_0_0_var(--mono-amber,#C24A0A)]">
        <div className="flex items-center gap-2 text-mono-amber-strong mb-3">
          <Lock size={15} aria-hidden="true" />
          <span className="text-[11px] tracking-[0.22em] font-display font-bold">KEEP READING — IT&rsquo;S FREE</span>
        </div>
        <h3 className="text-2xl md:text-3xl font-display font-bold text-mono-black leading-tight">
          The rest of this report is free.
        </h3>
        <p className="mt-3 font-body text-mono-charcoal leading-relaxed">
          Tell us where to send it and the full analysis unlocks — the complete read, every exhibit and the Bear Case —
          plus the weekly dispatch on who authors African culture and who captures its value. One field, no spam,
          unsubscribe anytime.
        </p>
        <form onSubmit={submit} className="mt-6 flex flex-col sm:flex-row gap-3">
          <label htmlFor="flagship-email" className="sr-only">Email address</label>
          <input
            id="flagship-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="flex-1 bg-mono-white border border-mono-gray/40 px-4 py-3.5 font-body text-mono-black placeholder:text-mono-gray focus:border-mono-amber focus:outline-none"
          />
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="inline-flex items-center justify-center gap-2 bg-mono-black text-mono-white px-7 py-3.5 font-display font-bold hover:bg-mono-charcoal transition-colors disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {status === 'submitting' ? 'UNLOCKING…' : 'UNLOCK THE FULL REPORT'}
            {status !== 'submitting' && <ArrowRight size={16} />}
          </button>
        </form>
        {status === 'error' && (
          <p className="mt-3 font-body text-sm text-mono-charcoal">{err}</p>
        )}
      </div>
    </div>
  );
}
