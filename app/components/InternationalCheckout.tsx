'use client';

import { useState } from 'react';
import { Globe, ArrowRight, CreditCard } from 'lucide-react';
import { track } from '../../lib/analytics';
import { CONTACT_EMAIL } from '../../lib/commerce';

/**
 * International-buyer capture + pay rail — the fix for the single biggest live
 * revenue leak. Our Paystack checkout cannot take non-South-African cards
 * (activation pending), and the site's audience is MAJORITY international — so a
 * diaspora visitor who clicks BUY hits a silent decline. The first version of
 * this capture sat as a tiny link under the CTA behind a two-step form: GA showed
 * 3 people opened it and ZERO completed it (leads table empty). This rebuild:
 *   1. makes the international option a PROMINENT, bordered callout (not a buried
 *      link), since international buyers are the majority not the exception;
 *   2. collapses the capture to a SINGLE email field with one action, reframed
 *      from passive "notify me" to the revenue action: get a payment link + invoice;
 *   3. adds a real alternative pay rail — when NEXT_PUBLIC_INTL_PAY_URL is set
 *      (a PayPal.me / Wise / Stripe payment link), a one-click "Pay by card"
 *      button appears, so the diaspora can pay NOW without waiting on Paystack.
 * Submissions post to /api/lead (Supabase leads + team email) tagged
 * `intl-checkout` and fire `international_buyer_intent`, so the demand is captured
 * and visible instead of lost.
 */

const VALID_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// A direct international payment link (PayPal.me / Wise / Stripe Payment Link).
// Set it in Vercel as NEXT_PUBLIC_INTL_PAY_URL to let diaspora buyers pay in one
// click. Empty = they request a link by email and we invoice within hours.
const PAY_URL = (process.env.NEXT_PUBLIC_INTL_PAY_URL || '').trim();

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
    track('international_buyer_intent', { slug, surface, step: 'submit' });
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: addr,
          source: 'intl-checkout',
          interest: 'international-payment',
          message:
            `International buyer wants to pay NOW. Item: ${title} (${slug})${price ? ` · ${price}` : ''}. ` +
            `Send a card payment link + invoice.`,
        }),
      });
      setState(res.ok ? 'done' : 'error');
    } catch {
      setState('error');
    }
  };

  if (state === 'done') {
    return (
      <div className="mt-4 border border-mono-amber/60 bg-mono-soft-white p-4 text-left">
        <p className="text-[13px] font-body text-mono-charcoal leading-relaxed">
          Got it — we&rsquo;ll email a secure payment link and invoice to{' '}
          <strong>{email.trim().toLowerCase()}</strong> shortly (most within the day) so you can pay by
          international card or bank transfer.
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
          className="flex w-full items-center justify-between gap-3 border border-mono-amber/60 bg-mono-soft-white px-4 py-3 text-left transition-colors hover:border-mono-amber"
        >
          <span className="inline-flex items-center gap-2 text-[13px] font-display font-bold text-mono-ink">
            <Globe size={16} className="text-mono-amber-strong shrink-0" />
            Paying from outside South Africa?
          </span>
          <span className="inline-flex items-center gap-1 text-[12px] font-display font-bold text-mono-amber-strong">
            Pay here <ArrowRight size={14} />
          </span>
        </button>
      ) : (
        <div className="border border-mono-amber/60 bg-mono-soft-white p-5 text-left">
          <div className="flex items-start gap-2">
            <Globe size={16} className="text-mono-amber-strong mt-0.5 shrink-0" />
            <div>
              <p className="text-[13px] font-display font-bold text-mono-ink">Pay from outside South Africa</p>
              <p className="mt-1 text-[12.5px] font-body text-mono-charcoal leading-relaxed">
                Our local checkout can&rsquo;t take international cards yet — here&rsquo;s how to pay now.
              </p>
            </div>
          </div>

          {PAY_URL && (
            <a
              href={PAY_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track('international_buyer_intent', { slug, surface, step: 'pay_click' })}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 bg-mono-amber px-5 py-3 font-display font-bold text-[13px] text-mono-black transition-colors hover:bg-mono-amber/90"
            >
              <CreditCard size={16} /> Pay {price ? `${price} ` : ''}by international card <ArrowRight size={16} />
            </a>
          )}

          <form onSubmit={submit} className="mt-3">
            <p className="text-[12px] font-body text-mono-charcoal mb-2">
              {PAY_URL
                ? 'Prefer an invoice, or paying in your own currency? Leave your email and we’ll send a payment link + invoice:'
                : 'Leave your email and we’ll send you a secure international payment link and invoice (most within the day):'}
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
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
                {state === 'sending' ? 'SENDING…' : 'SEND ME A PAY LINK'}
                <ArrowRight size={14} />
              </button>
            </div>
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
