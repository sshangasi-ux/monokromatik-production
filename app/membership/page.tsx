import Link from 'next/link';
import type { Metadata } from 'next';
import { Check, ShieldCheck } from 'lucide-react';
import Navigation from '../components/Navigation';
import NewsletterSignup from '../components/NewsletterSignup';
import { MEMBERSHIP, membershipCheckoutUrl } from '../../lib/commerce';
import { createClient, isSupabaseConfigured } from '../../lib/supabase/server';
import { getEntitlement, entitlementActive } from '../../lib/entitlements';

export const metadata: Metadata = {
  title: 'Membership — The Intelligence | MonoKromatik',
  description:
    'Join the Intelligence membership: the full Cultural-Signal Index, every premium case study and report, and the searchable archive — one membership, billed via Paystack.',
};

export const dynamic = 'force-dynamic';

export default async function MembershipPage() {
  let userEmail: string | null = null;
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userEmail = user?.email ?? null;
  }
  const entitlement = await getEntitlement();
  const member = entitlementActive(entitlement);

  return (
    <div className="min-h-screen bg-mono-paper">
      <Navigation />

      <section className="bg-mono-black text-mono-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.35em] font-display font-bold text-mono-amber mb-7">INTELLIGENCE / MEMBERSHIP</p>
          <h1 className="max-w-4xl text-5xl md:text-7xl font-display font-bold leading-[0.95]">The depth, <span className="text-mono-amber">on tap.</span></h1>
          <p className="mt-8 max-w-2xl text-lg md:text-xl text-mono-soft-white font-body leading-relaxed">
            The signals stay free. Membership unlocks the full Cultural-Signal Index, every premium case study and
            report, and the searchable archive — one membership, the whole intelligence layer.
          </p>
        </div>
      </section>

      {member && (
        <section className="bg-mono-amber/10 border-y border-mono-amber/30 py-6">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
            <p className="font-display font-bold text-mono-black">✓ You&rsquo;re a member{entitlement?.tier ? ` — ${entitlement.tier} tier` : ''}. The full Intelligence layer is unlocked.</p>
            <Link href="/account" className="text-mono-amber-strong hover:text-mono-amber-hover font-display font-bold">MANAGE →</Link>
          </div>
        </section>
      )}

      <section className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6 items-start">
            {MEMBERSHIP.map((tier) => {
              const url = membershipCheckoutUrl(tier.id);
              return (
                <div
                  key={tier.id}
                  className={`bg-mono-white p-7 md:p-9 ${tier.featured ? 'border-2 border-mono-black' : 'border border-mono-gray/25'}`}
                >
                  {tier.featured && (
                    <span className="inline-block text-[10px] tracking-[0.22em] px-3 py-1.5 bg-mono-amber text-mono-black font-display font-bold mb-5">MOST POPULAR</span>
                  )}
                  <h2 className="text-2xl font-display font-bold text-mono-black">{tier.name}</h2>
                  <p className="mt-2 font-body text-mono-charcoal">{tier.tagline}</p>
                  <div className="mt-6 flex items-baseline gap-2">
                    <span className="text-4xl font-display font-bold text-mono-black">{tier.priceMonthly}</span>
                    <span className="text-mono-gray font-display font-bold text-sm">/mo</span>
                  </div>
                  {tier.priceAnnual && (
                    <p className="mt-1 text-[12px] font-body text-mono-gray">or {tier.priceAnnual}/yr — two months free</p>
                  )}
                  <ul className="mt-7 space-y-3">
                    {tier.includes.map((item) => (
                      <li key={item} className="flex items-start gap-3 font-body text-mono-charcoal text-sm">
                        <Check size={18} className="text-mono-amber-strong shrink-0 mt-0.5" aria-hidden="true" /> {item}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8">
                    {member ? (
                      <Link href="/account" className="block text-center border border-mono-black text-mono-black px-7 py-4 font-display font-bold hover:bg-mono-soft-white transition-colors">
                        YOUR MEMBERSHIP
                      </Link>
                    ) : url ? (
                      userEmail ? (
                        <a href={`${url}?email=${encodeURIComponent(userEmail)}`} className="block text-center bg-mono-black text-mono-white px-7 py-4 font-display font-bold hover:bg-mono-charcoal transition-colors">
                          SUBSCRIBE — {tier.priceMonthly}/mo
                        </a>
                      ) : (
                        <Link href="/account?next=/membership" className="block text-center bg-mono-black text-mono-white px-7 py-4 font-display font-bold hover:bg-mono-charcoal transition-colors">
                          SIGN IN TO SUBSCRIBE
                        </Link>
                      )
                    ) : (
                      <div className="border border-mono-gray/30 bg-mono-soft-white p-5 text-center">
                        <p className="font-display font-bold text-mono-black text-sm">Memberships open soon.</p>
                        <p className="mt-1 text-[12px] font-body text-mono-charcoal">Get notified the moment they launch.</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {!membershipCheckoutUrl('individual') && (
            <div className="mt-10 max-w-md mx-auto">
              <NewsletterSignup source="membership-waitlist" />
            </div>
          )}

          <p className="mt-10 flex items-center justify-center gap-2 text-[12px] font-body text-mono-gray">
            <ShieldCheck size={15} className="text-mono-amber-strong shrink-0" />
            Billing via Paystack — secure, cancel anytime. We never see your card details.
          </p>
          <p className="mt-4 text-center font-body text-mono-charcoal">
            Not ready?{' '}
            <Link href="/intelligence/signal-index" className="text-mono-amber-strong hover:text-mono-amber-hover font-display font-bold">
              Read the live Index, free →
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
