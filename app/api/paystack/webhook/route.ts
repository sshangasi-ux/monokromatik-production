import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { createAdminClient } from '../../../../lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Paystack subscription webhook → upserts the user's entitlement (by email).
// Verifies the HMAC-SHA512 signature with the server-only secret; writes via the
// service-role client (bypasses RLS). Maps plan codes to tiers via env.
const TIER_BY_PLAN: Record<string, string> = {
  [process.env.PAYSTACK_PLAN_INDIVIDUAL || '__none_i']: 'individual',
  [process.env.PAYSTACK_PLAN_TEAM || '__none_t']: 'team',
};

const ACTIVE = ['subscription.create', 'subscription.enable', 'invoice.create', 'invoice.update'];
const INACTIVE = ['subscription.disable', 'subscription.not_renew', 'invoice.payment_failed'];

export async function POST(req: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  const admin = createAdminClient();
  if (!secret || !admin) return NextResponse.json({ error: 'not configured' }, { status: 503 });

  const raw = await req.text();
  const signature = req.headers.get('x-paystack-signature') ?? '';
  const expected = crypto.createHmac('sha512', secret).update(raw).digest('hex');
  if (signature !== expected) return NextResponse.json({ error: 'invalid signature' }, { status: 401 });

  let event: { event?: string; data?: Record<string, unknown> };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'bad json' }, { status: 400 });
  }

  const type = event.event ?? '';
  const data = (event.data ?? {}) as Record<string, unknown>;
  const customer = (data.customer ?? {}) as Record<string, unknown>;
  const email = String(customer.email ?? data.email ?? '').toLowerCase() || null;
  if (!email) return NextResponse.json({ ok: true, note: 'no email' });

  const plan = (data.plan ?? {}) as Record<string, unknown>;
  const planCode = String(plan.plan_code ?? data.plan ?? '');
  const tier = TIER_BY_PLAN[planCode] ?? null;

  // 'charge.success' fires for one-off purchases too — only treat it as a
  // membership signal when it carries a subscription plan.
  const isSubCharge = type === 'charge.success' && !!planCode;

  let status: string | null = null;
  if (ACTIVE.includes(type) || isSubCharge) status = 'active';
  else if (INACTIVE.includes(type)) status = 'inactive';
  if (!status) return NextResponse.json({ ok: true, ignored: type });

  const row: Record<string, unknown> = { email, status, updated_at: new Date().toISOString() };
  if (tier) row.tier = tier;
  if (customer.customer_code) row.paystack_customer_code = customer.customer_code;
  if (data.subscription_code) row.paystack_subscription_code = data.subscription_code;
  const periodEnd = data.next_payment_date as string | undefined;
  if (periodEnd) row.current_period_end = new Date(periodEnd).toISOString();

  const { error } = await admin.from('entitlements').upsert(row, { onConflict: 'email' });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
