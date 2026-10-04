# Report-elevation triage — the Tier-A slate

*The prioritised list for the elevation program ([standard](./report-elevation-standard.md)).
56 reports; 32 open, 24 premium (email-gated) — but only **4 are actually paid PDFs**
today (amapiano, springbok, value-capture-scorecard, whos-buying-african-sport).
The goal: lift Tier-A to the bar and grow the paid/licensed shelf. The production-line
cron works down this list, newest-un-elevated first.*

**Legend:** ✅ already at/near bar · [+model] needs quantified model · 🎨 needs the design leg (few/no exhibits) · 🐻 needs a Bear Case.

---

## Tier A1 — elevate first · **paid PDF** (the money reports)
The decision-grade pieces that should carry a price. Priority order:

| Report | State | Monetise |
|---|---|---|
| `culture-due-diligence-african-football-rights` | deep (2,460w, 8ex, BC) [+model] | Culture-DD PDF |
| `culture-due-diligence-nollywood-streaming` | deep (2,295w, 7ex, BC) [+model] | Culture-DD PDF |
| `culture-due-diligence-african-mobile-money` | deep (2,206w, 8ex, BC) [+model] | Culture-DD PDF |
| `culture-due-diligence-afrobeats-catalogue` | ✅ strong (3,054w, 9ex, BC) | Culture-DD PDF |
| `signal-scorecard-nandos` | ✅ strong (2,804w, 9ex, BC) | Scorecard PDF (R220) |
| `signal-scorecard-flutterwave` | near (1,973w, 8ex, BC) [+model] | Scorecard PDF |
| `signal-scorecard-tyla` | near (1,932w, 8ex, BC) [+model] | Scorecard PDF |
| `athlete-value-capture-siya-kolisi` | ✅ (2,435w, 8ex, BC) | Value-Capture PDF |
| `value-capture-trevor-noah` | near (2,077w, 8ex, BC) [+model] | Value-Capture PDF |

## Tier A2 — elevate · **Index licence** (the data cuts, free worked samples)
Franchise anchors; monetise via the licensable Index cut, not a per-PDF sale.

| Report | State |
|---|---|
| `who-owns-african-fintech-league-table` | ✅ **DONE (pilot)** — quantified value-at-stake added |
| `who-owns-african-music-league-table` | near (2,148w, 9ex, BC) [+model] |
| `who-owns-african-beauty-league-table` | near (2,322w, 8ex, BC) [+model] |
| `who-owns-african-sport-league-table` | near (2,183w, 8ex, BC) [+model] |
| `who-owns-african-fashion-league-table` | near (2,122w, 8ex, BC) [+model] |

## Tier A3 — elevate (most work) · **paid PDF**
The **"Will It Land"** forward-reads: strong premium prose (2,400–3,250w) but **visually thin (0 exhibits) and no Bear Case**. The biggest design lift, highest unit upside. Do after A1/A2.
`will-it-land-*` — healthtech, electric-mobility, stablecoins, off-grid-solar, aviation, spearhead-spirits, magugu-house, ebonylife-on-plus, moniepoint-uk-nigeria, uncover-skincare, warner-africori-amapiano, totalenergies-afcon (each: 🎨🐻). Also the 3 premium briefings — african-luxury, nigerian-creative-economy, south-african-brand-culture (🎨).

---

## Tier B — polish, **keep free** (top-of-funnel / SEO)
The shorter market briefings and lighter scorecards — the moat taste. Light design + depth pass, stay free.
`african-startup-funding-concentration-2026`, `afrobeats-export-summer-economics`, `womens-football-africa-wafcon-briefing`, `transsion-african-phone-market-briefing`, `guinness-african-stronghold-briefing`, `who-owns-detty-december-homecoming-economy`, `vodacom-takes-control-of-safaricom`, `bridgement-r330m-banks-fund-the-disruptor`, `signal-scorecard-six-dogs`, `signal-scorecard-mielle-organics`, `signal-scorecard-jumia`, `athlete-value-capture-victor-osimhen`, `artist-value-capture-rema`, `signal-fit-brands-buying-into-amapiano`, `the-monokromatik-method`, `founding-report-intelligence-behind-african-influence`, `african-spirits-report-2026-who-owns-the-pour`.

## Tier C — fix or retire
- **`culture-is-business` — BROKEN (0 sections, empty).** Fix or remove before it ships as a dead link.
- Short "Will It Land?" one-pagers (`will-it-land-brand-south-africa-nascar`, `-shein-temu-africa`, `-starlink-africa`, ~1,400–1,550w, 6 sec): keep as free briefs or fold into A3 siblings.

---

## The monetisation split (the point of the triage)
- **Paid PDF (A1 + A3):** ~20 reports → the paid shelf grows from 4 to ~20 → bundles finally have mass.
- **Index licence (A2):** the 5 league tables → the licensable data product.
- **Free (B):** ~17 → SEO/authority moat.

Each A1/A3 elevated report, once its PDF exists + Paystack product is created, becomes a `BUNDLES` member (`lib/commerce.ts`). That's the loop.
