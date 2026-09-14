import type { createAdminClient } from './supabase/admin';

// One-off report fulfilment. The PDF is emailed as an ATTACHMENT (the file, never
// a shareable link): the bytes are read from a PRIVATE Supabase Storage bucket
// (service-role only — no public URL, nothing shareable) and delivered via Resend.
// Bucket/object/sender are overridable via env. Best-effort: any failure records
// + returns its status and never throws, so the caller (webhook) never 500s and
// falls back to manual fulfilment.
type Admin = NonNullable<ReturnType<typeof createAdminClient>>;

export interface DeliveryResult {
  status: 'sent' | 'skipped' | 'failed';
  detail: string;
}

export async function deliverAmapianoReport(email: string, admin: Admin): Promise<DeliveryResult> {
  const report = 'who-captures-amapiano-value-capture-report';
  const record = async (r: DeliveryResult): Promise<DeliveryResult> => {
    try {
      await admin.from('report_deliveries').insert({ email, report, status: r.status, detail: r.detail });
    } catch {
      /* observability only — never block delivery */
    }
    return r;
  };

  const apiKey = process.env.RESEND_API_KEY;
  // Send from the Resend-verified subdomain (send.monokromatik.com) for
  // deliverability + a branded sender; replies route to the real editor inbox.
  const from = process.env.REPORT_DELIVERY_FROM || 'MonoKromatik <editor@send.monokromatik.com>';
  const replyTo = process.env.REPORT_DELIVERY_REPLY_TO || 'editor@monokromatik.com';
  const bucket = process.env.REPORT_ASSET_BUCKET || 'reports';
  const objectPath = process.env.AMAPIANO_REPORT_OBJECT || 'who-captures-amapiano-value-capture-report.pdf';

  if (!apiKey) {
    console.warn('[delivery] not configured (RESEND_API_KEY)');
    return record({ status: 'skipped', detail: 'RESEND_API_KEY not set' });
  }
  const { data: file, error: dlErr } = await admin.storage.from(bucket).download(objectPath);
  if (dlErr || !file) {
    console.error(`[delivery] PDF not in storage (${bucket}/${objectPath}): ${dlErr?.message ?? 'missing'}`);
    return record({ status: 'failed', detail: `pdf missing: ${dlErr?.message ?? 'not found'}` });
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
      reply_to: replyTo,
      subject: 'Your report — Who Captures Amapiano? (The Value-Capture Report)',
      html,
      text,
      attachments: [{ filename: 'MonoKromatik-Who-Captures-Amapiano-Value-Capture-Report.pdf', content: base64 }],
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    console.error(`[delivery] Resend failed (${res.status}): ${body}`);
    return record({ status: 'failed', detail: `resend ${res.status}: ${body.slice(0, 300)}` });
  }
  console.log(`[delivery] amapiano report delivered to ${email}`);
  return record({ status: 'sent', detail: `to ${email}` });
}
