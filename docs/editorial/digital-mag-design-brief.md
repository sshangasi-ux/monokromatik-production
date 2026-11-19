# The MonoKromatik Issue — digital magazine design brief

**Status:** signed off 19 Nov 2026 (the five decisions in section 10 remain open) · **Owner:** editorial + product · **Reference:** outlandermag.com (Issue 02, "Icons"), read 19 Nov 2026
**Builds on:** `/editions` route (Edition 01, "The Ownership Issue") · `docs/EDITION-01-PLAN.md` · `docs/editorial/deep-dive-standard.md`

---

## 1. What we are making

A recurring, collectible, visually rich **issue**, released on a fixed rhythm, that puts one question about African and diaspora brand-and-culture work on the cover and answers it with sourced evidence. It is free to read on the site and to our mailing list, and it can be bought as a collector's digital edition, a print edition and limited prints.

It is not a blog with a nicer template. Each issue is a *product* with a cover, a contents page, a credited picture set, a data exhibit and a sell path, and it is designed to be shared as an object.

## 2. What we take from Outlander, and what we don't

Outlander sells a print magazine on the strength of object-ness: collectible covers, limited prints, sealed wraps, scarcity ("sold out" states on the store) and print tricks (thermochromic ink, scratch-and-sniff, pull-out posters, die-cut windows). Their store is minimal, the cover is the product, and they run a "make your cover" hook and a community channel to pull fans in.

**Take:**
- The cover as the hero product: one strong image, one name, one line. Covers are sold as variants.
- Editorial-led scarcity, used sparingly: a limited first run, then a numbered reprint or a sold-out state, never a fake countdown.
- A physical-feeling object online: heavy grid, large type, pull-quotes, folded "inserts" (expandable panels), sticker-like annotations on exhibits.
- Limited prints of the strongest images or exhibits, sold separately from the magazine.
- A simple community loop: sign-up to a channel, first access to each issue.

**Do not take:**
- Icon-led celebrity covers that depend on licensed brand and celebrity imagery we cannot clear. Our covers are built from sourced, credited photographs or from our own exhibits.
- Random cover variants sold as "lucky draws". Variant covers, if we do them, are numbered and disclosed.
- Print gimmicks that break on a phone. Every effect needs a digital equivalent that still works without the effect.

## 3. Our differentiator: sourced, credited, stylised

Our rule from the media standard holds: **every image is a real, sourced photograph with a named credit, or it is not used.** No stock, no generated stand-ins, no unsourced placeholders.

Within that rule we are free to stylise, and the brief should lean into it:

- **Stylisation is applied to sourced images, and is disclosed.** A duotone, halftone or colour-split treatment is credited as "photo: [photographer], [source], [licence]; treatment: MonoKromatik". The edition shows the original next to the treated version on request.
- **Every picture carries a credit line on the image, not in a footnote.** Credit = photographer or agency, source URL, licence, date.
- **Exhibits are the house style.** Our data exhibits (the Ownership Ladder, the Shared-Equity Score, the Signal Index) are drawn as the illustration system, so the magazine's graphics are our analysis, not decoration.
- **Covers are a rule, not a hunt:** each issue cover is one sourced photograph (or a MonoKromatik exhibit), a single headline, and the issue number.

## 4. Issue format

| Element | Spec |
|---|---|
| Cadence | One full issue per quarter. A short "Ledger" (6–8 pages, one exhibit) mid-quarter. |
| Length | 8–12 chapters for a full issue. Each chapter = one essay or decode plus one exhibit. |
| Theme | One question per issue, stated on the cover (example: "Who keeps the value?"). |
| Cover | One sourced photograph, one headline, issue number, credit line. |
| Contents | Numbered chapters, each linking to the article or decode it draws on. |
| Exhibits | At least one per chapter. Interactive where it helps, static print-ready where it doesn't. |
| Credits page | Every image, source, licence and date, plus the research sources. |
| Length of reading | Target 25–35 minutes for a full issue; each chapter stands alone. |

## 5. Site integration

- **`/editions` becomes the issue archive.** Each issue has a page, a cover, and a permanent URL. Edition 01 is issue 01.
- **Articles and reports feed issues.** Each chapter links to the free article it extends and to the paid report behind it, so the issue becomes the front door to the report shelf. This uses the funnel already in place (free article → in-article report CTA → PayPal checkout).
- **Inline report CTA** (already shipped) appears inside each chapter where the evidence goes deeper. No pop-ups.
- **Newsletter:** each issue goes to the mailing list first (free), with the cover as the hero image and a single link to the web issue.
- **OG cover card:** every issue serves its own generated cover card, so LinkedIn and the other channels render a branded cover automatically (the LinkedIn standard).
- **Print-ready export:** each issue exports to a print-ready PDF, the same file used for digital sales and print-on-demand.

## 6. Revenue ladder

Built on products we already sell (PayPal is the sole rail), with prices in line with the current shelf:

| Tier | Product | Price (current shelf) | Role |
|---|---|---|---|
| 0 | Issue web edition + newsletter | Free | Reach, sign-up |
| 1 | Collector digital edition (PDF + extra exhibits) | $12 (about R220) | First sale, low-risk |
| 2 | Print edition (print-on-demand) | to be priced (test $19–$25) | Object sale, no inventory |
| 3 | Limited prints of the cover and exhibits | to be priced (test from $40) | Collector upsell, numbered |
| 4 | Bundles: issue + report shelf | The Full Shelf $195; annual membership $83 | Bigger basket |

Rules:
- Issue 01 stays free. Paid tiers start with issue 02.
- Numbered runs only where the number is real. Sold-out states are reported, not staged.
- Print is print-on-demand until a run sells out. No inventory risk.

## 7. Strategic comms

- **Cadence:** issue release on a fixed Tuesday. LinkedIn personal posts lead with the cover and one decode (the value-capture lens), not a summary.
- **Launch sequence:** teaser (cover + question) → release (free issue) → two weeks later, a decode from the issue, linked back.
- **Community:** the mailing list is the first channel. Readers can nominate a subject for the next issue; nominations are reviewed by editorial, not voted.
- **Partners:** issue-level sponsorship is possible only with disclosure and no editorial influence (the Ownership 100 sponsor-slot logic applies).

## 8. UI / UX outputs

Deliverables for the design pass:

1. **Issue cover template** (mobile first, 16:9 and 4:5 crops, dark and light).
2. **Contents page** with numbered chapters and reading times.
3. **Chapter layout:** large standfirst, one pull-quote, one exhibit slot, inline credit captions.
4. **Image treatment spec:** the duotone / halftone / colour-split presets, with the credit-line component.
5. **Exhibit kit:** the static print version and the interactive version of each exhibit type.
6. **Store module:** cover, format choice, sold-out and numbered states, and the bundle upsell.
7. **Credits page** pattern.
8. **Print spec:** trim size, bleed, colour profile, and the print-on-demand file.

Accessibility and performance: WCAG AA contrast on every treatment; all stylised images keep the original as the alt-text source; no effect that needs a device sensor; each issue page under 2 MB of initial load.

## 9. Guardrails

- Only sourced, credited photographs or our own exhibits.
- Disclosed stylisation, every time.
- No licensed brand or celebrity imagery used as cover art without a clearance on file.
- No fabricated "reader" covers or testimonials. Reader cover mosaics only with explicit permission.
- The editorial standard applies: sourced, value-capture lens, both scenarios open, no unsourced claims.

## 10. Decisions needed

1. **Decided 19 Nov 2026: Issue 02 is about sport.** The cover is a sourced, credited photograph; its licence must be confirmed before the cover is set. Remaining decisions below still apply.

2. Print partner and run size.
2. Print partner and print run size for print-on-demand.
3. Final pricing for the print edition and limited prints (the tests above are proposals).
4. Whether to run a sponsor slot in issues (disclosed, no editorial say).
5. Whether to ship the "nominate a subject" form, or defer it.

## 11. Next steps

1. Sign off this brief and the decisions above.
2. Design pass on the eight UI/UX outputs.
3. Build the issue template on `/editions`, using Edition 01 as the first test case.
4. Ship Issue 02 to the mailing list first, then the web archive.
