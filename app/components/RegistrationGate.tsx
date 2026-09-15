'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { track } from '../../lib/analytics';

// A METERED, SOFT registration prompt (the middle funnel). It counts reads of
// deep free content and, once past the free limit, invites the reader to
// register (email) to keep going — feeding the newsletter funnel.
//
// Soft on purpose: it is a NON-BLOCKING bottom banner (never a full-screen
// interstitial), and it only appears AFTER the reader has engaged with the piece
// they came for (scrolled past the threshold) — so it lifts list growth without
// interrupting the read or spiking bounce on the best readers. "Not now"
// dismisses for the session, so it never blocks crawlers or social/SEO discovery.
const FREE_LIMIT = 5; // generous — social visitors read a couple before deciding
const SCROLL_TRIGGER = 0.5; // show only once the reader is halfway through
const READS = 'mk:reads';
const PATHS = 'mk:read-paths';
const REG = 'mk:registered';
const DISMISS = 'mk:gate-dismissed';

// Only meter deep FREE content — not home/index/listing pages, and NOT reports
// (those run their own BUY funnel + sticky bar; email capture isn't the goal there).
const CONTENT = /^\/(article|intelligence\/case-studies|issues)\/[^/]/;

export default function RegistrationGate() {
  const pathname = usePathname();
  const [armed, setArmed] = useState(false);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [msg, setMsg] = useState('');
  const trackedRef = useRef(false);

  // Meter: count the read, decide whether the prompt is armed for this page.
  useEffect(() => {
    setArmed(false);
    setOpen(false);
    trackedRef.current = false;
    if (!CONTENT.test(pathname)) return;
    try {
      if (localStorage.getItem(REG) === '1') return;
      if (sessionStorage.getItem(DISMISS) === '1') return;
      let paths: string[] = [];
      try {
        const p = JSON.parse(localStorage.getItem(PATHS) || '[]');
        if (Array.isArray(p)) paths = p;
      } catch {
        /* reset */
      }
      let reads = Number(localStorage.getItem(READS) || '0');
      if (!paths.includes(pathname)) {
        paths.push(pathname);
        reads += 1;
        localStorage.setItem(PATHS, JSON.stringify(paths));
        localStorage.setItem(READS, String(reads));
      }
      if (reads > FREE_LIMIT) setArmed(true);
    } catch {
      /* storage unavailable — never block */
    }
  }, [pathname]);

  // Reveal only once the reader has engaged (scrolled past the threshold), so we
  // never interrupt the piece they arrived to read.
  useEffect(() => {
    if (!armed) return;
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const progress = max > 0 ? window.scrollY / max : 1;
      if (progress >= SCROLL_TRIGGER) {
        setOpen(true);
        if (!trackedRef.current) {
          trackedRef.current = true;
          track('registration_wall_shown', {});
        }
        window.removeEventListener('scroll', onScroll);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // short pages may already be past the threshold
    return () => window.removeEventListener('scroll', onScroll);
  }, [armed]);

  const dismiss = () => {
    try {
      sessionStorage.setItem(DISMISS, '1');
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'loading') return;
    setStatus('loading');
    setMsg('');
    try {
      const r = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), source: 'registration-wall' }),
      });
      const d = await r.json().catch(() => ({}));
      if (r.ok) {
        try {
          localStorage.setItem(REG, '1');
        } catch {
          /* ignore */
        }
        setStatus('success');
        track('registration_wall_signup', {});
        setMsg(d.message || 'You’re in — The Weekly Signal is on its way.');
        setTimeout(() => setOpen(false), 2200);
      } else {
        setStatus('error');
        setMsg(d.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMsg('Network error. Please try again.');
    }
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-label="Register to keep reading"
      className="fixed bottom-0 inset-x-0 z-[90] bg-mono-black text-mono-white border-t-2 border-mono-amber shadow-2xl"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
        <div className="flex-1 min-w-0 pr-6 sm:pr-0">
          <p className="text-[10px] tracking-[0.24em] font-display font-bold text-mono-amber-bright">
            ENJOYING THE READ? IT&rsquo;S FREE
          </p>
          <p className="mt-1 font-body text-sm text-mono-soft-white">
            Register for unlimited reads + The Weekly Signal — brand, culture &amp; commercial intelligence for Africa. No paywall; just your email.
          </p>
        </div>
        {status === 'success' ? (
          <p className="text-green-400 font-body text-sm shrink-0" role="status">✓ {msg}</p>
        ) : (
          <form onSubmit={submit} className="flex items-stretch gap-2 shrink-0 w-full sm:w-auto" aria-label="Register">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              autoComplete="email"
              disabled={status === 'loading'}
              className="flex-1 sm:w-56 px-3 py-2.5 bg-mono-white/10 border border-mono-white/25 font-body text-sm text-mono-white placeholder:text-mono-gray focus:outline-none focus:border-mono-amber"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="shrink-0 px-4 py-2.5 bg-mono-amber text-mono-black font-display font-bold text-sm hover:bg-mono-amber/90 transition-colors disabled:opacity-50"
            >
              {status === 'loading' ? '…' : 'REGISTER'}
            </button>
          </form>
        )}
        <button
          onClick={dismiss}
          aria-label="Not now"
          className="absolute top-2.5 right-3 sm:static text-mono-gray hover:text-mono-white transition-colors shrink-0"
        >
          <X size={18} />
        </button>
      </div>
      {status === 'error' && (
        <p className="max-w-5xl mx-auto px-4 sm:px-6 pb-3 -mt-1 text-red-400 font-body text-xs" role="alert">{msg}</p>
      )}
    </div>
  );
}
