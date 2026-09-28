// Server-side GA4 Measurement Protocol.
//
// Fires a `purchase` event when a Paystack charge succeeds, closing the loop
// from the client-side `report_buy_click` (see lib/analytics.ts + BuyButton) to
// a real paid conversion + revenue in GA4. Best-effort by design: it no-ops if
// the MP API secret isn't configured and never throws into the caller — the
// Paystack webhook must always return 200.
//
// Env:
//   GA4_MP_API_SECRET   — GA4 Admin → Data Streams → Web → Measurement Protocol
//                         API secrets. Required to actually send.
//   GA4_MEASUREMENT_ID  — optional; defaults to the site's stream id.
//
// Note on attribution: the server has no browser GA client_id, so we derive a
// deterministic pseudo client_id from the buyer's email. That records the
// purchase + revenue reliably, but does NOT stitch to the original web session
// (Paystack "buy" links carry no client_id). Full stitching would need the
// Initialize-Transaction API with the GA client_id threaded through metadata.

const DEFAULT_MEASUREMENT_ID = 'G-9F5R5FM8NS';

// Deterministic, GA-shaped client_id per email so repeat buyers map to one user.
function clientIdFromEmail(email: string): string {
  let h = 5381;
  for (let i = 0; i < email.length; i++) h = ((h << 5) + h + email.charCodeAt(i)) >>> 0;
  return `${h}.1577836800`; // second part = a fixed pseudo first-visit timestamp
}

export async function trackPurchase(args: {
  slug: string;
  email: string;
  amountMinor?: number | null; // Paystack `amount`, in the currency's minor unit (e.g. cents)
  currency?: string | null;
  reference?: string | null;
  itemName?: string;
}): Promise<{ ok: boolean; skipped?: string; status?: number }> {
  try {
    const apiSecret = process.env.GA4_MP_API_SECRET;
    const measurementId = process.env.GA4_MEASUREMENT_ID || DEFAULT_MEASUREMENT_ID;
    if (!apiSecret) return { ok: false, skipped: 'GA4_MP_API_SECRET not set' };
    if (!args.email) return { ok: false, skipped: 'no email' };

    const value = typeof args.amountMinor === 'number' && isFinite(args.amountMinor)
      ? Math.round(args.amountMinor) / 100
      : undefined;
    const currency = (args.currency || 'ZAR').toUpperCase();

    const body = {
      client_id: clientIdFromEmail(args.email),
      events: [
        {
          name: 'purchase',
          params: {
            transaction_id: args.reference || `mk-${args.slug}-${Date.now()}`,
            currency, // GA4 needs currency set alongside value for revenue to register
            ...(value != null ? { value } : {}),
            items: [
              {
                item_id: args.slug,
                item_name: args.itemName || args.slug,
                quantity: 1,
                ...(value != null ? { price: value } : {}),
              },
            ],
          },
        },
      ],
    };

    const res = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(measurementId)}&api_secret=${encodeURIComponent(apiSecret)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
    );
    return { ok: res.ok, status: res.status };
  } catch (err) {
    console.error('[ga-mp] purchase send failed', err);
    return { ok: false, skipped: 'exception' };
  }
}
