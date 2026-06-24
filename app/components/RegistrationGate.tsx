'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { track } from '../../lib/analytics';

// A METERED, soft registration wall (the middle funnel). It counts reads of deep
// content, and after the free limit invites the reader to register (email) to keep
// going — feeding the newsletter funnel. Soft on purpose: "Not now" dismisses for
// the session, so it never blocks crawlers or kills SEO/social discovery.
const FREE_LIMIT = 3;
const READS = 'mk:reads';
const PATHS = 'mk:read-paths';
const REG = 'mk:registered';
const DISMISS = 'mk:gate-dismissed';

// Only meter deep content — not the home/index/listing pages.
const CONTENT = /^\/(article|intelligence\/case-studies|reports|issues)\/[^/]/;

export default function RegistrationGate() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!CONTENT.test(pathname)) return;
    let reads = 0;
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
      reads = Number(localStorage.getItem(READS) || '0');
      if (!paths.includes(pathname)) {
        paths.push(pathname);
        reads += 1;
        localStorage.setItem(PATHS, JSON.stringify(paths));
        localStorage.setItem(READS, String(reads));
      }
    } catch {
      return;
    }
    if (reads > FREE_LIMIT) {
      const shown = reads;
      const t = setTimeout(() => {
        setCount(shown);
        setOpen(true);
        track('registration_wall_shown', { reads: shown });
      }, 1200);
      return () => clearTimeout(t);
    }
  }, [pathname]);

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
        setMsg(d.message || 'You’re in — unlimited reads, and The Weekly Signal is on its way.');
        setTimeout(() => setOpen(false), 1900);
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
    <div role="dialog" aria-modal="true" aria-label="Register to keep reading" className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-mono-black/70 backdrop-blur-sm">
      <div className="relative max-w-md w-full bg-mono-white p-8 shadow-2xl">
        <button onClick={dismiss} aria-label="Close" className="absolute top-4 right-4 text-mono-gray hover:text-mono-black transition-colors">
          <X size={18} />
        </button>
        <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong mb-4">KEEP READING — IT&rsquo;S FREE</p>
        <h2 className="text-2xl font-display font-bold text-mono-black leading-tight">
          You&rsquo;ve read {count} pieces. Register free to keep going.
        </h2>
        <p className="mt-3 font-body text-mono-charcoal text-sm">
          Unlimited reads + The Weekly Signal — brand, culture and commercial intelligence for Africa and its diaspora.
          No paywall; just your email.
        </p>
        {status !== 'success' ? (
          <form onSubmit={submit} className="mt-6 space-y-3" aria-label="Register">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              autoComplete="email"
              disabled={status === 'loading'}
              className="w-full px-4 py-3 bg-mono-soft-white border border-mono-gray/30 font-body text-mono-black focus:outline-none focus:border-mono-amber"
            />
            <button type="submit" disabled={status === 'loading'} className="w-full px-5 py-3 bg-mono-black text-mono-white font-display font-bold hover:bg-mono-charcoal transition-colors disabled:opacity-50">
              {status === 'loading' ? 'REGISTERING…' : 'REGISTER & KEEP READING'}
            </button>
            {status === 'error' && <p className="text-red-600 font-body text-sm" role="alert">{msg}</p>}
            <button type="button" onClick={dismiss} className="w-full text-[11px] tracking-[0.16em] font-display font-bold text-mono-gray hover:text-mono-black transition-colors">
              NOT NOW
            </button>
          </form>
        ) : (
          <p className="mt-6 text-green-600 font-body" role="status">✓ {msg}</p>
        )}
      </div>
    </div>
  );
}
