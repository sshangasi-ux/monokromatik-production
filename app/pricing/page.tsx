import Link from 'next/link';
import type { Metadata } from 'next';
import { Check, ArrowRight, ShieldCheck, Lock } from 'lucide-react';
import Navigation from '../components/Navigation';
import NewsletterSignup from '../components/NewsletterSignup';
import { INDEX_REPORT, reportCheckoutUrl } from '../../lib/commerce';

export const metadata: Metadata = {
  title: 'Pricing — The Cultural-Signal Index | MonoKromatik',
  description:
    'Own the full Cultural-Signal Index: the complete ranked read of who authors African influence, with the methodology and evidence. One-time purchase.',
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
    </div>
  );
}
