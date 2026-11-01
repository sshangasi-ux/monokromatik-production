#!/usr/bin/env node
// Build a LinkedIn carousel PDF (1080x1080 slides) from a report's keyStats +
// Brand Read. Branded to match the report PDFs (dark charcoal + amber, Helvetica).
// LinkedIn "document" posts are its highest organic-reach format.
//
//   node scripts/build-carousel.mjs <report-slug> <out.pdf>
import { readFileSync, writeFileSync } from 'node:fs';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const INK = rgb(0.086, 0.086, 0.098);
const INK2 = rgb(0.13, 0.13, 0.145);
const AMBER = rgb(0.92, 0.64, 0.15);
const PAPER = rgb(0.97, 0.96, 0.94);
const GREY = rgb(0.62, 0.62, 0.66);
const W = 1080, H = 1080, M = 96;

// Reports carry no pull-quote (that's an article field), so give each its punchy
// cover hook + closing question by slug. Falls back to the summary's first sentence.
const HOOK = {
  'the-african-beer-value-map': "Heineken's CEO admits it isn't winning with consumers. On African beer, the bigger question is who keeps the margin.",
  'who-bankrolls-african-sport-the-dependency-map': 'The top SA football league is named after a bookmaker. Betting is now the primary bankroll of South African sport.',
};
const THESIS = {
  'the-african-beer-value-map': 'If you win African beer — who actually keeps the margin, and is there any version where it stays on the continent?',
  'who-bankrolls-african-sport-the-dependency-map': 'Is betting money the bankroll keeping South African sport alive — or the one quietly repricing the whole market around itself?',
};
const firstSentence = (s) => (String(s).split(/(?<=[.?!])\s+/)[0] || s);

// pdf-lib StandardFonts are WinAnsi — sanitize unencodable glyphs.
function SAFE(s) {
  return String(s ?? '')
    .replace(/[‘’‚]/g, "'")
    .replace(/[“”„]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/−/g, '-')
    .replace(/…/g, '...')
    .replace(/→/g, '->')
    .replace(/▶/g, '>')
    .replace(/₦/g, 'N')
    .replace(/[‑]/g, '-')
    .replace(/ /g, ' ')
    .replace(/[^\x20-\x7E]/g, '');
}

function wrap(font, size, text, maxW) {
  const words = SAFE(text).split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    const t = cur ? cur + ' ' + w : w;
    if (font.widthOfTextAtSize(t, size) > maxW && cur) { lines.push(cur); cur = w; }
    else cur = t;
  }
  if (cur) lines.push(cur);
  return lines;
}

async function build(slug, out) {
  const reps = JSON.parse(readFileSync(new URL('../data/reports.json', import.meta.url), 'utf8'));
  const r = reps.find((x) => x.slug === slug);
  if (!r) { console.error('no report', slug); process.exit(1); }

  const doc = await PDFDocument.create();
  const F = await doc.embedFont(StandardFonts.Helvetica);
  const FB = await doc.embedFont(StandardFonts.HelveticaBold);
  const FO = await doc.embedFont(StandardFonts.HelveticaOblique);

  const slides = [];
  const addSlide = (fn) => slides.push(fn);

  const bg = (p, color = INK) => p.drawRectangle({ x: 0, y: 0, width: W, height: H, color });
  const T = (p, s, x, y, size, font, color) => p.drawText(SAFE(s), { x, y, size, font, color });
  const footer = (p, n, total) => {
    T(p, 'MONOKROMATIK', M, 64, 20, FB, PAPER);
    T(p, `${n} / ${total}`, W - M - FB.widthOfTextAtSize(`${n} / ${total}`, 20), 64, 20, F, GREY);
  };

  const stats = (r.keyStats || []).slice(0, 4);
  const total = 2 + stats.length + 1 + 1; // cover + stats + thesis + cta

  // Slide 1 — cover
  addSlide((p, n) => {
    bg(p);
    T(p, (r.series || 'THE VALUE MAP').toUpperCase(), M, H - 180, 26, FB, AMBER);
    let y = H - 300;
    for (const ln of wrap(FB, 62, r.title.split('—')[0].trim(), W - M * 2)) { T(p, ln, M, y, 62, FB, PAPER); y -= 74; }
    y -= 20;
    const hook = HOOK[slug] || firstSentence(r.summary || '');
    for (const ln of wrap(F, 32, hook, W - M * 2).slice(0, 5)) { T(p, ln, M, y, 32, F, GREY); y -= 46; }
    T(p, 'swipe ->', W - M - F.widthOfTextAtSize('swipe ->', 24), 150, 24, FB, AMBER);
    footer(p, n, total);
  });

  // Slide 2 — the frame / standfirst
  addSlide((p, n) => {
    bg(p, INK2);
    p.drawRectangle({ x: M, y: H - 230, width: 64, height: 6, color: AMBER });
    let y = H - 300;
    for (const ln of wrap(F, 38, r.summary, W - M * 2).slice(0, 10)) { T(p, ln, M, y, 38, F, PAPER); y -= 54; }
    footer(p, n, total);
  });

  // Stat slides
  for (const k of stats) {
    addSlide((p, n) => {
      bg(p);
      T(p, SAFE(k.value), M, H - 360, 150, FB, AMBER);
      p.drawRectangle({ x: M, y: H - 400, width: 120, height: 6, color: PAPER });
      let y = H - 470;
      for (const ln of wrap(F, 36, k.label, W - M * 2).slice(0, 8)) { T(p, ln, M, y, 36, F, PAPER); y -= 50; }
      footer(p, n, total);
    });
  }

  // Thesis slide
  addSlide((p, n) => {
    bg(p, INK2);
    T(p, 'THE QUESTION', M, H - 200, 24, FB, AMBER);
    let y = H - 320;
    const q = THESIS[slug] || firstSentence(r.summary || r.title);
    for (const ln of wrap(FB, 48, q, W - M * 2)) { T(p, ln, M, y, 48, FB, PAPER); y -= 62; }
    footer(p, n, total);
  });

  // CTA slide
  addSlide((p, n) => {
    bg(p);
    T(p, 'READ THE FULL VALUE MAP', M, H - 220, 30, FB, AMBER);
    let y = H - 320;
    const lines = [
      `monokromatik.com/reports/${slug}`,
      '',
      '> Watch the 90-sec explainer on YouTube',
      '',
      'MonoKromatik - African & diaspora brand',
      'intelligence: who owns it, who captures',
      'the value, and where the upside leaks.',
    ];
    for (const ln of lines) { if (ln) T(p, ln, M, y, 34, ln.startsWith('monokromatik') ? FB : F, ln.startsWith('monokromatik') ? PAPER : GREY); y -= 50; }
    footer(p, n, total);
  });

  slides.forEach((fn, i) => {
    const p = doc.addPage([W, H]);
    fn(p, i + 1);
  });

  writeFileSync(out, await doc.save());
  console.log(`wrote ${out} (${slides.length} slides)`);
}

const [slug, out] = process.argv.slice(2);
if (!slug || !out) { console.error('usage: build-carousel.mjs <slug> <out.pdf>'); process.exit(1); }
build(slug, out);
