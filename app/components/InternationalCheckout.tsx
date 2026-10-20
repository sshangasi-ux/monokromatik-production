'use client';

import { useState } from 'react';
import { Globe, ArrowRight } from 'lucide-react';
import { track } from '../../lib/analytics';
import { CONTACT_EMAIL } from '../../lib/commerce';

/**
 * International-buyer capture — the one honest answer to the single biggest live
 * revenue leak. Our Paystack checkout cannot yet take non-South-African cards
 * (activation pending with Paystack support), so a diaspora visitor who clicks
 * BUY and enters a card hits a decline with no fallback — the WARMEST buyer on
 * the site, lost silently and unmeasured.
 *
 * This turns that loss into a capture. It sits under the buy CTA, stays out of
 * the way of local (ZAR) buyers, and offers the two things an international
 * buyer can actually act on today: be notified the moment international cards go
 * live, or request a manual invoice to pay now. Both post to the existing
 * /api/lead route (Supabase leads + team email) tagged `intl-checkout`, and
 * fire `international_buyer_intent` so diaspora buy-intent is finally visible in
 * the funnel. No new plumbing; no Paystack dependency; works the day the toggle
 * flips.
 */

type Mode = 'notify' | 'invoice';
const VALID_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function InternationalCheckout({
  slug,
  title,
  price,
  surface = 'report-gate',
}: {
  slug: string;
  title: string;
  price?: string | null;
  surface?: string;
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('notify');
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  const expand = () => {
    if (!open) track('international_buyer_intent', { slug, surface, step: 'open' });
    setOpen((o) => !o);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const addr = email.trim().toLowerCase();
    if (!VALID_EMAIL.test(addr)) {
      setState('error');
      return;
    }
    setState('sending');
    track('international_buyer_intent', { slug, surface, step: 'submit', mode });
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: addr,
          source: 'intl-checkout',
          interest: 'international-payment',
          message:
            `International buyer — ${mode === 'invoice' ? 'requests an INVOICE to pay now' : 'notify when international cards go live'}. ` +
            `Item: ${title} (${slug})${price ? ` · ${price}` : ''}.`,
        }),
      });
      setState(res.ok ? 'done' : 'error');
    } catch {
      setState('error');
    }
  };

  if (state === 'done') {
    return (
      <div className="mt-4 border border-mono-amber/50 bg-mono-soft-white p-4 text-left">
        <p className="text-[13px] font-body text-mono-charcoal leading-relaxed">
          {mode === 'invoice'
            ? <>Got it — we&rsquo;ll email an invoice to <strong>{email.trim().toLowerCase()}</strong> shortly so you can pay by bank transfer.</>
            : <>Got it — we&rsquo;ll email <strong>{email.trim().toLowerCase()}</strong> the moment international cards go live on checkout.</>}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      {!open ? (
        <button
          type="button"
          onClick={expand}
          className="inline-flex items-center gap-2 text-[12px] font-display font-bold text-mono-charcoal hover:text-mono-amber-strong transition-colors"
        >
          <Globe size={14} className="text-mono-amber-strong" />
          Paying from outside South Africa?
          <span className="underline underline-offset-2">Tap here</span>
        </button>
      ) : (
        <div className="border border-mono-amber/60 bg-mono-soft-white p-5 text-left">
          <div className="flex items-start gap-2">
            <Globe size={16} className="text-mono-amber-strong mt-0.5 shrink-0" />
            <div>
              <p className="text-[13px] font-display font-bold text-mono-ink">Outside South Africa?</p>
              <p className="mt-1 text-[12.5px] font-body text-mono-charcoal leading-relaxed">
                We&rsquo;re activating international card payments — not live on checkout yet. Leave your email and we&rsquo;ll reach out the moment they are, or request an invoice to pay now by bank transfer.
              </p>
            </div>
          </div>

          <div className="mt-4 flex gap-2" role="radiogroup" aria-label="How to proceed">
            {([['notify', "Notify me when it's live"], ['invoice', 'Send me an invoice']] as [Mode, string][]).map(([m, label]) => (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={mode === m}
                onClick={() => setMode(m)}
                className={`flex-1 min-w-0 text-[11.5px] font-display font-bold px-3 py-2.5 border transition-colors ${
                  mode === m
                    ? 'border-mono-amber bg-mono-amber/15 text-mono-ink'
                    : 'border-mono-gray/40 text-mono-charcoal hover:border-mono-amber/60'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="mt-3 flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (state === 'error') setState('idle'); }}
              placeholder="you@email.com"
              aria-label="Your email"
              className="flex-1 min-w-0 border border-mono-gray/40 bg-mono-white px-3 py-2.5 text-[13px] font-body text-mono-ink placeholder:text-mono-gray focus:border-mono-amber outline-none"
            />
            <button
              type="submit"
              disabled={state === 'sending'}
              className="inline-flex items-center justify-center gap-2 bg-mono-black text-mono-white px-5 py-2.5 font-display font-bold text-[12px] hover:bg-mono-charcoal transition-colors disabled:opacity-60"
            >
              {state === 'sending' ? 'SENDING…' : mode === 'invoice' ? 'REQUEST INVOICE' : 'NOTIFY ME'}
              <ArrowRight size={14} />
            </button>
          </form>

          {state === 'error' && (
            <p className="mt-2 text-[12px] font-body text-mono-charcoal">
              That didn&rsquo;t go through. Email us directly at{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-mono-amber-strong underline underline-offset-2">{CONTACT_EMAIL}</a>.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
