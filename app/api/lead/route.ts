import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '../../../lib/supabase/admin';
import { CONTACT_EMAIL, SERVICES } from '../../../lib/commerce';

/**
 * MonoKromatik lead capture — the advisory / licensing / Culture-DD funnel.
 *
 * Every "Start a brief" / "Work with us" / checker CTA lands here. Previously the
 * form used a `mailto:` that captured nothing server-side and silently failed on
 * mobile/webmail — the single biggest conversion leak. This route:
 *   1. records the enquiry to Supabase (public.leads, service-role, RLS-on), and
 *   2. emails the team via Resend so it lands in the inbox immediately.
 * It is best-effort: if at least one of the two succeeds, the visitor gets a
 * success state. Only if BOTH fail do we return an error so the form can offer
 * the mailto fallback — so a high-intent lead is never lost.
 *
 * Env (already set in Vercel for report delivery):
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY  — the DB insert
 *   RESEND_API_KEY, REPORT_DELIVERY_FROM (optional)      — the team email
 *   LEAD_NOTIFY_TO (optional, defaults to CONTACT_EMAIL) — where notifications go
 */

interface LeadBody {
  name?: string;
  company?: string;
  email?: string;
  interest?: string;
  message?: string;
  source?: string;
}

const VALID_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clip = (s: string, n = 2000) => s.slice(0, n);

export async function POST(request: NextRequest) {
  let body: LeadBody = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request body' }, { status: 400 });
  }

  const email = (body.email ?? '').trim().toLowerCase();
  const name = clip((body.name ?? '').trim(), 200) || undefined;
  const company = clip((body.company ?? '').trim(), 200) || undefined;
  const interestId = clip((body.interest ?? '').trim(), 120) || undefined;
  const message = clip((body.message ?? '').trim(), 4000) || undefined;
  const source = clip((body.source ?? 'work-with-us').trim(), 120);

  if (!email || !VALID_EMAIL.test(email)) {
    return NextResponse.json({ ok: false, error: 'Please enter a valid email address.' }, { status: 400 });
  }

  const serviceTitle = SERVICES.find((s) => s.id === interestId)?.title ?? interestId ?? 'General enquiry';
  const referer = request.headers.get('referer') ?? undefined;
  const userAgent = request.headers.get('user-agent') ?? undefined;

  let dbOk = false;
  let emailOk = false;

  // 1) Record to Supabase (service-role bypasses RLS; RLS-on blocks the browser).
  try {
    const admin = createAdminClient();
    if (admin) {
      const { error } = await admin.from('leads').insert({
        name, company, email, interest: interestId, message, source,
        referer: referer ? clip(referer, 500) : undefined,
        user_agent: userAgent ? clip(userAgent, 500) : undefined,
      });
      dbOk = !error;
      if (error) console.error('[lead] supabase insert failed:', error.message);
    } else {
      console.warn('[lead] supabase admin not configured (SUPABASE_SERVICE_ROLE_KEY)');
    }
  } catch (err) {
    console.error('[lead] supabase insert threw:', err);
  }

  // 2) Notify the team by email (best-effort).
  try {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.REPORT_DELIVERY_FROM || 'MonoKromatik <editor@send.monokromatik.com>';
    const to = process.env.LEAD_NOTIFY_TO || CONTACT_EMAIL;
    if (apiKey) {
      const lines = [
        `Service:  ${serviceTitle}`,
        `Name:     ${name ?? '—'}`,
        `Company:  ${company ?? '—'}`,
        `Email:    ${email}`,
        `Source:   ${source}`,
        referer ? `Page:     ${referer}` : '',
        '',
        message ?? '(no message)',
      ].filter(Boolean).join('\n');
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from,
          to,
          reply_to: email,
          subject: `New enquiry — ${serviceTitle}${company ? ` (${company})` : ''}`,
          text: lines,
        }),
      });
      emailOk = res.ok;
      if (!res.ok) console.error('[lead] resend failed:', res.status, (await res.text()).slice(0, 300));
    } else {
      console.warn('[lead] resend not configured (RESEND_API_KEY); lead captured to db only');
    }
  } catch (err) {
    console.error('[lead] resend threw:', err);
  }

  if (dbOk || emailOk) {
    return NextResponse.json({ ok: true });
  }
  // Both paths failed — tell the client so it can show the mailto fallback.
  return NextResponse.json(
    { ok: false, error: 'We could not submit that automatically. Please email us directly.' },
    { status: 502 },
  );
}
