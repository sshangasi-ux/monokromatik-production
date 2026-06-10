# MonoKromatik — Design System (Master)

> **Source of truth** for visual and interaction design across the MonoKromatik Network.
> When building any page or component, read this file first. For page-specific
> deviations, check `design-system/pages/<page-name>.md` — if it exists, its rules
> override this Master.

**Brand:** MonoKromatik Network — African stories (culture, sports, entertainment) for the diaspora.
**Design language:** *Exaggerated Minimalism* — bold, high-contrast, oversized typography, generous negative space, restrained palette. Monochrome canvas (black/white) with a single burnt-amber accent. The name is the brief: **mono**chrome + **kromatik** pop.

---

## 1. Design Principles

1. **Monochrome first, amber as punctuation.** Black, white, and greys carry the layout; amber (`#CC5500`) marks one thing per view — the primary action or the live/featured signal. If everything is amber, nothing is.
2. **Typography is the design.** Oversized, tightly-tracked display type does the heavy lifting. Let headlines be loud and the body be calm and readable.
3. **Negative space is intentional.** Whitespace groups and separates — it is not "empty." Don't fill it.
4. **High contrast, always legible.** Every text/background pair meets WCAG AA. See the contrast table (§3) — this is non-negotiable, not aspirational.
5. **Motion conveys meaning.** Animate to show cause and effect (enter, navigate, confirm), never for decoration. Always honor `prefers-reduced-motion`.
6. **One primary action per screen.** Secondary actions are visually subordinate (outline/ghost), never competing amber fills.

---

## 2. Color

### Brand primitives (existing — do not rename, ~600 usages)
| Token | Hex | Use |
|-------|-----|-----|
| `mono-black` | `#000000` | Primary text on light, dark sections |
| `mono-white` | `#FFFFFF` | Page background, text on dark |
| `mono-amber` | `#CC5500` | **Display accent only** — large text (≥24px / bold ≥18.66px), fills, hero |
| `mono-charcoal` | `#1A1A1A` | Dark surfaces, borders on light |
| `mono-soft-white` | `#F5F5F5` | Card / section surface on light |
| `mono-gray` | `#666666` | Secondary / meta text |

### New tokens (added for accessibility + theming)
| Token | Hex | Use |
|-------|-----|-----|
| `mono-amber-strong` | `#A85416` | **Inline links & small amber text on light** (body-size). AA-safe. |
| `mono-amber-hover` | `#8F4612` | Hover/active state for amber links & buttons on light |
| `mono-amber-bright` | `#E8631C` | Amber accent in **dark mode** (brighter for dark surfaces) |
| `mono-border` | `#E5E5E5` | Hairline borders / dividers on light |
| `mono-muted` | `#F0F0F0` | Muted fills, skeleton bases |

### Semantic tokens (theme-aware — prefer these in new components)
`background` · `foreground` · `surface` · `border` · `muted` · `muted-foreground` · `accent` · `accent-strong` · `accent-foreground` · `ring`
These flip automatically in dark mode (see §7). Using them = free dark-mode support.

### 3. Contrast — the critical rule ⚠️

`#CC5500` amber on white is **4.31:1** → it passes for **large text only**. It **fails AA for body text and inline links.** This is the most common mistake to avoid.

| Foreground | Background | Ratio | Verdict |
|---|---|---|---|
| `mono-amber` `#CC5500` | white | **4.31:1** | ✅ Large text / icons / fills only — ❌ never body or links |
| white | `mono-amber` `#CC5500` | 4.31:1 | ✅ Large button labels (bold) only |
| **`mono-amber-strong` `#A85416`** | white | **5.32:1** | ✅ **Use this for inline links & small amber text** |
| `mono-amber-strong` | `mono-soft-white` | 4.88:1 | ✅ Body on cards |
| `mono-black` | white | 21:1 | ✅ Body |
| `mono-gray` `#666666` | white | 5.74:1 | ✅ Secondary text |
| `mono-gray` | `mono-soft-white` | 5.27:1 | ✅ Secondary on cards |
| white | `mono-charcoal` `#1A1A1A` | 17.4:1 | ✅ Body |
| **Dark mode:** `mono-amber-bright` `#E8631C` | `#0F0F0F` | 5.69:1 | ✅ Body + links |
| Dark mode: black text | `#E8631C` button | 6.23:1 | ✅ Button labels |

**Rule of thumb:** amber for **buttons, badges, big numbers, and headlines**; `amber-strong` for **anything link-sized**.

---

## 4. Typography

Pairing (existing, keep — more distinctive than generic editorial fonts):
- **Display / headings:** `font-display` → **Space Grotesk** (600–700). Tight tracking (`-0.02em` to `-0.05em`) at large sizes.
- **Body / UI:** `font-body` → **Inter** (400/500). Line-height 1.5–1.75, measure 65–75ch.
- **Pull-quotes / editorial flourish:** `font-quote` → **Merriweather** (serif, italic for quotes).

### Type scale (fluid — Exaggerated Minimalism)
| Token / class | Size | Use |
|---|---|---|
| `text-hero` | `clamp(2.5rem, 8vw, 6rem)` | Page hero headline |
| `text-display` | `clamp(2rem, 5vw, 4rem)` | Section headline |
| `text-4xl … text-2xl` | Tailwind scale | Sub-heads |
| `text-base` (16px) | body | **Never below 16px for body** (avoids iOS zoom) |
| `text-sm` (14px) | meta, captions | Secondary only |

Rules: sequential `h1→h6` (no level-skipping for styling); weight for hierarchy (700 headings / 400 body / 500 labels); tabular figures for scores, stats, dates.

---

## 5. Spacing, Layout & Elevation

- **Spacing rhythm:** 4/8px system. Section vertical tiers: `16 / 24 / 32 / 48 / 64 / 96`.
- **Container:** `max-w-6xl` / `max-w-7xl`, consistent across pages. Long-form text capped at `max-w-prose` (≈65ch).
- **Breakpoints:** 375 / 768 / 1024 / 1440. Mobile-first. No horizontal scroll. Use `min-h-dvh`, not `100vh`.
- **Elevation:** brand shadows `shadow-e1/e2/e3` (subtle, sharp — not soft blurs). Cards on light use `mono-soft-white` surface + hairline `mono-border` rather than heavy shadow.
- **Radius:** keep tight — `rounded-lg` (cards), `rounded-full` (pills/badges). Avoid mixing radii at one hierarchy level.
- **z-index scale:** `0 / 10 / 20 / 40 / 100 / 1000` (content / sticky / dropdown / overlay / modal / toast).

---

## 6. Motion

Tokens (in `globals.css`): `--duration-fast 150ms` · `--duration-base 250ms` · `--duration-slow 400ms` · `--ease-out-brand`.
- Micro-interactions 150–300ms; exits ~70% of enter duration.
- Animate `transform`/`opacity` only — never width/height/top/left.
- Stagger list/grid entrance 30–50ms/item.
- Existing keyframes preserved: `animate-fade-in`, `animate-slide-up`, `animate-pulse-slow`.
- **Always** wrapped by `prefers-reduced-motion` (handled globally in `globals.css`).

---

## 7. Dark Mode

Semantic tokens remap under `.dark` and `@media (prefers-color-scheme: dark)`:
`background #0F0F0F` · `surface #1A1A1A` · `foreground #F5F5F5` · `muted-foreground #A3A3A3` · `accent #E8631C` · `border #2A2A2A`.
Dark mode uses **desaturated/brighter tonal** amber, not inverted colors. Components built on raw `mono-*` classes won't flip automatically — migrate them to **semantic tokens** to opt in. Test both themes independently.

---

## 8. Components — quick recipes

- **Primary button:** `bg-mono-amber text-mono-white` (label bold ≥16px → AA), hover `mono-amber-hover`, `cursor-pointer`, 150ms transition, visible focus ring, disabled = 0.5 opacity + no pointer.
- **Secondary button:** outline `border-mono-black text-mono-black` (light) / ghost. Never a second amber fill.
- **Inline link:** `text-mono-amber-strong` underline, hover `mono-amber-hover`. (Not `mono-amber` — fails contrast.)
- **Card:** `bg-mono-soft-white` + `border-mono-border`, `rounded-lg`, `shadow-e1`.
- **Badge / "LIVE" / category tag:** `bg-mono-amber text-mono-white` pill, uppercase, tracking-wide, bold.
- **Article body:** `font-body`, `text-base`, `leading-relaxed`, `max-w-prose`, `text-mono-black` on white.

---

## 9. Pre-ship checklist (every UI change)

- [ ] All text/background pairs meet AA (use §3; amber-strong for links).
- [ ] One primary (amber) CTA per view; secondary actions subordinate.
- [ ] SVG icons only (Lucide) — no emoji as structural icons; consistent stroke/size.
- [ ] Touch targets ≥44px; `cursor-pointer` on clickables; visible `:focus-visible`.
- [ ] Hover/press/disabled states defined; transitions 150–300ms.
- [ ] `prefers-reduced-motion` respected; animations use transform/opacity.
- [ ] Body text ≥16px, measure ≤75ch, sequential headings.
- [ ] Responsive at 375 / 768 / 1024 / 1440; no horizontal scroll; `min-h-dvh`.
- [ ] Images: `width`/`height` or aspect-ratio set (no CLS); below-fold `loading="lazy"`.
- [ ] Dark mode checked independently if the component uses semantic tokens.

---
*Generated with the `ui-ux-pro-max` skill, reconciled with MonoKromatik's existing brand tokens. Contrast ratios computed against WCAG 2.1.*
