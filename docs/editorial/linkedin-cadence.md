# LinkedIn Cadence Playbook

LinkedIn is MonoKromatik's real traffic engine — GA4 (28d, Nov 2026) shows ~160 LinkedIn sessions vs ~80 organic search, and the top on-site pages are LinkedIn-pushed articles, not search landings. This playbook turns that channel into a deliberate pipe into the **monetized** article pages (each now carries a query-matched, PayPal-capable buy path).

There are **two lanes**. Keep them separate; they do different jobs.

---

## Lane 1 — The Page (automated, already running)

- **Mechanism:** `.github/workflows/linkedin-publish.yml` → `scripts/linkedin-publish.ts`, posting to the LinkedIn **Page** (org URN) via the Posts API, with the branded OG card + auto-caption (`linkedinArticleCaption`) + UTM link in the body.
- **Schedule:** Tue + Thu, 09:07 SAST. Review-gated by default (scheduled runs preview only; approve via `workflow_dispatch` with `publish=true`). Flip repo var `LINKEDIN_AUTOPOST=on` for hands-off.
- **Picks:** the next unposted article (own analysis first, Wire break as fallback).
- **Push a specific monetized page through the Page:** run the workflow with input `slug=<article-slug>`.

**Leave this lane as-is.** Two weekday slots on the Page is the right volume — daily cards flood the feed and train people to scroll past.

## Lane 2 — The personal profile (manual, high-reach — this playbook)

The workflow comment says it plainly: *the personal profile carries the reach, and Sibu's first-person posts materially out-reach the Page.* That lane has had **no drafts and no rhythm**. This fixes that.

- **Who:** Sibu's personal profile (posted via the in-app browser).
- **Voice:** first person, editorial, the value-capture lens — *who authors the work, who keeps the money.* A short decode, not a headline relay.
- **Rhythm:** 3 posts/week — **Mon / Wed / Fri, 08:00–09:00 SAST** — deliberately offset from the Tue/Thu Page posts so the two lanes never double up on one day.
- **Priority:** the five **monetized winners** below. Lead with the two R3,500 flagships (highest revenue per conversion), keep the evergreen "who owns" pieces in rotation (they also pull search).

### Posting mechanics (every personal post)

1. **Put the article URL in the post BODY** (not a comment). LinkedIn auto-renders the branded MonoKromatik OG card — no image upload. Link-in-body + card out-reaches text-only / link-in-comment for this brand.
2. **Use the UTM-tagged URL in each draft** (`utm_content=personal`, so GA separates the personal lane from the Page). Bake the UTM in **before** posting — editing a live post re-tags only the text, not the card.
3. **Link the ARTICLE, not the report.** The article is the free hook; it now carries the in-article buy CTA (→ `/reports/<slug>` → PayPal → FNB → Paystack). Funnel: LinkedIn → free article (card) → in-article CTA → checkout. Diaspora readers get PayPal.
4. One link, 3–4 hashtags, weekday morning. Don't hard-sell — the decode is the sell.

---

## The drafts (paste the whole block)

Each block is paste-ready: the post text, the UTM URL (renders the card), and the hashtags. All facts come from the articles' own copy.

### 1. African beer / Heineken — *flagship, R3,500*

```
A global beer CEO stood up on results day and admitted his company isn't winning with consumers as often as it should.

On the one continent where beer still grows, that's a strange thing to concede — and it isn't the real question. The real one is the slide he didn't put up: if you win African beer, who actually keeps the margin? And is there any version where it stays on the continent?

Winning the shelf and keeping the margin are two different games. Most of the continent's beer is very good at the first and quietly loses the second — to brand owners, licensors and shareholders who are rarely African.

I mapped the African beer value chain brewer by brewer — who wins the drinker, and who keeps the money.

https://www.monokromatik.com/article/heineken-admits-not-winning-who-wins-african-beer?utm_source=linkedin&utm_medium=social&utm_campaign=heineken-admits-not-winning-who-wins-african-beer&utm_content=personal

#AfricanBusiness #ValueCapture #FMCG #BrandStrategy
```

### 2. Who bankrolls SA sport — *flagship, R3,500*

```
South Africa's top football league is named after a bookmaker.

Betting brands now outspend telecoms on sport sponsorship here. Gambling turnover is up 550% in four years. Sit with that for a second.

So is betting money saving South African sport — or quietly repricing the whole market around itself? When one category becomes the bankroll, it doesn't just fund the game; it sets the terms. The real exposure is concentration: what happens to a federation's leverage when the next-biggest sponsor is a fraction of the biggest?

I mapped the dependency — who funds SA sport now, how concentrated it is, and where that leaves the properties taking the cheque.

https://www.monokromatik.com/article/who-bankrolls-south-african-sport?utm_source=linkedin&utm_medium=social&utm_campaign=who-bankrolls-south-african-sport&utm_content=personal

#SouthAfrica #SportsBusiness #Sponsorship #ValueCapture
```

### 3. Who owns Fenty Beauty — *study, R220*

```
"Who owns Fenty Beauty?" sounds like a trivia question. The answer is a strategy lesson.

Rihanna owns half. LVMH — through Kendo — owns the other half. And LVMH is reportedly looking to sell its stake.

That's the part worth watching. Fenty is the rare celebrity brand where the celebrity kept real ownership — not a royalty and a face-fee. So when the corporate half changes hands, Rihanna isn't a line item being sold; she's the half that compounds. Most "founder" beauty deals are structured the other way around.

I wrote the short, sourced answer on who owns Fenty — and the longer read on how megabrands exit, and who keeps the value when they do.

https://www.monokromatik.com/article/who-owns-fenty-beauty?utm_source=linkedin&utm_medium=social&utm_campaign=who-owns-fenty-beauty&utm_content=personal

#Beauty #Ownership #ValueCapture #Diaspora
```

### 4. Who owns MTN — *study, R220*

```
"Who owns MTN?" has a genuinely unusual answer: no one, and everyone.

MTN Group is JSE-listed with no controlling shareholder. Its single biggest holder is the PIC — South Africa's state pension manager. No foreign parent. No controlling family.

Which means something people miss: MTN's upside is still, structurally, held on the continent. In a decade where the pattern has been African-built brands ending up foreign-owned, a pan-African telecoms giant with its ownership spread across local institutions and pensioners is the exception, not the rule.

I broke down who actually owns MTN — and ran it through the value-capture lens: who keeps the money when the asset stays home.

https://www.monokromatik.com/article/who-owns-mtn?utm_source=linkedin&utm_medium=social&utm_campaign=who-owns-mtn&utm_content=personal

#Telecoms #SouthAfrica #Ownership #ValueCapture
```

### 5. Loeries 2026 — *study, R220*

```
Four Grand Prix. One dominant agency. A multinational named Brand of the Year.

The 2026 Loeries are a verdict on South African creativity — but read closely, they're also a map of where the value lands. Awards tell you who made the best work. They don't tell you who kept the upside the work created, and those are rarely the same party.

The agency wins the metal. The brand owns the lift. The client — often a multinational — compounds it offshore. Great work, authored here, captured elsewhere: the oldest pattern in this industry, made legible once a year.

I read the 2026 winners as a value ledger — who makes the work, who keeps the value.

https://www.monokromatik.com/article/loeries-2026-winners-what-the-work-says?utm_source=linkedin&utm_medium=social&utm_campaign=loeries-2026-winners-what-the-work-says&utm_content=personal

#Advertising #Loeries #CreativeIndustry #ValueCapture
```

---

## The two-week rotation

Personal lane (Mon/Wed/Fri AM). The Page auto-posts Tue/Thu underneath — no action needed.

| Week | Mon | Wed | Fri |
|---|---|---|---|
| **1** | Sport (flagship) | Fenty (evergreen) | Beer (flagship) |
| **2** | MTN (evergreen) | Loeries | Sibu's own first-person take, or reshare the week's best performer |

Then repeat, swapping in fresh pieces as they publish. Lead flagships on Mondays (highest-intent slot of the week); keep one Friday free for an unscripted first-person post — those out-reach everything and keep the profile from reading like a feed.

## Measuring it

Re-run the funnel read and filter by source:

```bash
cd video && set -a; . ./.env; set +a; node build/ga-report.mjs 534321100
```

Watch: LinkedIn sessions, `report_view` → `report_buy_click`, and `purchase` on the pages above. `utm_content=personal` vs the Page's default lets you see which lane converts. The goal is the first non-zero `purchase` — now that PayPal unblocks the diaspora `intl_buyer_intent` cohort.

See also: the `linkedin-posting-standard` note (link-in-body OG card), `lib/utm.ts`, `lib/social-queue.ts`, `deep-dive-standard.md`.
