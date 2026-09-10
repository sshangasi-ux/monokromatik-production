# The standing analytics review — free stack only

Everything here is free and already in the ecosystem. Run these each review; no
paid connectors (Ahrefs / SimilarWeb / Supermetrics / Klaviyo) are needed.

## 1. Traffic, SEO + newsletter — one command
```
cd video && set -a; . ./.env; set +a && node build/ga-report.mjs 534321100
```
Pulls **GA4** (users, sources, top pages, geography), **Search Console**
(impressions, clicks, CTR, queries, positions), and **ConvertKit** (list size +
30-day growth). ConvertKit needs `CONVERTKIT_API_SECRET` in `video/.env`
(ConvertKit → Settings → Advanced → API Secret — the read key; the public
`CONVERTKIT_API_KEY` used for sign-up forms cannot read counts).

## 2. YouTube — channel + video stats
`node <scratchpad>/yt-stats.mjs` using the `YT_*` tokens (channel subs/views,
per-video views). Shorts vs explainers, breakout tracking.

## 3. Revenue funnel — Supabase
The `entitlements` table (Paystack-linked) = paid members. `auth.users` = accounts.
Near-empty until pay-per-report volume builds.

## 4. Competitor sense — Google Trends (via the browser, always integrate)
Free, no API. Open Trends and compare relevant terms, 12 months, worldwide + a
Nigeria/South Africa/Kenya cut. Template:
```
https://trends.google.com/trends/explore?date=today%2012-m&q=<TermA>,<TermB>,<TermC>
```
**Read it carefully — term ambiguity distorts raw "search term" comparisons.**
E.g. "Semafor" is inflated by its Slavic meaning ("traffic light"); "Rest of
World" by the common phrase. Prefer Google's suggested **topic entity** over a
raw term where one exists, and sanity-check with the region breakdown.

What to compare:
- **Competitor publications** (The Africa Report, Stears, Semafor, Rest of
  World, Trapital) — audience search demand + who's rising.
- **Beat/topic demand** (Afrobeats, African fintech, Amapiano, Nollywood, "who
  owns …") — where content should lean.

Baseline read (Sep 2026, 12-mo avg, worldwide): The Africa Report ~41,
Rest of World ~38 (phrase-inflated), Semafor ~14 (meaning-inflated), **Stears ~1**
— i.e. the direct African-business-intelligence niche has almost no search
competition, so the who-owns / sector SEO cluster can own demand rivals aren't
contesting.

## What we deliberately do NOT pay for
- **SEO:** Search Console is the tool. Add **Bing Webmaster Tools** (free) for
  the Bing/Copilot side of the AI-citation channel.
- **Competitors:** Google Trends (above) + the SimilarWeb free browser extension
  ad hoc. Ahrefs/SEMrush only once actively contesting specific keywords.
- **LinkedIn:** native Page analytics (free, in LinkedIn) + GA referral volume.
- **Email:** the ConvertKit dashboard (free) + the pull in §1.
