import Link from 'next/link';
import type { Metadata } from 'next';
import { Check, ArrowRight, ShieldCheck, Lock } from 'lucide-react';
import Navigation from '../components/Navigation';
import NewsletterSignup from '../components/NewsletterSignup';
import { INDEX_REPORT, reportCheckoutUrl, PRICING_TIERS, reportLaunchNote } from '../../lib/commerce';

export const metadata: Metadata = {
  title: 'Pricing — The Cultural-Signal Index | MonoKromatik',
  description:
    'Own the full Cultural-Signal Index, or buy individual intelligence reports across three tiers: single studies (R220), the deep institutional report (R3,500), and enterprise licences. Secure one-time purchase via Paystack.',
};

// The three-tier ladder is HELD from customers until the full customer-facing
// pricing display is reviewed and signed off. Off by default, so /pricing shows
// only the (already-approved) Index offer; flip on with
// NEXT_PUBLIC_SHOW_PRICING_LADDER=1 once the pricing call is made. Per-report BUY
// CTAs in the reports/articles are independent of this flag.
const SHOW_PRICING_LADDER = process.env.NEXT_PUBLIC_SHOW_PRICING_LADDER === '1';

// CTA target per report tier. Study & report browse the report shelf; enterprise
// routes to the commissioning desk (same enquiry the license/data products use).
const TIER_CTA: Record<string, { href: string; label: string }> = {
  study: { href: '/reports', label: 'BROWSE THE STUDIES' },
  report: { href: '/reports', label: 'READ THE REPORTS' },
  enterprise: { href: '/work-with-us?interest=license', label: 'TALK TO THE DESK' },
};

export default function PricingPage() {
  const checkoutUrl = reportCheckoutUrl();
  const offer = INDEX_REPORT;

  return (
    <div className="min-h-screen bg-mono-paper">
      <Navigation />

      <section className="bg-mono-black text-mono-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.35em] font-display font-bold text-mono-amber mb-7">INTELLIGENCE / PRICING</p>
          <h1 className="max-w-4xl text-5xl md:text-7xl font-display font-bold leading-[0.95]">Own the <span className="text-mono-amber">Index.</span></h1>
          <p className="mt-8 max-w-2xl text-lg md:text-xl text-mono-soft-white font-body leading-relaxed">
            The scores are free to read. The full Cultural-Signal Index — the complete ranking, every breakdown, the
            methodology and the evidence — is the intelligence product.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-2 border-mono-black bg-mono-white">
            <div className="p-7 md:p-10 border-b border-mono-gray/25">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] tracking-[0.24em] font-display font-bold text-mono-amber-strong mb-3">{offer.cadence.toUpperCase()}</p>
                  <h2 className="text-3xl md:text-4xl font-display font-bold text-mono-black leading-tight">{offer.name}</h2>
                  <p className="mt-4 font-body text-mono-charcoal text-lg max-w-xl">{offer.tagline}</p>
                </div>
                {offer.priceLabel && (
                  <span className="text-right">
                    <span className="block text-5xl font-display font-bold text-mono-black leading-none">{offer.priceLabel}</span>
                    <span className="block text-[11px] tracking-[0.18em] font-display font-bold text-mono-gray mt-2">ONE-TIME</span>
                  </span>
                )}
              </div>
            </div>

            <div className="p-7 md:p-10">
              <ul className="space-y-4">
                {offer.includes.map((item) => (
                  <li key={item} className="flex items-start gap-3 font-body text-mono-charcoal">
                    <Check size={20} className="text-mono-amber-strong shrink-0 mt-0.5" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-9">
                {checkoutUrl ? (
                  <a
                    href={checkoutUrl}
                    className="inline-flex items-center gap-2 bg-mono-black text-mono-white px-8 py-4 font-display font-bold hover:bg-mono-charcoal transition-colors"
                  >
                    GET THE REPORT{offer.priceLabel ? ` — ${offer.priceLabel}` : ''} <ArrowRight size={18} />
                  </a>
                ) : (
                  <div className="border border-mono-gray/30 bg-mono-soft-white p-6">
                    <p className="flex items-center gap-2 font-display font-bold text-mono-black"><Lock size={16} className="text-mono-amber-strong" /> Checkout opening shortly.</p>
                    <p className="mt-2 font-body text-mono-charcoal text-sm">Secure payment via Paystack is being switched on. Leave your email and we’ll send it the moment the report is live.</p>
                    <div className="mt-5">
                      <NewsletterSignup variant="footer" />
                    </div>
                  </div>
                )}
                <p className="mt-5 flex items-center gap-2 text-[12px] font-body text-mono-gray">
                  <ShieldCheck size={15} className="text-mono-amber-strong shrink-0" />
                  Payment is processed securely by Paystack. We never see your card details.
                </p>
              </div>
            </div>
          </div>

          <p className="mt-8 text-center font-body text-mono-charcoal">
            Just exploring?{' '}
            <Link href="/intelligence/signal-index" className="text-mono-amber-strong hover:text-mono-amber-hover font-display font-bold">
              Read the live Index and methodology, free →
            </Link>
          </p>
        </div>
      </section>

      {/* The report pricing ladder — three tiers, low → high commitment. The
          Index above is the whole dataset; individual intelligence reports sell
          on this ladder, so a deep institutional report is priced as its own
          tier rather than at study money. Held behind SHOW_PRICING_LADDER until
          the full pricing display is signed off. */}
      {SHOW_PRICING_LADDER && (
      <section className="py-16 md:py-24 border-t border-mono-gray/15 bg-mono-soft-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong mb-4">REPORTS & INTELLIGENCE</p>
          <h2 className="max-w-3xl text-4xl md:text-5xl font-display font-bold text-mono-black leading-[0.98] text-balance">
            Three ways to buy the intelligence.
          </h2>
          <p className="mt-6 max-w-2xl font-body text-lg text-mono-charcoal leading-relaxed">
            Beyond the full Index, individual reports publish on a three-tier ladder — from a single
            decoded study to the full enterprise licence. Pick the depth your decision needs.
          </p>

          <div className="mt-12 grid md:grid-cols-3 gap-6 items-stretch">
            {PRICING_TIERS.map((tier) => {
              const featured = tier.id === 'report';
              const cta = TIER_CTA[tier.id];
              // Only the flagship report tier carries a launch-price note.
              const launchNote = tier.id === 'report' ? reportLaunchNote('whos-buying-african-sport-2026') : null;
              return (
                <div
                  key={tier.id}
                  className={`relative flex flex-col bg-mono-white p-7 md:p-8 ${featured ? 'border-2 border-mono-black shadow-[6px_6px_0_0_var(--mono-amber)]' : 'border border-mono-gray/25'}`}
                >
                  {featured && (
                    <span className="absolute -top-3 left-7 bg-mono-amber text-mono-black text-[10px] tracking-[0.22em] font-display font-bold px-3 py-1">
                      FLAGSHIP TIER
                    </span>
                  )}
                  <p className="text-[11px] tracking-[0.24em] font-display font-bold text-mono-amber-strong">{tier.name.toUpperCase()}</p>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-4xl font-display font-bold text-mono-black leading-none">{tier.price}</span>
                    {tier.id === 'enterprise' && <span className="text-[11px] tracking-[0.14em] font-display font-bold text-mono-gray">/ SCOPE</span>}
                  </div>
                  {launchNote && (
                    <p className="mt-2 text-[11px] tracking-[0.06em] font-display font-bold text-mono-amber-strong">{launchNote}</p>
                  )}
                  <p className="mt-5 font-body text-mono-charcoal leading-relaxed">{tier.purpose}</p>
                  <ul className="mt-6 space-y-3 border-t border-mono-gray/20 pt-6">
                    {tier.includes.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 font-body text-[15px] text-mono-charcoal leading-snug">
                        <Check size={17} className="text-mono-amber-strong shrink-0 mt-0.5" aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto pt-8">
                    <Link
                      href={cta.href}
                      className={`flex items-center justify-center gap-2 px-6 py-3.5 font-display font-bold transition-colors ${
                        featured ? 'bg-mono-black text-mono-white hover:bg-mono-charcoal' : 'border border-mono-black text-mono-black hover:bg-mono-soft-white'
                      }`}
                    >
                      {cta.label} <ArrowRight size={16} />
                    </Link>
                    <p className="mt-4 text-[11px] tracking-[0.1em] font-display font-bold text-mono-gray">BUILT FOR {tier.audience.toUpperCase()}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="mt-10 flex items-center gap-2 text-[12px] font-body text-mono-gray">
            <ShieldCheck size={15} className="text-mono-amber-strong shrink-0" />
            Reports are delivered as a designed PDF. Enterprise licences add the underlying data, a briefing and citation rights.
          </p>
        </div>
      </section>
      )}
    </div>
  );
}
