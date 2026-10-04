# MonoKromatik — Brand Asset Suite

Download-and-keep-on-file assets. All logos are **SVG (vector)** — open in a browser, Figma, Illustrator or Affinity; scale to any size; export to PNG for platforms that need raster.

## Logos & mark
| File | Use |
|---|---|
| `monokromatik-wordmark-primary.svg` | Primary — on paper/light |
| `monokromatik-wordmark-reverse.svg` | On ink/dark |
| `monokromatik-wordmark-mono-black.svg` | Single-colour (all ink) — stamps, fax, engraving |
| `monokromatik-wordmark-mono-white.svg` | Single-colour (all white) |
| `monokromatik-monogram.svg` | MK monogram — ink square, amber MK |
| `monokromatik-favicon.svg` | Favicon (single "M") |
| `monokromatik-avatar.svg` | Social avatar 1:1 |

### Ready-made PNG exports (horizontal wordmark)
Rendered at 2048px in the real **Space Grotesk 700** (the SVGs fall back to Arial if the font isn't installed — see the render note below). Drop-in for social, decks, email and banners.
| File | Use |
|---|---|
| `monokromatik-wordmark-reverse-dark.png` | On dark — ink background (matches the dark brand aesthetic) |
| `monokromatik-wordmark-reverse-transparent.png` | On dark — transparent, to overlay on dark photos/surfaces |
| `monokromatik-wordmark-primary-light.png` | On light — paper background |
| `monokromatik-wordmark-primary-transparent.png` | On light — transparent, to overlay on light surfaces |

## Social & templates
| File | Use |
|---|---|
| `monokromatik-social-banner.svg` | LinkedIn/social banner (1128×191) |
| `monokromatik-share-card-template.svg` | Share card (1200×630) — swap headline/score |
| `monokromatik-ranked-badge.svg` | "Ranked by MonoKromatik" badge — swap score/rank |
| `monokromatik-scorecard-template.svg` | Cultural-Signal scorecard device |

## Design tokens
| File | Use |
|---|---|
| `tokens.css` | CSS custom properties (colour + type) |
| `tokens.json` | Design tokens (Figma / Style Dictionary) |
| `palette.csv` | Colour spec — HEX / RGB / CMYK / Pantone |

## Notes
- **Fonts:** the wordmark is set in **Space Grotesk** (feature serif **Fraunces**, body **Inter**) — all free on Google Fonts. For print or fully portable files, open a wordmark SVG with the font installed and **convert text to outlines/paths** once, then re-save.
- **CMYK & Pantone** in `palette.csv` are software conversions — confirm against a physical swatch book before any print run.
- **PNG/JPG:** export any SVG at the size you need (e.g. 512×512 avatar, 1200×630 share card) from Figma/Illustrator or a browser screenshot. **The ready-made wordmark PNGs above were rendered with Space Grotesk embedded** — if you re-render an SVG headlessly, embed the font first (grab a static TTF from Fontsource, inline it as an `@font-face` data-URI in the SVG) or the text silently falls back to Arial and the letterforms break.
- Full guidance: `../MONOKROMATIK-BRAND-CI-PACK.md` · visual book: the *Designer Edition* artifact.
