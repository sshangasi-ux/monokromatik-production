// On-demand report → PDF renderer. Builds a branded, decision-grade PDF from a
// report's own structured content (data/reports.json) at delivery time, so
// data-driven reports need NO pre-made file in storage — the webhook generates
// the bytes, then stampForBuyer watermarks them (see lib/report-delivery.ts).
//
// Pure JS (pdf-lib StandardFonts, no font files / native deps) so it runs in the
// Vercel Node serverless runtime. Designed/bespoke reports keep using the
// `reports` bucket; this covers reports we're happy to auto-typeset from data.

import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import { getReportBySlug, type Report, type Exhibit } from './reports';

// Helvetica/WinAnsi can't encode some glyphs — map them to safe equivalents.
function SAFE(s: unknown): string {
  return String(s)
    .replace(/₦/g, 'NGN ') // ₦
    .replace(/[←-⇿]/g, '->') // arrows
    .replace(/[■-◿]/g, '') // geometric shapes (balls handled as n/4)
    .replace(/−/g, '-'); // minus
}

const AMBER = rgb(0.85, 0.6, 0.12);
const INK = rgb(0.09, 0.09, 0.1);
const GREY = rgb(0.42, 0.42, 0.45);
const RULE = rgb(0.8, 0.8, 0.82);
const PAPER = rgb(0.985, 0.98, 0.965);

const PAGE_W = 595.28, PAGE_H = 841.89;
const ML = 58, MR = 58, MT = 66, MB = 58;
const CW = PAGE_W - ML - MR;

/** Render a report (by slug) to branded PDF bytes. Throws if the slug is unknown
 *  or the report has no body — callers treat a throw as "fall back to manual". */
export async function renderReportPdf(slug: string): Promise<Buffer> {
  const r = getReportBySlug(slug);
  if (!r) throw new Error(`renderReportPdf: unknown report ${slug}`);
  if (!r.sections || r.sections.length === 0) throw new Error(`renderReportPdf: ${slug} has no sections`);

  const doc = await PDFDocument.create();
  const F = await doc.embedFont(StandardFonts.Helvetica);
  const FB = await doc.embedFont(StandardFonts.HelveticaBold);
  const FI = await doc.embedFont(StandardFonts.HelveticaOblique);

  let page!: PDFPage; // assigned by newPage() before any draw call
  let y = 0;
  let pageNo = 0;

  const W = (t: string, font: PDFFont, size: number) => font.widthOfTextAtSize(SAFE(t), size);
  const dt = (t: string, x: number, yy: number, size: number, font: PDFFont, color = INK) =>
    page.drawText(SAFE(t), { x, y: yy, size, font, color });

  const newPage = () => {
    page = doc.addPage([PAGE_W, PAGE_H]);
    page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: PAPER });
    pageNo += 1;
    dt('Licensed to the named purchaser · not for redistribution', ML, 30, 6.5, F, GREY);
    dt('MONOKROMATIK', PAGE_W - MR - W('MONOKROMATIK', FB, 6.5), 30, 6.5, FB, GREY);
    dt(String(pageNo), PAGE_W / 2 - 4, 30, 7, F, GREY);
    y = PAGE_H - MT;
  };
  const wrap = (text: string, font: PDFFont, size: number, maxW: number): string[] => {
    const words = SAFE(text).split(/\s+/);
    const lines: string[] = [];
    let line = '';
    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      if (font.widthOfTextAtSize(test, size) > maxW && line) { lines.push(line); line = w; }
      else line = test;
    }
    if (line) lines.push(line);
    return lines;
  };
  const need = (h: number) => { if (y - h < MB + 16) newPage(); };
  const para = (
    text: string,
    opts: { font?: PDFFont; size?: number; lh?: number; color?: ReturnType<typeof rgb>; gap?: number; indent?: number; x?: number; maxW?: number } = {},
  ) => {
    const { font = F, size = 10.5, lh = 15, color = INK, gap = 7, indent = 0, x = ML, maxW = CW } = opts;
    for (const ln of wrap(text, font, size, maxW - indent)) { need(lh); dt(ln, x + indent, y - size, size, font, color); y -= lh; }
    y -= gap;
  };
  const heading = (text: string) => {
    need(34); y -= 6;
    dt(text.toUpperCase(), ML, y - 11, 11, FB, INK);
    y -= 16; page.drawRectangle({ x: ML, y, width: 26, height: 2.2, color: AMBER }); y -= 12;
  };
  const rule = (w = CW, color = RULE) => { need(10); page.drawRectangle({ x: ML, y: y - 2, width: w, height: 0.8, color }); y -= 10; };

  // ── Cover ──
  newPage();
  dt('MONO', ML, y - 13, 13, FB, INK);
  dt('KROMATIK', ML + W('MONO', FB, 13), y - 13, 13, FB, AMBER);
  y -= 30;
  dt(`${r.series.toUpperCase()} · PREMIUM`, ML, y - 8, 8, FB, AMBER);
  y -= 30;
  for (const ln of wrap(r.title, FB, 26, CW)) { need(32); dt(ln, ML, y - 24, 26, FB, INK); y -= 31; }
  y -= 8; page.drawRectangle({ x: ML, y, width: 44, height: 3, color: AMBER }); y -= 20;
  for (const ln of wrap(r.summary, FI, 11.5, CW)) { need(17); dt(ln, ML, y - 11, 11.5, FI, GREY); y -= 17; }
  y -= 10;
  para(`Written & signed by Sibu Shangase · ${(r.publishedAt || '').slice(0, 10)}`, { font: FB, size: 9, color: INK, gap: 6 });

  // ── Key figures ──
  if (r.keyStats?.length) {
    heading('Key figures');
    for (const k of r.keyStats) {
      need(18);
      dt(k.value, ML, y - 11, 12, FB, AMBER);
      const vx = ML + 100;
      wrap(k.label, F, 9.5, CW - 104).forEach((ln, i) => { if (i > 0) need(12); dt(ln, vx, y - 10, 9.5, F, INK); y -= 12; });
      y -= 4;
    }
    y -= 4;
  }

  const renderExhibit = (ex: Exhibit) => {
    heading(`Exhibit — ${ex.title}`);
    if (ex.type === 'matrix' && ex.cols && ex.rows) {
      const labelW = 150;
      const colW = (CW - labelW) / ex.cols.length;
      need(28);
      ex.cols.forEach((c, i) => {
        const cx = ML + labelW + i * colW;
        wrap(c, FB, 7, colW - 6).forEach((ln, j) => dt(ln, cx, y - 8 - j * 8, 7, FB, GREY));
      });
      y -= 24; rule();
      for (const row of ex.rows) {
        need(18);
        dt(row.label, ML, y - 10, 8.5, FB, INK);
        if (row.tag) dt(`(${row.tag})`, ML, y - 20, 6.5, FI, GREY);
        row.cells.forEach((n, i) => dt(`${n}/4`, ML + labelW + i * colW, y - 11, 9, FB, AMBER));
        y -= row.tag ? 24 : 16; rule();
      }
    } else if (ex.data) {
      for (const d of ex.data) {
        need(14);
        dt(d.label + (d.tag ? `  (${d.tag})` : ''), ML, y - 10, 9, F, INK);
        const disp = d.display || String(d.value);
        dt(disp, PAGE_W - MR - W(disp, FB, 9.5), y - 10, 9.5, FB, AMBER);
        y -= 14; rule();
      }
    }
    if (ex.note) para(ex.note, { font: FI, size: 7.5, color: GREY, gap: 8 });
  };

  if (r.exhibit) renderExhibit(r.exhibit);
  for (const e of r.exhibits || []) renderExhibit(e);

  // ── Sections ──
  for (const s of r.sections) { heading(s.heading); for (const p of s.paragraphs) para(p); }

  // ── Bear case ──
  if (r.counterCase && r.counterCase.points.length > 0) {
    heading(r.counterCase.heading || 'THE BEAR CASE');
    if (r.counterCase.intro) para(r.counterCase.intro, { font: FI, color: GREY });
    for (const p of r.counterCase.points) { need(16); dt('-', ML, y - 10, 10.5, FB, AMBER); para(p, { indent: 16 }); }
  }

  // ── Colophon ──
  need(40); y -= 6; rule();
  para(
    '© MonoKromatik — African & diaspora brand intelligence. This copy is licensed to the named purchaser and watermarked on delivery. Not for redistribution.',
    { font: FI, size: 8, color: GREY },
  );

  return Buffer.from(await doc.save());
}

/** Safe wrapper — returns null instead of throwing, for best-effort delivery. */
export async function tryRenderReportPdf(slug: string): Promise<Buffer | null> {
  try {
    return await renderReportPdf(slug);
  } catch (e) {
    console.error('[render-report-pdf] failed:', (e as Error)?.message);
    return null;
  }
}
