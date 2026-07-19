import Link from 'next/link';
import type { Metadata } from 'next';
import { Check, ShieldCheck } from 'lucide-react';
import Navigation from '../components/Navigation';
import NewsletterSignup from '../components/NewsletterSignup';
import { MEMBERSHIP, membershipCheckoutUrl } from '../../lib/commerce';
import { createClient, isSupabaseConfigured } from '../../lib/supabase/server';
import { getEntitlement, entitlementActive } from '../../lib/entitlements';
import { getAllCaseStudies, isLocked as isCaseStudyLocked } from '../../lib/case-studies';
import { getLiveReports, isLocked as isReportLocked } from '../../lib/reports';

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

  // Proof-of-shelf: surface the actual members-only catalogue so the value is
  // shown, not just asserted. Each title links into the piece (free teaser → gate).
  const premiumStudies = getAllCaseStudies().filter(isCaseStudyLocked);
  const premiumReports = getLiveReports().filter(isReportLocked);
  const shelfCount = premiumStudies.length + premiumReports.length;
  const showcase = [
    ...premiumStudies.slice(0, 8).map((c) => ({ href: `/intelligence/case-studies/${c.slug}`, title: c.title, label: c.brand || 'Case study' })),
    ...premiumReports.slice(0, 4).map((r) => ({ href: `/reports/${r.slug}`, title: r.title, label: r.series || 'Intelligence report' })),
  ];

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

      {/* Proof of shelf — show the members-only catalogue, don't just assert it */}
      <section className="py-16 md:py-20 border-b border-mono-gray/15">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong mb-4">WHAT MEMBERSHIP UNLOCKS</p>
          <h2 className="max-w-3xl text-3xl md:text-5xl font-display font-bold text-mono-black leading-[1.03]">
            {shelfCount} members-only decodes and reports — plus the full Cultural-Signal Index.
          </h2>
          <p className="mt-5 max-w-2xl font-body text-mono-charcoal text-lg leading-relaxed">
            Not a teaser feed. The complete strategic decode of who authors African brand value and who captures it — every
            bet, creative move, evidence ledger and lesson. A sample of what&rsquo;s behind the membership:
          </p>

          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-mono-gray/20 border border-mono-gray/20">
            {showcase.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group bg-mono-white p-6 hover:bg-mono-soft-white transition-colors flex flex-col justify-between min-h-[8.5rem]"
              >
                <p className="text-[10px] tracking-[0.2em] font-display font-bold text-mono-amber-strong mb-3 line-clamp-1">{item.label.toUpperCase()}</p>
                <h3 className="font-display font-bold text-mono-black leading-snug group-hover:text-mono-charcoal line-clamp-3">{item.title}</h3>
              </Link>
            ))}
          </div>
          {shelfCount > showcase.length && (
            <p className="mt-6 font-body text-mono-gray text-sm">…and {shelfCount - showcase.length} more members-only decodes and reports, with new work every week.</p>
          )}
        </div>
      </section>

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
