import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, UserRound } from 'lucide-react';
import Navigation from '../components/Navigation';
import SignIn from './SignIn';
import SignOutButton from './SignOutButton';
import { createClient, isSupabaseConfigured } from '../../lib/supabase/server';
import { getEntitlement, entitlementActive } from '../../lib/entitlements';

export const metadata: Metadata = {
  title: 'Account — MonoKromatik',
  description: 'Sign in to your MonoKromatik Intelligence account.',
};

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const configured = isSupabaseConfigured();
  let email: string | null = null;
  if (configured) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    email = data.user?.email ?? null;
  }
  const entitlement = email ? await getEntitlement() : null;
  const member = entitlementActive(entitlement);

  return (
    <div className="min-h-screen bg-mono-paper">
      <Navigation />
      <section className="bg-mono-black text-mono-white py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.35em] font-display font-bold text-mono-amber mb-7">INTELLIGENCE / ACCOUNT</p>
          <h1 className="text-5xl md:text-6xl font-display font-bold leading-[0.95]">{email ? 'Your account.' : 'Sign in.'}</h1>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          {!configured ? (
            <div className="border border-mono-gray/25 bg-mono-white p-7 text-center">
              <p className="font-display font-bold text-mono-black text-lg">Accounts open soon.</p>
              <p className="mt-2 font-body text-mono-charcoal text-sm">Sign-in is being switched on. In the meantime, explore the live Index.</p>
              <Link href="/intelligence/signal-index" className="mt-5 inline-flex items-center gap-2 text-mono-amber-strong hover:text-mono-amber-hover font-display font-bold">THE INDEX <ArrowRight size={16} /></Link>
            </div>
          ) : email ? (
            <div className="border border-mono-gray/25 bg-mono-white p-7">
              <div className="flex items-center gap-4 mb-6">
                <span className="w-12 h-12 rounded-full bg-mono-black text-mono-white flex items-center justify-center"><UserRound size={22} /></span>
                <div>
                  <p className="text-[11px] tracking-[0.18em] font-display font-bold text-mono-gray">SIGNED IN AS</p>
                  <p className="font-display font-bold text-mono-black">{email}</p>
                </div>
              </div>
              <div className="border-t border-mono-gray/20 pt-6">
                <p className="text-[11px] tracking-[0.18em] font-display font-bold text-mono-gray mb-2">MEMBERSHIP</p>
                {member ? (
                  <p className="font-display font-bold text-mono-black">
                    Active{entitlement?.tier ? ` — ${entitlement.tier} tier` : ''}
                    {entitlement?.current_period_end ? `, renews ${new Date(entitlement.current_period_end).toLocaleDateString()}` : ''}.
                  </p>
                ) : (
                  <p className="font-body text-mono-charcoal text-sm">No active membership yet.</p>
                )}
                <div className="mt-5 flex flex-wrap items-center gap-4">
                  <Link href="/membership" className="inline-flex items-center gap-2 bg-mono-black text-mono-white px-6 py-3 font-display font-bold hover:bg-mono-charcoal transition-colors">
                    {member ? 'MANAGE MEMBERSHIP' : 'BECOME A MEMBER'} <ArrowRight size={16} />
                  </Link>
                  <SignOutButton />
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-mono-gray/25 bg-mono-white p-7">
              <p className="font-body text-mono-charcoal mb-6">Sign in with a magic link — no password. We&rsquo;ll email you a one-time sign-in link.</p>
              <SignIn />
              <p className="mt-6 text-[12px] font-body text-mono-gray">New here? The same link creates your account.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
