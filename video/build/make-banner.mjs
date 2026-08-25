#!/usr/bin/env node
// Render a clean, on-brand MonoKromatik YouTube banner (2560x1440) with sharp.
import sharp from 'sharp';
const W = 2560, H = 1440, cx = W / 2;
const AMBER = '#D9791F', INK = '#0b0b0d', INK2 = '#141417', PAPER = '#F2EEE6', MUTE = '#9a958c';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="g" cx="50%" cy="46%" r="62%">
      <stop offset="0%" stop-color="${INK2}"/>
      <stop offset="70%" stop-color="${INK}"/>
      <stop offset="100%" stop-color="#000000"/>
    </radialGradient>
    <pattern id="dots" width="14" height="14" patternUnits="userSpaceOnUse">
      <circle cx="1.4" cy="1.4" r="1.4" fill="#ffffff" fill-opacity="0.025"/>
    </pattern>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <rect width="${W}" height="${H}" fill="url(#dots)"/>
  <!-- faint amber horizon glow lower third -->
  <rect x="0" y="1040" width="${W}" height="3" fill="${AMBER}" fill-opacity="0.5"/>
  <rect x="0" y="1043" width="${W}" height="120" fill="${AMBER}" fill-opacity="0.05"/>

  <!-- SAFE AREA content (centered ~ y 560..900) -->
  <!-- wordmark: amber square + MONOKROMATIK -->
  <g transform="translate(${cx},628)">
    <rect x="-372" y="-34" width="46" height="46" rx="4" fill="${AMBER}"/>
    <text x="-300" y="6" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="72"
      font-weight="800" letter-spacing="6" fill="${PAPER}" text-anchor="start">MONOKROMATIK</text>
  </g>

  <!-- amber hairline -->
  <rect x="${cx - 300}" y="672" width="600" height="2" fill="${AMBER}" fill-opacity="0.8"/>

  <!-- tagline -->
  <text x="${cx}" y="742" font-family="Georgia, 'Times New Roman', serif" font-style="italic"
    font-size="46" fill="${PAPER}" text-anchor="middle" letter-spacing="1">African &amp; Diaspora Brand Intelligence</text>

  <!-- sub -->
  <text x="${cx}" y="802" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="30"
    fill="${MUTE}" text-anchor="middle" letter-spacing="3">WHO OWNS THE CULTURE.  WHO CAPTURES THE VALUE.</text>

  <!-- cta -->
  <text x="${cx}" y="862" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="28"
    font-weight="700" fill="${AMBER}" text-anchor="middle" letter-spacing="2">NEW EXPLAINERS WEEKLY  ·  MONOKROMATIK.COM</text>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile('build/banner.png');
console.log('wrote build/banner.png');
