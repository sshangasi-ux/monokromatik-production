import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * MonoKromatik OG Card — shared layout used by both opengraph-image
 * and twitter-image routes.
 *
 * Design spec (locked):
 *   1200 × 630, black background
 *   Left-edge amber accent bar (12px, full-height)
 *   Category pill (small caps, amber on dark, top-left)
 *   Title in DM Serif Display, white, large, responsive size
 *   MONO|KROMATIK wordmark in Space Grotesk, bottom-right
 *
 * Why DM Serif Display: editorial / magazine feel, mirrors NYT-class
 * publications. The site itself uses Space Grotesk for display
 * (modern / agentic), so the share card register intentionally
 * shifts to "magazine cover" rather than "app screenshot."
 *
 * Fonts are bundled in public/fonts and read from disk on the Node.js
 * runtime — no network calls, no Google Fonts CSS API dependency
 * (which has been deprecating its legacy TTF endpoint, breaking
 * the standard Vercel/Satori OG-image pattern).
 */

export interface OgCardOptions {
  title: string;
  category?: string;
}

const COLORS = {
  black: '#0a0a0a',
  amber: '#cc6f3a', // burnt amber — matches site --mono-amber
  white: '#fafafa',
};

const ACCENT_BAR_WIDTH = 12;

// Read fonts once at module load. They're tiny (<40KB each), bundled in
// public/fonts so they ship with the deployment.
const FONT_DIR = join(process.cwd(), 'public', 'fonts');

function loadLocalFont(filename: string): ArrayBuffer | null {
  try {
    const buf = readFileSync(join(FONT_DIR, filename));
    // Buffer -> ArrayBuffer (Satori needs a true ArrayBuffer, not a Node Buffer)
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  } catch {
    return null;
  }
}

const FONT_DM_SERIF = loadLocalFont('DMSerifDisplay-Regular.ttf');
const FONT_SPACE_GROTESK_BOLD = loadLocalFont('SpaceGrotesk-Bold.ttf');
const FONT_SPACE_GROTESK_MEDIUM = loadLocalFont('SpaceGrotesk-Medium.ttf');

/**
 * Render the MonoKromatik OG card as an ImageResponse.
 */
export async function renderOgCard(opts: OgCardOptions): Promise<ImageResponse> {
  const { title, category } = opts;

  // Build the fonts array — only include fonts that loaded successfully.
  const fonts: Array<{
    name: string;
    data: ArrayBuffer;
    weight: 400 | 500 | 700;
    style: 'normal';
  }> = [];
  if (FONT_DM_SERIF)
    fonts.push({ name: 'DM Serif Display', data: FONT_DM_SERIF, weight: 400, style: 'normal' });
  if (FONT_SPACE_GROTESK_BOLD)
    fonts.push({ name: 'Space Grotesk', data: FONT_SPACE_GROTESK_BOLD, weight: 700, style: 'normal' });
  if (FONT_SPACE_GROTESK_MEDIUM)
    fonts.push({ name: 'Space Grotesk', data: FONT_SPACE_GROTESK_MEDIUM, weight: 500, style: 'normal' });

  // Title sizing — longer titles get smaller type so they always fit on
  // two-to-three lines. Empirical breakpoints based on the site's titles.
  const titleLength = title.length;
  let titleFontSize = 76;
  if (titleLength > 60) titleFontSize = 64;
  if (titleLength > 90) titleFontSize = 56;
  if (titleLength > 120) titleFontSize = 48;

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          backgroundColor: COLORS.black,
          fontFamily: 'Space Grotesk, system-ui, sans-serif',
        }}
      >
        {/* Left-edge amber accent bar */}
        <div
          style={{
            width: ACCENT_BAR_WIDTH,
            height: '100%',
            backgroundColor: COLORS.amber,
          }}
        />

        {/* Main content area */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: '72px 80px',
            justifyContent: 'space-between',
          }}
        >
          {/* Top row: category pill */}
          <div style={{ display: 'flex' }}>
            {category ? (
              <div
                style={{
                  fontFamily: 'Space Grotesk, system-ui, sans-serif',
                  fontSize: 18,
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  color: COLORS.amber,
                  textTransform: 'uppercase',
                }}
              >
                {category}
              </div>
            ) : null}
          </div>

          {/* Middle: title */}
          <div
            style={{
              display: 'flex',
              fontFamily: 'DM Serif Display, Georgia, serif',
              fontSize: titleFontSize,
              fontWeight: 400,
              color: COLORS.white,
              lineHeight: 1.08,
              letterSpacing: '-0.01em',
              maxHeight: titleFontSize * 1.08 * 4,
              overflow: 'hidden',
            }}
          >
            {title}
          </div>

          {/* Bottom row: wordmark, bottom-right */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'baseline',
            }}
          >
            <div
              style={{
                display: 'flex',
                fontFamily: 'Space Grotesk, system-ui, sans-serif',
                fontWeight: 700,
                fontSize: 32,
                letterSpacing: '0.04em',
                color: COLORS.white,
              }}
            >
              <span>MONO</span>
              <span style={{ color: COLORS.amber }}>KROMATIK</span>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: fonts.length > 0 ? fonts : undefined,
    }
  );
}
