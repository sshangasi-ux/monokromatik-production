import { NextResponse } from 'next/server';
import { createAdminClient } from '../../../lib/supabase/admin';
import { deliverAmapianoReport } from '../../../lib/report-delivery';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// TEMPORARY diagnostic. Runs the exact delivery path (private Storage → Resend)
// to a FIXED recipient so we can see where the auto-delivery breaks without
// burning test purchases. Token-gated; only ever emails the owner. REMOVE after
// verifying.
const TOKEN = 'mk-diag-7f3a9c2e1b';
const TO = 'sshangasi@gmail.com';

export async function GET(req: Request) {
  if (new URL(req.url).searchParams.get('token') !== TOKEN) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  const env = {
    hasResendKey: !!process.env.RESEND_API_KEY,
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    hasPaystackSecret: !!process.env.PAYSTACK_SECRET_KEY,
    from: process.env.REPORT_DELIVERY_FROM || 'MonoKromatik <onboarding@resend.dev>',
    bucket: process.env.REPORT_ASSET_BUCKET || 'reports',
    object: process.env.AMAPIANO_REPORT_OBJECT || 'who-captures-amapiano-value-capture-report.pdf',
  };
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: 'no admin client (supabase env missing)', env }, { status: 200 });
  const result = await deliverAmapianoReport(TO, admin);
  return NextResponse.json({ result, env }, { status: 200 });
}
