# MonoKromatik — Analytics & Reporting

GA4 property **`G-9F5R5FM8NS`** is wired in `app/layout.tsx` via `@next/third-parties`. Google **Search Console** is verified (the `google:` verification meta in `layout.tsx`).

## What's tracked

### Automatic (GA4 Enhanced Measurement — enable in GA4 → Admin → Data Streams → Web → Enhanced measurement)
- `page_view` — every route change
- `scroll` — 90% page depth
- `click` (outbound) — links to other domains
- `view_search_results` — site search (if a `?q=` param is used)
- `video_*` — **embedded YouTube engagement** (start / progress / complete) — relevant now that articles carry YouTube embeds
- `file_download`

> Make sure Enhanced Measurement is **on** in the GA4 web stream — most of the above is free without code.

### Custom events (code — `lib/analytics.ts` → `track()`)
| Event | Where | Params | Why |
|---|---|---|---|
| `newsletter_signup` | `NewsletterSignup` (on success) | `source` | Primary conversion — newsletter is the growth metric |
| `article_view` | `ArticleClient` (on mount) | `slug`, `category` | Per-article + per-category readership beyond raw page_view |
| `source_click` | `ArticleClient` credited-source link | `slug`, `source` | Outbound to original publisher — credibility/attribution signal |

Add more by importing `track` in a client component: `track('event_name', { ...params })`. Keep it a no-op-safe wrapper (it already swallows errors).

## Mark conversions
In GA4 → Admin → **Events** (or Key events), mark these as **key events (conversions)**:
- `newsletter_signup` (primary)
- `video_start` / `video_complete` (engagement)
- optionally `source_click`

## Reporting view (recommended GA4 reports)
1. **Acquisition → Traffic acquisition** — where readers come from (organic vs social vs direct). Pair with Search Console for query-level organic data.
2. **Engagement → Pages and screens** — top articles/issues by views + average engagement time.
3. **Engagement → Events** — `newsletter_signup` count + conversion rate; `article_view` by `category` (add `category` as a custom dimension: Admin → Custom definitions → Create custom dimension, event-scoped, param `category`).
4. **Explore → Funnel** — `page_view` (article) → `scroll` (90%) → `newsletter_signup`, to see read-to-subscribe conversion.
5. **Search Console** — link it to GA4 (Admin → Search Console links) to surface impressions/clicks/queries inside GA4.

## Custom dimensions to register (Admin → Custom definitions)
- `category` (event param) — segment readership by Roots/Arena/Waves/etc.
- `source` (event param) — segment newsletter signups by placement.

## Next instrumentation candidates
- CTA clicks on Issue/Signal/Intelligence cards (`cta_click` with destination).
- "Read the full feature" / "See all" navigation intents.
- Once monetization lands: `report_view`, `report_download`, `checkout_start`, `purchase` (GA4 ecommerce).
