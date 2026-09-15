import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';
import type { createAdminClient } from './supabase/admin';

// One-off paid-report fulfilment. On a Paystack product purchase the buyer is
// emailed the report as a PDF ATTACHMENT (the file, never a shareable link): the
// bytes are read from a PRIVATE Supabase Storage bucket (service-role only) and
// sent via Resend. Best-effort — records the outcome and never throws, so the
// webhook never 500s and manual fulfilment (Paystack Orders) stays a fallback.
type Admin = NonNullable<ReturnType<typeof createAdminClient>>;

export interface DeliveryResult {
  status: 'sent' | 'skipped' | 'failed';
  detail: string;
}

interface ReportAsset {
  slug: string;
  /** Lowercase tokens; any hit in the stringified charge payload selects this
   *  report. Includes the product name/slug words and the Paystack product id —
   *  never a price (multiple reports share R220). */
  match: string[];
  /** Object path in the private `reports` bucket. */
  object: string;
  /** Attachment filename the buyer receives. */
  filename: string;
  title: string;
  subject: string;
  /** One-line description used in the email body. */
  blurb: string;
}

const REPORTS: ReportAsset[] = [
  {
    slug: 'who-captures-amapiano-value-capture-report',
    match: ['amapiano', 'who-captures-amapiano', '2723931'],
    object: process.env.AMAPIANO_REPORT_OBJECT || 'who-captures-amapiano-value-capture-report.pdf',
    filename: 'MonoKromatik-Who-Captures-Amapiano-Value-Capture-Report.pdf',
    title: 'Who Captures Amapiano? — The Value-Capture Report',
    subject: 'Your report — Who Captures Amapiano? (The Value-Capture Report)',
    blurb: "It maps, layer by layer, where amapiano's economy is actually captured — with eight sourced exhibits and the playbook for keeping more of a nine-figure economy at home.",
  },
  {
    slug: 'brand-study-the-springbok-world-champion-under-owned',
    match: ['springbok', 'brand-study', '2724901'],
    object: 'springbok-brand-study.pdf',
    filename: 'MonoKromatik-Springbok-Brand-Study.pdf',
    title: 'The Springbok — World Champion, Under-Owned (Brand Study)',
    subject: 'Your report — The Springbok: World Champion, Under-Owned',
    blurb: "It reads the best team in world rugby as one of its most under-monetised brands — eight sourced exhibits, the value gap, the private-equity fork, and the strategy to capture more of the brand's value while keeping it South African.",
  },
];

/**
 * Personalise each delivered copy to the buyer: a faint diagonal watermark on
 * every page ("LICENSED TO <email>") plus a footer line. Makes the report's
 * "licensed to the named purchaser" real and traceable, so a leaked copy points
 * back to who leaked it. Best-effort — on any failure the original bytes are
 * returned so delivery is never blocked.
 */
async function stampForBuyer(pdf: Buffer, email: string): Promise<Buffer> {
  try {
    const doc = await PDFDocument.load(pdf);
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const date = new Date().toISOString().slice(0, 10);
    const mark = `LICENSED TO ${email.toUpperCase()}`;
    const footer = `Licensed to ${email}  ·  ${date}  ·  This copy is watermarked. Not for redistribution.`;
    for (const page of doc.getPages()) {
      const { width, height } = page.getSize();
      // faint diagonal watermark
      page.drawText(mark, {
        x: width * 0.1, y: height * 0.32, size: 24, font,
        color: rgb(0.5, 0.5, 0.5), opacity: 0.06, rotate: degrees(50),
      });
      // subtle traceable footer line, bottom-left
      page.drawText(footer, { x: 34, y: 9, size: 5.5, font, color: rgb(0.55, 0.55, 0.55), opacity: 0.85 });
    }
    return Buffer.from(await doc.save());
  } catch (e) {
    console.error('[delivery] watermark failed, sending unstamped:', (e as Error)?.message);
    return pdf;
  }
}

/** Find the paid report a charge payload is buying, or null. */
export function matchReport(payloadBlob: string): { slug: string } | null {
  const b = payloadBlob.toLowerCase();
  return REPORTS.find((r) => r.match.some((t) => b.includes(t))) ?? null;
}

export async function deliverReport(email: string, admin: Admin, slug: string): Promise<DeliveryResult> {
  const report = REPORTS.find((r) => r.slug === slug);
  const record = async (r: DeliveryResult): Promise<DeliveryResult> => {
    try {
      await admin.from('report_deliveries').insert({ email, report: slug, status: r.status, detail: r.detail });
    } catch {
      /* observability only — never block delivery */
    }
    return r;
  };
  if (!report) return record({ status: 'failed', detail: `unknown report ${slug}` });

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.REPORT_DELIVERY_FROM || 'MonoKromatik <editor@send.monokromatik.com>';
  const replyTo = process.env.REPORT_DELIVERY_REPLY_TO || 'editor@monokromatik.com';
  const bucket = process.env.REPORT_ASSET_BUCKET || 'reports';
  if (!apiKey) {
    console.warn('[delivery] not configured (RESEND_API_KEY)');
    return record({ status: 'skipped', detail: 'RESEND_API_KEY not set' });
  }
  const { data: file, error: dlErr } = await admin.storage.from(bucket).download(report.object);
  if (dlErr || !file) {
    console.error(`[delivery] PDF not in storage (${bucket}/${report.object}): ${dlErr?.message ?? 'missing'}`);
    return record({ status: 'failed', detail: `pdf missing ${report.object}: ${dlErr?.message ?? 'not found'}` });
  }
  const stamped = await stampForBuyer(Buffer.from(await file.arrayBuffer()), email);
  const base64 = stamped.toString('base64');
  const html =
    '<p>Thank you for your purchase.</p>' +
    `<p>Your copy of <strong>${report.title}</strong> is attached as a PDF.</p>` +
    `<p>${report.blurb}</p>` +
    '<p>Any issues, just reply to this email.</p>' +
    '<p>— MonoKromatik · African &amp; diaspora brand intelligence</p>';
  const text = `Thank you for your purchase. Your copy of "${report.title}" is attached as a PDF. Any issues, reply to this email. — MonoKromatik`;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [email],
      reply_to: replyTo,
      subject: report.subject,
      html,
      text,
      attachments: [{ filename: report.filename, content: base64 }],
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    console.error(`[delivery] Resend failed (${res.status}): ${body}`);
    return record({ status: 'failed', detail: `resend ${res.status}: ${body.slice(0, 300)}` });
  }
  console.log(`[delivery] ${slug} delivered to ${email}`);
  return record({ status: 'sent', detail: `to ${email}` });
}
