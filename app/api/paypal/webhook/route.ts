import { NextResponse } from 'next/server';
import { createAdminClient } from '../../../../lib/supabase/admin';
import { matchReport, deliverReport, matchBundle, deliverBundle, alertUnmatchedPurchase } from '../../../../lib/report-delivery';
import { paypalSlugFromBlob } from '../../../../lib/commerce';
import { trackPurchase } from '../../../../lib/ga-measurement';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// PayPal one-off purchase webhook → emails the report PDF, mirroring the Paystack
// rail (lib/report-delivery is shared). PayPal is the PRIMARY rail because it takes
// cards worldwide (the diaspora blocker Paystack's disabled international leaves
// open). Dormant until the three env vars are set, so it ships safely ahead of the
// PayPal REST app:
//   PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET  — REST app (developer.paypal.com)
//   PAYPAL_WEBHOOK_ID                         — the webhook's id (for verification)
//   PAYPAL_ENV = 'live' | 'sandbox'           — defaults to 'live'
const API_BASE = (process.env.PAYPAL_ENV || 'live') === 'sandbox' ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com';

async function accessToken(id: string, secret: string): Promise<string | null> {
  const res = await fetch(`${API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${id}:${secret}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) return null;
  const j = (await res.json()) as { access_token?: string };
  return j.access_token ?? null;
}

// Fetch the full order behind a capture. An NCP payment-link CAPTURE payload is
// sparse — it often omits the item name/description that identifies the report —
// but the ORDER carries purchase_units[].items[].name, description, custom_id and
// invoice_id. Folding the order into the match blob is what makes PayPal auto-
// delivery reliable. Best-effort: on any failure we fall back to the capture blob
// alone (and ultimately to the manual-fulfilment alert), never throwing.
async function fetchOrder(token: string, orderId: string): Promise<unknown | null> {
  try {
    const res = await fetch(`${API_BASE}/v2/checkout/orders/${encodeURIComponent(orderId)}`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// Verify the event with PayPal rather than trusting the POST — the only guard that
// a charge is real (same role as Paystack's HMAC signature check).
async function verify(token: string, headers: Headers, webhookId: string, body: unknown): Promise<boolean> {
  const res = await fetch(`${API_BASE}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      auth_algo: headers.get('paypal-auth-algo'),
      cert_url: headers.get('paypal-cert-url'),
      transmission_id: headers.get('paypal-transmission-id'),
      transmission_sig: headers.get('paypal-transmission-sig'),
      transmission_time: headers.get('paypal-transmission-time'),
      webhook_id: webhookId,
      webhook_event: body,
    }),
  });
  if (!res.ok) return false;
  const j = (await res.json()) as { verification_status?: string };
  return j.verification_status === 'SUCCESS';
}

// Recursively pull the first email-looking string out of the resource — the buyer
// email can sit at payer.email_address, payee-adjacent fields or supplementary
// data depending on the flow, so we search rather than assume one path.
function findEmail(obj: unknown, depth = 0): string | null {
  if (!obj || depth > 6) return null;
  if (typeof obj === 'string') return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(obj) ? obj.toLowerCase() : null;
  if (Array.isArray(obj)) {
    for (const v of obj) {
      const e = findEmail(v, depth + 1);
      if (e) return e;
    }
    return null;
  }
  if (typeof obj === 'object') {
    const rec = obj as Record<string, unknown>;
    // Prefer an explicit payer email before scanning everything else.
    const direct = rec['email_address'];
    if (typeof direct === 'string' && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(direct)) return direct.toLowerCase();
    for (const v of Object.values(rec)) {
      const e = findEmail(v, depth + 1);
      if (e) return e;
    }
  }
  return null;
}

export async function POST(req: Request) {
  const id = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  const admin = createAdminClient();
  if (!id || !secret || !webhookId || !admin) return NextResponse.json({ error: 'not configured' }, { status: 503 });

  const raw = await req.text();
  let event: { event_type?: string; resource?: Record<string, unknown> };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'bad json' }, { status: 400 });
  }

  const token = await accessToken(id, secret);
  if (!token) return NextResponse.json({ error: 'auth' }, { status: 502 });
  const ok = await verify(token, req.headers, webhookId, event);
  if (!ok) return NextResponse.json({ error: 'invalid signature' }, { status: 401 });

  const type = event.event_type ?? '';
  // A completed capture is the money-in-hand event. (ORDER.APPROVED fires earlier,
  // before capture, so we deliver on the capture to avoid shipping on an
  // un-captured order.)
  if (type !== 'PAYMENT.CAPTURE.COMPLETED') return NextResponse.json({ ok: true, ignored: type });

  const resource = (event.resource ?? {}) as Record<string, unknown>;

  // Pull the full order behind the capture to widen the match signal (the capture
  // alone is sparse). order_id lives under supplementary_data.related_ids.
  const relatedIds = ((resource.supplementary_data as Record<string, unknown> | undefined)?.related_ids ??
    {}) as Record<string, unknown>;
  const orderId = relatedIds.order_id ? String(relatedIds.order_id) : null;
  const order = orderId ? await fetchOrder(token, orderId) : null;

  // Buyer email can sit on the capture OR only on the order (payer.email_address).
  const email = findEmail(resource) ?? findEmail(order);

  // Match ONLY on merchant-controlled fields (payment-link code / item name /
  // custom_id / invoice_id / description) — never the buyer's email or the amount
  // (reports share a price). Fold in the order, and hyphen-normalise the blob so a
  // PayPal item name like "The Value-Capture Scorecard 2026" hits the registry's
  // hyphenated slug tokens.
  const rawBlob = (JSON.stringify(resource) + ' ' + JSON.stringify(order ?? {})).toLowerCase();
  const normBlob = rawBlob.replace(/[^a-z0-9]+/g, '-');
  const signal = `${rawBlob} ${normBlob}`;

  const amount = (resource.amount ?? {}) as Record<string, unknown>;
  const currency = amount.currency_code ? String(amount.currency_code) : 'USD';
  const value = amount.value ? Number(amount.value) : null;
  const reference = resource.id ? String(resource.id) : null;

  // Deterministic first pass: each report has its own dedicated PayPal link, so if
  // the link CODE appears anywhere in the capture or order, that pins the report
  // 1:1 — safer than any token heuristic. (Bundles have no PayPal link yet.)
  const linkSlug = paypalSlugFromBlob(signal);
  if (linkSlug) {
    if (email) {
      try {
        await deliverReport(email, admin, linkSlug);
      } catch (err) {
        console.error('[paypal] delivery error (link-code)', err);
      }
    }
    try {
      await trackPurchase({ slug: linkSlug, email: email ?? '', amountMinor: value != null ? Math.round(value * 100) : null, currency, reference });
    } catch (err) {
      console.error('[paypal] ga purchase error (link-code)', err);
    }
    if (!email) {
      await alertUnmatchedPurchase({ email: null, amount: value != null ? Math.round(value * 100) : null, currency, reference, metaKeys: ['paypal', 'link-code', linkSlug, 'no-email'] });
    }
    console.log('[paypal] capture.completed via link-code', { slug: linkSlug, reference, hasEmail: !!email });
    return NextResponse.json({ ok: true, delivered: email ? linkSlug : null });
  }

  const bundle = matchBundle(signal);
  if (bundle) {
    if (email) {
      try {
        await deliverBundle(email, admin, bundle.slug);
      } catch (err) {
        console.error('[paypal] bundle delivery error', err);
      }
    }
    try {
      await trackPurchase({ slug: bundle.slug, email: email ?? '', amountMinor: value != null ? Math.round(value * 100) : null, currency, reference, itemName: `bundle:${bundle.slug}` });
    } catch (err) {
      console.error('[paypal] ga purchase (bundle) error', err);
    }
    if (!email) {
      await alertUnmatchedPurchase({ email: null, amount: value != null ? Math.round(value * 100) : null, currency, reference, metaKeys: ['bundle', bundle.slug, 'no-email'] });
    }
    return NextResponse.json({ ok: true, delivered: email ? `bundle:${bundle.slug}` : null });
  }

  const matched = matchReport(signal);
  console.log('[paypal] capture.completed', { currency, value, reference, hasEmail: !!email, matched: matched?.slug ?? null });
  if (matched && email) {
    try {
      await deliverReport(email, admin, matched.slug);
    } catch (err) {
      console.error('[paypal] delivery error', err);
    }
    try {
      await trackPurchase({ slug: matched.slug, email, amountMinor: value != null ? Math.round(value * 100) : null, currency, reference });
    } catch (err) {
      console.error('[paypal] ga purchase error', err);
    }
    return NextResponse.json({ ok: true, delivered: matched.slug });
  }

  // Paid but we can't safely auto-fulfil (no match, or no email to send to). Never
  // guess — alert the team to fulfil manually and to refine the match tokens. Log
  // the order shape so the first real sale, if it ever lands here, tells us which
  // field carried the report identity (same refine-from-first-sale loop the
  // Paystack payment-page tokens use).
  console.log('[paypal] UNMATCHED capture — payload shape', {
    reference,
    resourceKeys: Object.keys(resource),
    orderKeys: order && typeof order === 'object' ? Object.keys(order as Record<string, unknown>) : null,
    purchaseUnits: (order as { purchase_units?: unknown })?.purchase_units ?? null,
  });
  await alertUnmatchedPurchase({
    email,
    amount: value != null ? Math.round(value * 100) : null,
    currency,
    reference,
    metaKeys: ['paypal', matched ? 'no-email' : 'unmatched', ...Object.keys(resource)],
  });
  return NextResponse.json({ ok: true, delivered: null, note: 'unmatched or no email — team alerted for manual fulfilment' });
}
