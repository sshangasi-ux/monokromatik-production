# Issue Cover — Art Direction & Print Pipeline

Companion to `FOUNDING_ISSUE_COMMISSIONING_SLATE.md`. That doc sets the *editorial*
slate; this one governs the *cover object* — the composed, shareable magazine cover
rendered by `app/components/IssueCover.tsx` on `/issues/<n>`, and its onward life as a
print-collectible.

Status: **spec only.** No commissioned/AI-base art exists yet. Issue 001's
`cover.image` is a clearly-labelled placeholder (the DR Congo Léopards webp, 1080×810
— web-only, far below print resolution). Build the export tooling when real art lands;
do not automate an export of a placeholder.

---

## 1. Sourcing model — art-directed base + AI assist

Decided: **not pure-AI.** A founding issue is a credibility instrument; a wholly
machine-generated cover undercuts the brand's claim to authored intelligence. The
model is:

1. **Art direction first.** A human sets the concept, composition, crop, type lockup,
   palette and focal subject (brief below). This is the part the brand is judged on.
2. **AI assist within the frame.** AI fills texture, background, grade, or extends a
   plate — *inside* the art-directed composition, at print resolution. Never the
   headline subject of a reported feature unless explicitly labelled as illustration.
3. **Rights + labelling.** Any AI-assisted element is logged in
   `ISSUE_001_MEDIA_AND_SOURCE_REGISTER.md` and credited honestly in
   `cover.imageCredit` (see `SOURCE_AND_RIGHTS_POLICY.md`). No real, identifiable
   person is AI-fabricated. Licensed/commissioned plates keep their credit line.

**Interim option (owned, zero licensing risk):** render `Issue001KineticArtwork` to a
high-res still and use it as `cover.image` until commissioned art is produced. It is
already the brand's owned visual language (see §4).

---

## 2. Per-issue cover brief

Fill one of these per issue before art starts. 001 is the worked example.

**Issue 001 — The Intelligence Behind African Influence** (`accent #CC5500`)
- *Concept:* Africa as the source of global brand value — authorship, not localisation.
- *Subject:* a single arresting, rights-cleared or commissioned hero image with a
  continental/diasporic cultural charge; or the owned kinetic still as interim.
- *Mood:* burnt-orange heat over mono ink; film grain; arthouse-still gravity.
- *Type:* `MONO`+`KROMATIK` masthead, serif feature title, dek + 4 coverlines (live).
- *Do not:* use borrowed campaign imagery as the cover — campaign stills belong inside
  features, credited. The cover must be brand-owned or commissioned.

**Issue 002 — Culture Is Business** (`accent #1E6F5C`) — fandom→footfall, sport/music/
hospitality. Commerce-of-belonging mood; emerald over ink. Coverlines drafted in data.

**Issue 003 — Will It Land?** (`accent #2E7D9A`) — the relevance test; scorecard/
annotation treatment; analytical steel-blue. Coverlines drafted in data.

Accents are deliberately distinct per issue so the catalogue reads as a *system* of
collectible editions, not one repeated template.

---

## 3. Print-resolution pipeline (build when art exists)

Goal: every cover is a print-collectible **and** a fast web asset from one master.

### Targets
| Property | Spec |
|---|---|
| Trim | A4 portrait — **210×297mm** (house default; A5 220×... variants later) |
| Bleed | **3mm** every edge → working canvas **216×303mm** |
| Resolution | **≥300dpi at trim** → **2480×3508px** (A4 @ 300dpi, no bleed); **2551×3579px** with 3mm bleed |
| Safe area | keep masthead, title, coverlines **≥6mm** inside trim |
| Colour (print) | **CMYK**, FOGRA39 / US Web Coated as the run demands; rich black for ink, not 4-plate where it shows through |
| Colour (web) | **sRGB**; accents above are sRGB hex — get them proofed for CMYK gamut (burnt orange #CC5500 and emerald #1E6F5C sit near gamut edges — expect a slight shift) |
| Export (press) | **PDF/X-1a or PDF/X-4**, or flattened **TIFF**; fonts embedded/outlined |
| Export (web) | **webp** (and avif), longest edge ~2000px, quality ~80, sRGB |

### Flow
```
art-directed master (layered, ≥300dpi, AdobeRGB/CMYK working)
   │
   ├─► press branch  → flatten → CMYK convert (ICC) → PDF/X or TIFF  → the run / downloads
   │                                                    └ cover.print.pressReady
   │
   └─► web branch    → sRGB → resize (~2000px) → webp/avif  → public/issue-covers/
                                                  └ cover.image (the slot the site serves)
```

### Tooling (when we build it)
- **Raster/convert:** ImageMagick or `sharp` for the web branch (resize, sRGB, webp).
  `sharp` cannot emit CMYK PDF/X — keep that branch in the design tool
  (InDesign/Affinity export preset) or a `vips`/Ghostscript step.
- **Web export is automatable now-ish:** a `scripts/build-cover-web.mjs` that takes the
  master and emits the sized webp/avif into `public/issue-covers/<n>/` and prints the
  `cover.image` path to paste into `data/issues.json`.
- **Press export stays design-tool-owned** until volume justifies scripting — PDF/X
  colour management is error-prone to automate and low-frequency (one per issue).
- Store masters out of the web bundle (they're large) — a `print/` asset store or
  cloud bucket, referenced by `cover.print.master`, never imported by Next.

### Data shape
`Issue.cover.print` (added in `lib/issues.ts`) records the print assets and their
provenance: `master`, `pressReady`, `dpi`, `trim`, `bleed`, `colorSpace`. The site
renders `cover.image` only and never reads `cover.print`.

---

## 4. The kinetic artwork — keep it

`Issue001KineticArtwork` is **not** orphaned. It still powers two live surfaces:
- the homepage `LivingCover` "signal" slide (`LivingCover.tsx`), and
- the `/issues/001/cover` visual-study microsite (`app/issues/001/cover/page.tsx`).

It moved *off* the `/issues/001` hero (now the art-directed `IssueCover`), which is
correct: the hero is the composed cover; the microsite explains the owned visual
language behind it. **Decision: keep it on both.** It is the zero-licensing interim
cover candidate (§1) and the brand's owned motion signature. No action needed beyond
not deleting it.

---

## 5. Definition of done (per issue)

- [ ] `cover.image` = real art-directed art (not placeholder), web-optimised, in `public/`
- [ ] `cover.imageCredit` = honest credit incl. any AI-assist / licence line
- [ ] `cover.accent` confirmed (001 #CC5500 · 002 #1E6F5C · 003 #2E7D9A)
- [ ] `cover.dek` + `coverlines` sign-off (all three drafted in data)
- [ ] `cover.print.*` populated once a ≥300dpi CMYK press file exists
- [ ] entry in `ISSUE_001_MEDIA_AND_SOURCE_REGISTER.md` for rights/AI provenance

---

## 6. Cover concept & prompt library (Issue 001)

The cover carries the issue's thesis — *"Representation asks who is visible. Influence
asks who shaped the idea, who gets access, and who captures value"* — in one frame, with
each feature seeded as a visual cue for the second look.

### Theme → visual mapping
| Issue 001 element | Visual cue in the cover |
|---|---|
| The African Advantage (thesis) | A commanding creator-director figure as hero — authorship, not representation |
| Nike × Air Afrique | Statement sneaker; West African ground ("where the story begins") — **unbranded, no logos** |
| Orange Women's Football (S. Africa) | An unmistakable **football**; the figure as athlete-creative |
| Brand Weather — Four Signals | Topographic weather/radar map; **exactly four** burnt-orange signal points |
| The Boardroom / The Backroom | Sculpted light/shadow — polish meets craft |
| Brand system | Monochrome + single accent `#CC5500`; "intelligence as motion"; African continent |

### Generation log
- **Gen 1 (Prompt A):** figurative hero on bone/cream ground, all-black jacquard coat,
  football, contour map of Africa, orange signals. **Kept:** monochrome figure, heritage
  jacquard coat, film grain, weather-map concept, standing authority. **Fixed in v2:**
  (1) sneakers showed a real **ASICS** logo — wrong brand for a Nike × Air Afrique issue
  *and* a trademark risk → unbranded; (2) ball read ambiguous (vintage leather) → explicit
  football; (3) ~6 signal dots → exactly four; (4) figure dead-centre with map lines through
  the top → shift right, clear top band + lower-left for the lockup; (5) accent over-used →
  restrict to the four signals; (6) continent not fully legible → make Africa unmistakable.
- **Gen 2 (Canva, wired).** Generated cover comps in Canva from the bone brief. Learned
  that Canva's AI **garbles baked-in type** (invented headlines, "JOC THIS ANGES" gibberish,
  dropped title) — two attempts confirmed it's unreliable for the lockup. **Resolution:
  separate art from type.** Generated a *text-free* Canva hero (bone ground, ink figure in a
  long coat holding a football, Nike sneaker retained per Sibu, Africa line-art map, orange
  signals) and wired it as a **non-composed** `tone:light` cover so `IssueCover` overlays the
  correct masthead/title/dek/coverlines from data (always legible, accessible, indexable).
  Files: `public/issue-covers/001/cover.webp` (1600×2263, web) + `cover-master.png`
  (2480×3507, ~300dpi A4 master). Verified live on `/issues/001`, no errors.
  - *Known nit:* the figure sits centre-right, so the title's right edge ("Behind",
    "Influence") crosses the dark coat (ink-on-dark, slightly reduced contrast). Fix options:
    a left bone gradient behind the text, or regen art with the figure pushed further right.
  - *Takeaway:* never bake cover type via AI image/design tools — art-only render + the
    component lockup is the standing approach. Print masters likewise composite type in
    InDesign/Affinity, not in the generator.
  - *Print master built (this session).* Composited the correct lockup over the 300dpi art
    via `sharp` + an SVG lockup, flattened to `cover-print.jpg` (2480×3507) and wrapped in a
    hand-assembled A4 PDF `cover-a4-print.pdf` (full-bleed DCTDecode). `cover.print.*`
    populated. **Pre-press still owes:** sRGB→CMYK conversion (FOGRA39/US Web Coated), +3mm
    bleed (extend the bone ground), and substituting the brand display serif (Fraunces) for
    the master's system-serif fallback. A left bone wash was baked behind the lower-left type
    so the title reads cleanly over the dark coat.
- **Resolved — bone (light) direction chosen.** `IssueCover.tsx` now supports a
  `cover.tone: 'light' | 'dark'` field. `'light'` renders the lockup **ink-on-bone**
  (`bg-mono-paper` ground, ink masthead/title, charcoal dek/coverlines, burnt-orange accent,
  bone scrim over the art); `'dark'` (default) keeps white-on-ink. Issue 001 is set to
  `'light'`. Verified rendering on `/issues/001`. The bone render must therefore keep the
  composition the v2 prompt specifies — figure right-of-centre, clean top band, quiet
  lower-left — so the ink title sits on open bone, not over the figure.

### Prompt A — iconic hero, figurative (the chosen direction)
> Editorial magazine cover, portrait A4 (1:1.414), ultra-high res, fine-art print quality.
> One original African woman (not a real person) reading as creative director + athlete +
> author: calm, commanding, direct gaze. All-black look — sculptural tailored coat with
> tonal African geometric jacquard (bogolan/adire, woven not printed). Holds a single classic
> football. Behind her, the African continent as fine contour linework like a weather/radar
> map; exactly four burnt-orange (#CC5500) signal points. Monochrome figure on bone ground,
> one accent only, 35mm grain. Single-source sculpted light. Keep the top band and lower-left
> open for typography. No text, letters, logos or watermarks.

### Prompt A v2 — tightened (current working prompt)
> An iconic editorial magazine cover, portrait A4 proportions (1:1.414), ultra-high
> resolution, fine-art print quality. One unforgettable, gallery-grade image.
>
> GROUND: warm bone/oat paper (uncoated fine-art stock). Strictly monochrome — figure in
> deep near-black, ground in bone — lifted by ONE accent, burnt terracotta orange (#CC5500),
> used ONLY on the signal markers. Fine 35mm grain across the whole frame so figure and
> ground share one skin.
>
> HERO: one original African woman (not any real or identifiable person) — at once creative
> director, author and athlete. Calm, commanding, direct gaze; the posture of someone who
> shaped the idea. All-black: sculptural tailored coat with subtle tonal African geometric
> jacquard (bogolan/adire-inspired, woven not printed), tailored trousers. On her feet, an
> unbranded high-fashion athletic sneaker — absolutely NO logos, stripes or brand marks. She
> holds one classic association-football (soccer ball) with quiet authority — unmistakably a
> football, monochrome, refined.
>
> ENVIRONMENT: behind her, ONLY the African continent — instantly recognisable, drawn in fine
> single-weight contour linework like a weather/radar map being read. EXACTLY FOUR luminous
> burnt-orange signal points across the map (West, Southern, East, North Africa) — no more
> than four. A whisper of bare earth beneath her feet. Keep the map delicate, secondary to
> the figure.
>
> COMPOSITION (critical): figure RIGHT of centre. Keep a clean, line-free band across the TOP
> for a masthead and the LOWER-LEFT quadrant open and quiet (bone paper only) for a large
> title set later. Strong figure-to-ground separation — she must read as a silhouette from
> across a room.
>
> LIGHTING: single-source, directional, sculpted — luminous face, deep shadow on the form.
>
> Iconic, restrained, authoritative, premium. No text, no letters, no logos, no watermarks.

### Prompt B — iconic emblem, graphic (ownable / interim fallback)
> Iconic graphic cover, portrait A4 (1:1.414), ultra-high res. The African continent as a
> luminous intelligence field on deep near-black — geography in fine contour lines like a
> radar/weather map. Exactly four glowing burnt-orange (#CC5500) signal markers; faint orbital
> rings; one signal trajectory sweeping through ("intelligence as motion"). A football, an
> unbranded sneaker and a creator's profile woven in as subtle silhouettes. Monochrome + one
> accent, film grain, deep negative space, gallery-grade restraint. Keep top + lower-left open
> for type. No text, letters, logos or watermarks.
