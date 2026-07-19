import { NextResponse } from 'next/server';
import { createClient, isSupabaseConfigured } from '../../../lib/supabase/server';

// Self-serve membership management. Generates a Paystack-hosted "manage
// subscription" link (update card / CANCEL) for the signed-in member and
// redirects to it — so "cancel anytime" is actually true. Falls back to
// /account?manage=<reason> (which shows the email route) if anything is missing.
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  const fail = (reason: string) => NextResponse.redirect(`${origin}/account?manage=${reason}`);

  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!isSupabaseConfigured() || !secret) return fail('unavailable');

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.redirect(`${origin}/account`);

  // The subscription code is written by the Paystack webhook (subscription.create).
  // RLS lets the owner read their own entitlement row.
  const { data } = await supabase
    .from('entitlements')
    .select('paystack_subscription_code')
    .eq('email', user.email)
    .maybeSingle();
  const code = (data as { paystack_subscription_code?: string | null } | null)?.paystack_subscription_code;
  if (!code) return fail('nocode');

  try {
    const res = await fetch(`https://api.paystack.co/subscription/${encodeURIComponent(code)}/manage/link/`, {
      headers: { Authorization: `Bearer ${secret}` },
      cache: 'no-store',
    });
    const body = (await res.json()) as { data?: { link?: string } };
    const link = body?.data?.link;
    if (!res.ok || !link) return fail('error');
    return NextResponse.redirect(link);
  } catch {
    return fail('error');
  }
}
