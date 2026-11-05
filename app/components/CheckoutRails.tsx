'use client';

import { useState } from 'react';
import { ArrowRight, ChevronDown, Copy, Check } from 'lucide-react';
import { track } from '../../lib/analytics';
import { checkoutRails, FNB_ACCOUNT, CONTACT_EMAIL } from '../../lib/commerce';

// The report BUY CTA as an ordered rail stack: PayPal primary (cards worldwide,
// no account needed — this is what unblocks diaspora buyers), FNB bank transfer
// secondary (no-fee SA EFT), Paystack last backup (local card/EFT). The primary
// rail renders as the amber button; the rest sit under "Other ways to pay".
// Every checkout click fires report_buy_click with its provider so the funnel
// shows which rail converts. PayPal/Paystack open hosted checkouts; FNB expands
// to the account details (manual EFT — the report is sent once payment reflects).
export default function CheckoutRails({
  slug,
  price,
  theme = 'light',
  primaryClassName,
  compact = false,
  align = 'center',
  label = 'BUY THIS REPORT',
}: {
  slug: string;
  title?: string;
  price?: string | null;
  theme?: 'light' | 'dark';
  primaryClassName?: string;
  compact?: boolean;
  align?: 'center' | 'start';
  /** Verb phrase on the primary button (price is appended). Default "BUY THIS REPORT". */
  label?: string;
}) {
  const rails = checkoutRails(slug);
  const [openFnb, setOpenFnb] = useState(false);
  const [copied, setCopied] = useState(false);

  if (rails.length === 0) return null;

  const primary = rails[0];
  const rest = rails.slice(1);
  const muted = theme === 'dark' ? 'text-mono-gray' : 'text-mono-gray';
  const altLink = theme === 'dark' ? 'text-mono-soft-white hover:text-mono-amber' : 'text-mono-charcoal hover:text-mono-amber';

  const fire = (provider: string) => track('report_buy_click', { slug, price: price ?? undefined, provider });

  const buyLabel = `${label}${price ? ` — ${price}` : ''}`;
  const btnClass =
    primaryClassName ||
    'inline-flex items-center justify-center gap-2 bg-mono-amber text-mono-black px-8 py-4 font-display font-bold text-base hover:bg-mono-amber/90 transition-colors';

  const copyAccount = async () => {
    try {
      await navigator.clipboard.writeText(FNB_ACCOUNT.account);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — the number is visible to copy manually */
    }
  };

  const PrimaryButton =
    primary.provider === 'fnb' ? (
      <button type="button" onClick={() => setOpenFnb((v) => !v)} className={btnClass}>
        {buyLabel} <ChevronDown size={16} className={openFnb ? 'rotate-180 transition-transform' : 'transition-transform'} />
      </button>
    ) : (
      <a
        href={primary.url ?? undefined}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => fire(primary.provider)}
        className={btnClass}
      >
        {buyLabel} <ArrowRight size={16} />
      </a>
    );

  return (
    <div className={`flex flex-col gap-3 w-full ${align === 'start' ? 'items-start text-left' : 'items-center text-center'}`}>
      {PrimaryButton}

      {/* Primary rail's one-line reassurance. */}
      <p className={`text-[11px] tracking-[0.04em] font-body ${muted}`}>
        {primary.note}
        {primary.provider === 'paypal' ? ' · billed in USD' : ''}
      </p>

      {/* Compact (hero teaser) stops here — the full rail stack lives on the gate. */}
      {!compact && rest.length > 0 && (
        <div className="mt-1 flex flex-col items-center gap-2">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[12px] font-display font-bold tracking-[0.03em]">
            <span className={muted}>Other ways to pay:</span>
            {rest.map((rail) =>
              rail.provider === 'fnb' ? (
                <button
                  key={rail.provider}
                  type="button"
                  onClick={() => setOpenFnb((v) => !v)}
                  className={`inline-flex items-center gap-1 underline underline-offset-4 ${altLink}`}
                >
                  SA bank transfer <ChevronDown size={13} className={openFnb ? 'rotate-180' : ''} />
                </button>
              ) : (
                <a
                  key={rail.provider}
                  href={rail.url ?? undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => fire(rail.provider)}
                  className={`underline underline-offset-4 ${altLink}`}
                >
                  SA card (Paystack)
                </a>
              ),
            )}
          </div>

          {openFnb && (
            <div className="mt-2 w-full max-w-sm text-left border border-mono-amber/60 bg-mono-white p-4 text-mono-charcoal">
              <p className="text-[12px] font-body leading-snug">
                EFT directly, using <strong>your name + email as the reference</strong>. Email proof to{' '}
                <a href={`mailto:${CONTACT_EMAIL}`} className="underline text-mono-amber">
                  {CONTACT_EMAIL}
                </a>{' '}
                and your report is sent as soon as payment reflects.
              </p>
              <dl className="mt-3 grid grid-cols-[auto,1fr] gap-x-4 gap-y-1 text-[12px] font-body">
                <dt className="text-mono-gray">Account name</dt>
                <dd className="font-bold">{FNB_ACCOUNT.holder}</dd>
                <dt className="text-mono-gray">Bank</dt>
                <dd className="font-bold">{FNB_ACCOUNT.bank}</dd>
                <dt className="text-mono-gray">Account no.</dt>
                <dd className="font-bold inline-flex items-center gap-2">
                  {FNB_ACCOUNT.account}
                  <button type="button" onClick={copyAccount} className="text-mono-amber" aria-label="Copy account number">
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                  </button>
                </dd>
                <dt className="text-mono-gray">Branch code</dt>
                <dd className="font-bold">{FNB_ACCOUNT.branch}</dd>
                <dt className="text-mono-gray">SWIFT</dt>
                <dd className="font-bold">{FNB_ACCOUNT.swift}</dd>
                {price && (
                  <>
                    <dt className="text-mono-gray">Amount</dt>
                    <dd className="font-bold">{price}</dd>
                  </>
                )}
              </dl>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
