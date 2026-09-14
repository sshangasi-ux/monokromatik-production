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

// One-off report fulfilment. The PDF is emailed as an ATTACHMENT (the file, never
// a shareable link): the bytes are read from a PRIVATE Supabase Storage bucket
// (service-role only — no public URL, nothing shareable) and delivered via Resend.
// Bucket/object are overridable via env. Best-effort: any failure logs and falls
// back to the manual fulfilment path (Paystack Orders), never 500s the webhook.
type Admin = NonNullable<ReturnType<typeof createAdminClient>>;
async function deliverAmapianoReport(email: string, admin: Admin): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.REPORT_DELIVERY_FROM || 'MonoKromatik <onboarding@resend.dev>';
  const bucket = process.env.REPORT_ASSET_BUCKET || 'reports';
  const objectPath = process.env.AMAPIANO_REPORT_OBJECT || 'who-captures-amapiano-value-capture-report.pdf';
  if (!apiKey) {
    console.warn('[paystack] amapiano delivery not configured (RESEND_API_KEY)');
    return;
  }
  const { data: file, error: dlErr } = await admin.storage.from(bucket).download(objectPath);
  if (dlErr || !file) {
    console.error(`[paystack] amapiano PDF not in storage (${bucket}/${objectPath}): ${dlErr?.message ?? 'missing'}`);
    return;
  }
  const base64 = Buffer.from(await file.arrayBuffer()).toString('base64');
  const html =
    '<p>Thank you for your purchase.</p>' +
    '<p>Your copy of <strong>Who Captures Amapiano? — The Value-Capture Report</strong> is attached as a PDF.</p>' +
    "<p>It maps, layer by layer, where amapiano's economy is actually captured — with eight sourced exhibits and the playbook for keeping more of a nine-figure economy at home.</p>" +
    '<p>Any issues, just reply to this email.</p>' +
    '<p>— MonoKromatik · African &amp; diaspora brand intelligence</p>';
  const text =
    'Thank you for your purchase. Your copy of "Who Captures Amapiano? — The Value-Capture Report" is attached as a PDF. Any issues, reply to this email. — MonoKromatik';
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [email],
      subject: 'Your report — Who Captures Amapiano? (The Value-Capture Report)',
      html,
      text,
      attachments: [
        { filename: 'MonoKromatik-Who-Captures-Amapiano-Value-Capture-Report.pdf', content: base64 },
      ],
    }),
  });
  if (!res.ok) console.error(`[paystack] Resend failed (${res.status}): ${await res.text()}`);
  else console.log(`[paystack] amapiano report delivered to ${email}`);
}

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

  // One-off report purchase (not a subscription charge). Identify the amapiano
  // product by a POSITIVE signal in the payload — its slug or Paystack product id
  // — never by amount, since the Scorecard is also R220. If the signal isn't
  // present we log the shape (to refine the match) and leave it to manual
  // fulfilment; we never guess and send the wrong report.
  if (type === 'charge.success' && !planCode) {
    const blob = JSON.stringify(data).toLowerCase();
    const isAmapiano = blob.includes('who-captures-amapiano') || blob.includes('2723931');
    const meta = (data.metadata ?? {}) as Record<string, unknown>;
    console.log('[paystack] one-off charge.success', {
      amount: data.amount,
      currency: data.currency,
      reference: data.reference,
      metaKeys: typeof meta === 'object' ? Object.keys(meta) : typeof meta,
      matchedAmapiano: isAmapiano,
    });
    if (isAmapiano) {
      try {
        await deliverAmapianoReport(email, admin);
      } catch (err) {
        console.error('[paystack] amapiano delivery error', err);
      }
      return NextResponse.json({ ok: true, delivered: 'amapiano-report' });
    }
  }

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
