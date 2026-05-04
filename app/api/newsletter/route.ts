import { NextRequest, NextResponse } from 'next/server';

/**
 * MonoKromatik Newsletter Subscription
 *
 * Wires the site's signup form to Kit (formerly ConvertKit).
 *
 * Supports both Kit v4 (Bearer token, `api.kit.com/v4`) and the
 * legacy v3 endpoint (`api.convertkit.com/v3`) so we can ship without
 * caring which key the user has.
 *
 * Required env vars (set in Vercel):
 *   KIT_API_KEY      — the v4 API key from Account Settings → Developer
 *   KIT_FORM_ID      — the numeric form ID
 *
 * Optional:
 *   KIT_API_SECRET   — only needed if we ever want to read subscribers
 *
 * Backwards-compat env vars (still honored for transition):
 *   CONVERTKIT_API_KEY, CONVERTKIT_FORM_ID
 */

interface SubscribeBody {
  email?: string;
  firstName?: string;
  source?: string; // e.g. "footer", "homepage", "article-bottom"
}

const VALID_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  let body: SubscribeBody = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }

  const email = (body.email ?? '').trim().toLowerCase();
  const firstName = (body.firstName ?? '').trim() || undefined;
  const source = (body.source ?? 'unknown').trim();

  if (!email || !VALID_EMAIL.test(email)) {
    return NextResponse.json(
      { error: 'Please enter a valid email address.' },
      { status: 400 }
    );
  }

  const apiKey = process.env.KIT_API_KEY ?? process.env.CONVERTKIT_API_KEY;
  const formId = process.env.KIT_FORM_ID ?? process.env.CONVERTKIT_FORM_ID;

  if (!apiKey || !formId) {
    // Dev-mode fallback: log the email so we can capture them while
    // the integration is being set up. This keeps the UX promise
    // ("you're subscribed!") while not actually losing the signup.
    console.warn('[newsletter] Kit not configured. Email captured in logs:', {
      email,
      firstName,
      source,
      timestamp: new Date().toISOString(),
    });
    return NextResponse.json({
      success: true,
      message: "You're on the list. We'll be in touch soon.",
      mode: 'logged',
    });
  }

  // Detect API version from the key shape:
  //   v4 keys start with `kit_`. v3 keys are 32-char hex strings.
  const isV4 = apiKey.startsWith('kit_');

  try {
    const result = isV4
      ? await subscribeV4({ apiKey, formId, email, firstName, source })
      : await subscribeV3({ apiKey, formId, email, firstName });

    if (!result.ok) {
      console.error('[newsletter] Kit API error:', result.error);
      return NextResponse.json(
        { error: result.userMessage ?? 'Could not subscribe right now. Please try again in a moment.' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.alreadySubscribed
        ? "You're already on the list — welcome back."
        : "Welcome to The Pulse. Check your email to confirm.",
    });
  } catch (err) {
    console.error('[newsletter] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Something went wrong on our end. Please try again.' },
      { status: 500 }
    );
  }
}

// ---------- Kit v4 (api.kit.com) ----------

async function subscribeV4(args: {
  apiKey: string;
  formId: string;
  email: string;
  firstName?: string;
  source: string;
}): Promise<{ ok: boolean; alreadySubscribed?: boolean; error?: unknown; userMessage?: string }> {
  // Kit v4 requires a TWO-STEP flow for form subscriptions:
  //   1. POST /v4/subscribers           — create or upsert the subscriber
  //   2. POST /v4/forms/:id/subscribers/:subscriber_id  — attach to form
  //
  // The combined endpoint POST /v4/forms/:id/subscribers (with email body)
  // returns 404 against the live Kit API at the time of writing, despite
  // appearing in older docs. The two-step flow is the production pattern.

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Kit-Api-Key': args.apiKey,
  };

  // Step 1: create / upsert the subscriber.
  const createPayload: Record<string, unknown> = { email_address: args.email };
  if (args.firstName) createPayload.first_name = args.firstName;

  const createRes = await fetch('https://api.kit.com/v4/subscribers', {
    method: 'POST',
    headers,
    body: JSON.stringify(createPayload),
  });

  // Kit v4 quirks: 200/201 on create, 422 on existing subscriber.
  // For existing subs, the response body still contains the subscriber object
  // (Kit upserts), but the legacy 422 path also exists for some accounts.
  let subscriberId: number | undefined;
  let alreadyExisted = false;

  if (createRes.ok) {
    const data = await createRes.json().catch(() => null) as { subscriber?: { id?: number; state?: string; created_at?: string; added_at?: string } } | null;
    subscriberId = data?.subscriber?.id;
    // If the subscriber's `created_at` was before this request started, treat as already-existing.
    // Simpler heuristic: if `state` is set and is 'active', accept it; we'll still attach.
  } else if (createRes.status === 422) {
    // Already subscribed — fetch the existing subscriber by email so we can still attach to the form.
    alreadyExisted = true;
    const lookup = await fetch(`https://api.kit.com/v4/subscribers?email_address=${encodeURIComponent(args.email)}`, {
      headers,
    });
    if (lookup.ok) {
      const data = await lookup.json().catch(() => null) as { subscribers?: Array<{ id?: number }> } | null;
      subscriberId = data?.subscribers?.[0]?.id;
    }
  } else {
    const text = await createRes.text().catch(() => '');
    return {
      ok: false,
      error: { stage: 'create', status: createRes.status, body: text.slice(0, 500) },
      userMessage:
        createRes.status === 401
          ? 'Newsletter is misconfigured. Please email us directly while we fix this.'
          : undefined,
    };
  }

  if (!subscriberId) {
    return {
      ok: false,
      error: { stage: 'create', message: 'No subscriber id returned from Kit' },
    };
  }

  // Step 2: attach this subscriber to the form. This is what triggers the
  // confirmation email Kit sends when the form is set to double-opt-in.
  const attachUrl = `https://api.kit.com/v4/forms/${encodeURIComponent(args.formId)}/subscribers/${subscriberId}`;
  const attachRes = await fetch(attachUrl, {
    method: 'POST',
    headers,
  });

  if (!attachRes.ok && attachRes.status !== 422) {
    // 422 here usually means "already attached" — still treat as success.
    const text = await attachRes.text().catch(() => '');
    return {
      ok: false,
      error: { stage: 'attach', status: attachRes.status, body: text.slice(0, 500) },
    };
  }

  return { ok: true, alreadySubscribed: alreadyExisted };
}

// ---------- Kit v3 (api.convertkit.com) — legacy ----------

async function subscribeV3(args: {
  apiKey: string;
  formId: string;
  email: string;
  firstName?: string;
}): Promise<{ ok: boolean; alreadySubscribed?: boolean; error?: unknown; userMessage?: string }> {
  const url = `https://api.convertkit.com/v3/forms/${encodeURIComponent(args.formId)}/subscribe`;

  const payload: Record<string, unknown> = {
    api_key: args.apiKey,
    email: args.email,
  };
  if (args.firstName) payload.first_name = args.firstName;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    return {
      ok: false,
      error: { status: res.status, body: text.slice(0, 500) },
    };
  }
  // v3 success returns 200 with the subscription. There's no separate
  // "already subscribed" code — Kit dedupes silently, so we treat all
  // success as fresh.
  return { ok: true };
}
