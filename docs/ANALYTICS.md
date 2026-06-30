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
| `case_study_view` | `CaseStudyFeature` via `TrackView` | `slug`, `brand` | Per-decode readership — the moat content |
| `index_view` | Signal Index page via `TrackView` | — | Usage of the Cultural-Signal Index (the wedge) |
| `cta_click` | `CTA` component (every CTA) | `href`, `variant`, `external` | Conversion funnel — which CTAs drive action |

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
- ~~CTA clicks~~ ✅ shipped (`cta_click` on every `CTA`).
- "Read the full feature" / "See all" navigation intents.
- Once monetization lands: `report_view`, `report_download`, `checkout_start`, `purchase` (GA4 ecommerce).

---

## Programmatic data — the backend loop (one credential powers it all)

The on-site instrumentation above feeds GA4. To pull that data **back into the
product**, the repo has two integrations that both authenticate with **one shared
Google service account** (zero extra deps — `lib/google-auth.ts` signs a JWT with
Node `crypto`):

| Integration | File | What it does | Run |
|---|---|---|---|
| **GA4 performance** | `lib/analyze-performance.ts` | Scores articles by views + engagement; the content engine doubles down on winners, prunes losers | in `scripts/run-pipeline.ts` |
| **Search Console** | `lib/search-console.ts` → `scripts/search-insights.ts` | Top queries/pages + **page-2 opportunities** (rank 8–20) to convert impressions to clicks | weekly `search-insights.yml` (Mon) |

Both **no-op gracefully** until the credential is set, then light up automatically.

### Service-account setup (the single switch)
1. **Google Cloud Console** → create (or pick) a project → **IAM & Admin → Service Accounts → Create service account** (e.g. `monokromatik-analytics`). No roles needed at the project level.
2. On that service account → **Keys → Add key → Create new key → JSON** → download.
3. **APIs & Services → Enable APIs**: enable **Google Analytics Data API** and **Google Search Console API** for the project.
4. **Grant it data access** (separate from IAM):
   - **GA4:** Admin → Property → **Property access management** → add the service account's `client_email` as **Viewer**. (Also note the **GA4 *property* ID** — the numeric one under Admin → Property details — set it as the `GA4_PROPERTY_ID` repo variable.)
   - **Search Console:** open the property → **Settings → Users and permissions → Add user** → the `client_email` → **Restricted** (read) is enough.
5. **Store the key:** base64-encode the JSON (`base64 -i key.json | pbcopy`) and set it as the repo **secret `GA4_SERVICE_ACCOUNT_JSON`**. (Optional repo **variable** `GSC_SITE_URL` if the property is a domain property — `sc-domain:monokromatik.com`; default is `https://www.monokromatik.com/`.)
6. Verify: Actions → **Search Insights** → Run workflow. It should report real query data instead of "not configured."

> Note: `lib/analyze-performance.ts` currently validates the credential but its GA4 reporting call is a stub — finishing it means either adding `@google-analytics/data` or porting it onto `lib/google-auth.ts` + the GA Data REST API (same pattern as `search-console.ts`).
