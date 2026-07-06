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

/** Fonts array shared by both cards — only includes fonts that loaded. */
function ogFonts() {
  const fonts: Array<{ name: string; data: ArrayBuffer; weight: 400 | 500 | 700; style: 'normal' }> = [];
  if (FONT_DM_SERIF) fonts.push({ name: 'DM Serif Display', data: FONT_DM_SERIF, weight: 400, style: 'normal' });
  if (FONT_SPACE_GROTESK_BOLD) fonts.push({ name: 'Space Grotesk', data: FONT_SPACE_GROTESK_BOLD, weight: 700, style: 'normal' });
  if (FONT_SPACE_GROTESK_MEDIUM) fonts.push({ name: 'Space Grotesk', data: FONT_SPACE_GROTESK_MEDIUM, weight: 500, style: 'normal' });
  return fonts;
}

export interface IndexCardOptions {
  brand: string;
  score: number;
  rank: number;
  total: number;
  /** Composite change since the previous snapshot; null/0 = no movement shown. */
  scoreDelta?: number | null;
  /** Per-axis averages (1–5) to render as a "reads" strip; up to 4 shown. */
  axes?: { label: string; level: number }[];
  /** The measured corroboration anchor beside the editorial score. */
  evidence?: { score: number; tier: string } | null;
}

const GREEN = '#3FB984';
const RED = '#E5634D';
const MUTE = '#9A958C';

/**
 * The Cultural-Signal Index share-card — a screenshot-perfect 1200×630 social
 * image: brand, big composite score, rank, ▲/▼ movement, and the four-axis
 * read. This is the artifact that travels: every ranked brand becomes a
 * distributor when they share it. Mirrors the embeddable badge's design language
 * (ink + amber + serif name) so the badge and the share-card read as one system.
 */
export async function renderIndexCard(opts: IndexCardOptions): Promise<ImageResponse> {
  const { brand, score, rank, total, scoreDelta, axes = [], evidence } = opts;

  const len = brand.length;
  let brandSize = 92;
  if (len > 16) brandSize = 76;
  if (len > 26) brandSize = 62;
  if (len > 38) brandSize = 50;

  const moved = typeof scoreDelta === 'number' && scoreDelta !== 0;
  const up = (scoreDelta ?? 0) > 0;
  const deltaColor = up ? GREEN : RED;
  const shownAxes = axes.slice(0, 4);

  return new ImageResponse(
    (
      <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'row', backgroundColor: COLORS.black, fontFamily: 'Space Grotesk, system-ui, sans-serif' }}>
        <div style={{ width: ACCENT_BAR_WIDTH, height: '100%', backgroundColor: COLORS.amber }} />

        {/* Left: kicker, brand, rank + movement, axis reads */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '64px 56px 64px 72px', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', fontSize: 20, fontWeight: 700, letterSpacing: '0.22em', color: COLORS.amber, textTransform: 'uppercase' }}>
            Cultural-Signal Index
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', fontFamily: 'DM Serif Display, Georgia, serif', fontSize: brandSize, fontWeight: 400, color: COLORS.white, lineHeight: 1.04, letterSpacing: '-0.01em', maxHeight: brandSize * 1.04 * 2, overflow: 'hidden' }}>
              {brand}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 22, fontSize: 22, fontWeight: 700, letterSpacing: '0.14em', color: MUTE }}>
              <span>RANK #{rank} OF {total}</span>
              {moved ? (
                <div style={{ display: 'flex', alignItems: 'center', marginLeft: 22 }}>
                  <div style={{ width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', ...(up ? { borderBottom: `12px solid ${deltaColor}` } : { borderTop: `12px solid ${deltaColor}` }) }} />
                  <span style={{ marginLeft: 9, color: deltaColor }}>{Math.abs(scoreDelta as number)}</span>
                </div>
              ) : null}
            </div>
          </div>

          {shownAxes.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              {shownAxes.map((a, i) => (
                <div key={a.label} style={{ display: 'flex', flexDirection: 'column', marginLeft: i === 0 ? 0 : 44 }}>
                  <span style={{ display: 'flex', fontSize: 34, fontWeight: 700, color: COLORS.white, lineHeight: 1 }}>{a.level.toFixed(1)}</span>
                  <span style={{ display: 'flex', fontSize: 13, fontWeight: 700, letterSpacing: '0.14em', color: COLORS.amber, marginTop: 8 }}>{a.label.toUpperCase()}</span>
                </div>
              ))}
            </div>
          ) : <div style={{ display: 'flex' }} />}
        </div>

        {/* Right: the number + wordmark */}
        <div style={{ width: 384, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end', padding: '64px 72px 64px 0' }}>
          <div style={{ display: 'flex' }} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', alignItems: 'baseline' }}>
              <span style={{ fontSize: 200, fontWeight: 700, color: COLORS.white, lineHeight: 0.9, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>{score}</span>
              <span style={{ fontSize: 40, fontWeight: 500, color: MUTE, marginLeft: 6 }}>/100</span>
            </div>
            <span style={{ display: 'flex', fontSize: 16, fontWeight: 700, letterSpacing: '0.22em', color: COLORS.amber, marginTop: 10 }}>SIGNAL SCORE</span>
            {evidence ? (
              <span style={{ display: 'flex', fontSize: 15, fontWeight: 700, letterSpacing: '0.14em', color: MUTE, marginTop: 14 }}>
                EVIDENCE · {evidence.tier.toUpperCase()} {evidence.score}
              </span>
            ) : null}
          </div>
          <div style={{ display: 'flex', fontWeight: 700, fontSize: 28, letterSpacing: '0.04em', color: COLORS.white }}>
            <span>MONO</span>
            <span style={{ color: COLORS.amber }}>KROMATIK</span>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts: ogFonts().length > 0 ? ogFonts() : undefined }
  );
}

export interface MoversCardOptions {
  since: string | null;
  /** Up to ~5 movers, climbers first then new entries. */
  movers: { brand: string; score: number; scoreDelta: number; isNew: boolean }[];
}

/**
 * The Index "drop" share-card — the recurring-reveal artifact ("the Index just
 * dropped"): what climbed and what entered since the last snapshot, on one
 * shareable 1200×630 card. Pairs with the per-brand share-card; this one is for
 * the *update itself*, the ritual the whole audience shares.
 */
export async function renderMoversCard(opts: MoversCardOptions): Promise<ImageResponse> {
  const { since, movers } = opts;
  const rows = movers.slice(0, 5);

  return new ImageResponse(
    (
      <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'row', backgroundColor: COLORS.black, fontFamily: 'Space Grotesk, system-ui, sans-serif' }}>
        <div style={{ width: ACCENT_BAR_WIDTH, height: '100%', backgroundColor: COLORS.amber }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '60px 72px', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', fontSize: 20, fontWeight: 700, letterSpacing: '0.22em', color: COLORS.amber, textTransform: 'uppercase' }}>
              Cultural-Signal Index {since ? `· Movers since ${since}` : ''}
            </div>
            <div style={{ display: 'flex', fontFamily: 'DM Serif Display, Georgia, serif', fontSize: 76, fontWeight: 400, color: COLORS.white, lineHeight: 1.02, marginTop: 16 }}>
              What moved.
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {rows.length === 0 ? (
              <div style={{ display: 'flex', fontSize: 30, color: MUTE }}>A new class is being scored.</div>
            ) : rows.map((m) => (
              <div key={m.brand} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: 16, paddingBottom: 16 }}>
                <span style={{ display: 'flex', fontSize: 34, fontWeight: 700, color: COLORS.white, maxWidth: 720, overflow: 'hidden' }}>
                  {m.brand.length > 34 ? `${m.brand.slice(0, 33)}…` : m.brand}
                </span>
                {m.isNew ? (
                  <span style={{ display: 'flex', fontSize: 26, fontWeight: 700, letterSpacing: '0.1em', color: COLORS.amber }}>NEW · {m.score}</span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', fontSize: 28, fontWeight: 700, color: GREEN }}>
                    <div style={{ width: 0, height: 0, borderLeft: '9px solid transparent', borderRight: '9px solid transparent', borderBottom: `13px solid ${GREEN}`, marginRight: 12 }} />
                    {m.scoreDelta} → {m.score}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', fontWeight: 700, fontSize: 28, letterSpacing: '0.04em', color: COLORS.white }}>
            <span>MONO</span>
            <span style={{ color: COLORS.amber }}>KROMATIK</span>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts: ogFonts().length > 0 ? ogFonts() : undefined }
  );
}
