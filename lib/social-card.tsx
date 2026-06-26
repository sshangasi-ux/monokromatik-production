import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * MonoKromatik Instagram card — 1080 × 1350 portrait (IG feed's tallest, most
 * real-estate-efficient ratio). Sibling to lib/og-card.tsx (1200×630 landscape),
 * but built for the feed: a magazine-cover headline, a standout kicker line, and a
 * "link in bio" footer (IG captions can't carry clickable links). Fonts are read
 * from public/fonts on the Node runtime — no network calls.
 */

const COLORS = {
  black: '#0a0a0a',
  amber: '#cc6f3a',
  white: '#fafafa',
  muted: '#9a958c',
};

const FONT_DIR = join(process.cwd(), 'public', 'fonts');
function loadFont(filename: string): ArrayBuffer | null {
  try {
    const buf = readFileSync(join(FONT_DIR, filename));
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  } catch {
    return null;
  }
}
const FONT_DM_SERIF = loadFont('DMSerifDisplay-Regular.ttf');
const FONT_GROTESK_BOLD = loadFont('SpaceGrotesk-Bold.ttf');
const FONT_GROTESK_MEDIUM = loadFont('SpaceGrotesk-Medium.ttf');

export interface SocialCardOptions {
  title: string;
  category?: string;
  kicker?: string; // a standout line — pull-quote, the "why", or a source credit
  breaking?: boolean;
}

export async function renderSocialCard(opts: SocialCardOptions): Promise<ImageResponse> {
  const { title, category, kicker, breaking } = opts;

  const fonts: Array<{ name: string; data: ArrayBuffer; weight: 400 | 500 | 700; style: 'normal' }> = [];
  if (FONT_DM_SERIF) fonts.push({ name: 'DM Serif Display', data: FONT_DM_SERIF, weight: 400, style: 'normal' });
  if (FONT_GROTESK_BOLD) fonts.push({ name: 'Space Grotesk', data: FONT_GROTESK_BOLD, weight: 700, style: 'normal' });
  if (FONT_GROTESK_MEDIUM) fonts.push({ name: 'Space Grotesk', data: FONT_GROTESK_MEDIUM, weight: 500, style: 'normal' });

  const len = title.length;
  let titleSize = 92;
  if (len > 50) titleSize = 80;
  if (len > 80) titleSize = 68;
  if (len > 110) titleSize = 58;
  if (len > 150) titleSize = 50;

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: COLORS.black,
          fontFamily: 'Space Grotesk, system-ui, sans-serif',
          padding: '90px 84px',
          justifyContent: 'space-between',
        }}
      >
        {/* Top: accent bar + category / breaking pill */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', width: 96, height: 10, backgroundColor: COLORS.amber, marginBottom: 44 }} />
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {breaking ? (
              <div style={{ display: 'flex', alignItems: 'center', marginRight: 18 }}>
                <div style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#e23b2e', marginRight: 12 }} />
                <span style={{ fontSize: 26, fontWeight: 700, letterSpacing: '0.2em', color: '#e23b2e' }}>BREAKING</span>
              </div>
            ) : null}
            {category ? (
              <span style={{ fontSize: 26, fontWeight: 700, letterSpacing: '0.2em', color: COLORS.amber, textTransform: 'uppercase' }}>
                {category}
              </span>
            ) : null}
          </div>
        </div>

        {/* Middle: headline + kicker */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              fontFamily: 'DM Serif Display, Georgia, serif',
              fontSize: titleSize,
              fontWeight: 400,
              color: COLORS.white,
              lineHeight: 1.06,
              letterSpacing: '-0.01em',
              maxHeight: titleSize * 1.06 * 6,
              overflow: 'hidden',
            }}
          >
            {title}
          </div>
          {kicker ? (
            <div
              style={{
                display: 'flex',
                marginTop: 40,
                paddingTop: 32,
                borderTop: `2px solid ${COLORS.amber}`,
                fontSize: 32,
                fontWeight: 500,
                color: COLORS.muted,
                lineHeight: 1.35,
                maxHeight: 32 * 1.35 * 4,
                overflow: 'hidden',
              }}
            >
              {kicker}
            </div>
          ) : null}
        </div>

        {/* Bottom: wordmark + link-in-bio */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', fontWeight: 700, fontSize: 40, letterSpacing: '0.02em', color: COLORS.white }}>
            <span>MONO</span>
            <span style={{ color: COLORS.amber }}>KROMATIK</span>
          </div>
          <div style={{ display: 'flex', fontSize: 24, fontWeight: 500, letterSpacing: '0.1em', color: COLORS.muted }}>
            FULL READ · LINK IN BIO
          </div>
        </div>
      </div>
    ),
    { width: 1080, height: 1350, fonts: fonts.length > 0 ? fonts : undefined }
  );
}
