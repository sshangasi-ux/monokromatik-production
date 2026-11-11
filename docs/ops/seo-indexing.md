# SEO & indexing — why organic is at zero, and the fix

*Diagnosis run 27 July 2026. Owner actions are marked 🔴 (do these — they're the unlock).*

> **UPDATE (same day, after seeing the live GSC data — corrects the first read below).**
> The initial "essentially not indexed" conclusion was too strong. GSC shows the URL-prefix
> property `https://www.monokromatik.com/` is **already verified** (the HTML tag is live in
> `app/layout.tsx`), the sitemap is **submitted and read successfully (Success, 327 pages)**,
> and **33 pages are already indexed** (39 not-indexed, ~255 still queued for crawl). So:
> - **Skip the "Domain property / DNS TXT" route in Fix 1** — the URL-prefix property is already
>   verified and `GSC_SITE_URL` already matches it. Just submit-sitemap (done) + Request-Indexing.
> - The real bottleneck is **authority (no backlinks)**, which throttles crawl and drives the 29
>   "Crawled – currently not indexed" pages. The action plan is **`docs/ops/seo-backlink-plan.md`**.
> - The "39 not indexed" breakdown was benign: 1 noindex + 1 robots (both **intentional**), 8×404
>   (stale/removed URLs — `/membership` & `/shop` already self-healed to 200; the rest are old
>   numeric-ID URLs and pruned drafts that correctly 404 — **no redirects needed**).
>
> Everything below is still useful for the backlink strategy and cornerstone list; only the
> "add a Domain property" step and the "not indexed at all" framing are superseded.

## The finding

The site is **technically clean and fully indexable — and essentially not indexed by Google.**

What's already correct (so we don't chase ghosts):
- `robots.txt` allows crawling (`Allow: /`; only `/api/`, `/_next/`, `/admin/` disallowed) and references the sitemap.
- **No** `noindex` meta tag and **no** `X-Robots-Tag: noindex` header on any page.
- Canonicals are correct and self-referential (all → `https://www.monokromatik.com/...`).
- `sitemap.xml` is valid, fresh (`lastmod` current), 329 URLs, includes brand-new articles.
- Googlebot receives a full server-rendered `200` (no JS-shell blind spot).

And yet: a real `site:monokromatik.com` search returns ~nothing from the domain, Search Console reports **zero** queries/pages, and a search for our own topic ("Cultural-Signal Index, African brand intelligence") surfaces only competitors (AFRIQ Terminal, M+C Saatchi's Cultural Power Index, Industrie Africa).

## Root cause — a discovery + authority problem, not an on-page one

For a young domain with **no backlinks**, this is the expected outcome. Google needs two things we haven't supplied, and neither is on the page:

1. **An explicit "index me" push** — the sitemap is live but there's no evidence it was ever *submitted* in Search Console, and no page has been manually requested for indexing.
2. **External link signals** — the site has ~zero inbound links, so Google has little reason to discover or prioritise crawling it.

More content or more meta tags will not fix this. The on-page SEO is already good. The bottleneck is entirely off-page.

---

## Fix 1 — force indexing in Search Console 🔴 *(biggest single unlock, ~15 min)*

1. **Add a Domain property.** GSC → *Add property* → **Domain** → enter `monokromatik.com` → verify by adding the DNS **TXT** record it gives you, at your domain registrar. A *Domain* property covers `www` + apex + subdomains in one — better than a URL-prefix property.
2. **Grant the reporting service account.** GSC → *Settings → Users and permissions → Add user* → paste the service-account email from the `GA4_SERVICE_ACCOUNT_JSON` secret (same account used for GA4) → role **Full** or **Restricted**. This is what lets `npm run search:insights` read GSC automatically.
3. **Point the repo at the domain property.** Set the GitHub **variable** `GSC_SITE_URL` = `sc-domain:monokromatik.com` (repo → *Settings → Secrets and variables → Actions → Variables*). ⚠️ Do this **only after** step 1 verifies, or the reporting queries an unverified property and errors. *(Claude can flip this variable for you the moment the domain property is verified.)*
4. **Submit the sitemap.** GSC → *Sitemaps* → enter `sitemap.xml` → **Submit**.
5. **Request indexing on the cornerstones.** GSC → *URL Inspection* → paste each URL below → **Request indexing**. Manual requests are capped at ~10–20/day, so do the Day-1 set first.

## Fix 2 — make apex→www a permanent (308) redirect 🔴 *(Vercel dashboard, 2 clicks)*

`monokromatik.com` currently returns a **307 (temporary)** redirect to `www`. It should be **308 (permanent)** so Google cleanly consolidates all signals onto the `www` canonical. This is **not in our code** — it's a Vercel edge redirect, so it's a dashboard toggle:

- Vercel → the project → *Settings → Domains* → `monokromatik.com` → its redirect to `www.monokromatik.com` → set the status to **Permanent (308)**.

*(A `next.config` rule can't fix this — Vercel's edge redirect runs before Next.js, so a code rule would be a no-op for apex requests.)*

## Fix 3 — build the first backlinks *(the durable unlock — strategy)*

Zero inbound links is why Google deprioritises the crawl. Even 5–10 quality links change that. This is where the Index wedge doubles as SEO:

- **Index badges embedded on brand sites** = backlinks *and* distribution (the point of the badge product).
- Sibu's LinkedIn posts linking articles; the LinkedIn Page; relevant directories/aggregators; being cited by the outlets we already source.

---

## Cornerstone URLs to "Request indexing" *(priority order; refreshed 2026-11 for the ownership wedge)*

GSC's manual "Request indexing" is capped at ~10–20 URLs/day, so this is split into
daily tranches. Cornerstones are the hubs + highest-demand heads — the long-tail
`who-owns-*` articles index via the sitemap + hub internal links once the hubs earn
authority. Per-brand Index pages (`/intelligence/signal-index/<brand>`) are strong
secondary targets; pull exact slugs from `/sitemap.xml` before submitting them.

**Day 1 — the ownership-wedge hubs + homepage + the Index** *(newest, highest-intent heads; they pass authority to the whole `who-owns-*` cluster):*
1. `https://www.monokromatik.com/`
2. `https://www.monokromatik.com/who-owns-africa`
3. `https://www.monokromatik.com/whos-buying-africa`
4. `https://www.monokromatik.com/who-owns`
5. `https://www.monokromatik.com/ownership-100`
6. `https://www.monokromatik.com/intelligence/ownership`
7. `https://www.monokromatik.com/coil-economy`
8. `https://www.monokromatik.com/intelligence/signal-index`
9. `https://www.monokromatik.com/breaking`
10. `https://www.monokromatik.com/the-drop`
11. `https://www.monokromatik.com/archive`
12. `https://www.monokromatik.com/reports`

**Day 2 — highest-volume cluster articles** *(exact "who owns [big brand]" head terms — the queries with real search demand):*
13. `https://www.monokromatik.com/article/who-owns-mtn`
14. `https://www.monokromatik.com/article/who-owns-dangote`
15. `https://www.monokromatik.com/article/who-owns-capitec`
16. `https://www.monokromatik.com/article/who-owns-takealot`
17. `https://www.monokromatik.com/article/who-owns-shoprite`
18. `https://www.monokromatik.com/article/who-owns-multichoice-dstv`
19. `https://www.monokromatik.com/article/who-owns-nandos`
20. `https://www.monokromatik.com/article/who-captures-amapiano`
21. `https://www.monokromatik.com/article/who-owns-black-beauty`
22. `https://www.monokromatik.com/article/who-owns-africas-banks`
23. `https://www.monokromatik.com/article/who-owns-africas-telecoms`
24. `https://www.monokromatik.com/article/who-owns-safaricom`

**Day 3 — sections + flagship reports + commercial funnel:**
25. `https://www.monokromatik.com/culture`
26. `https://www.monokromatik.com/spirits`
27. `https://www.monokromatik.com/roots`
28. `https://www.monokromatik.com/arena`
29. `https://www.monokromatik.com/waves`
30. `https://www.monokromatik.com/reports/african-spirits-report-2026-who-owns-the-pour`
31. `https://www.monokromatik.com/reports/african-startup-funding-concentration-2026`
32. `https://www.monokromatik.com/reports/cannes-lions-2026-the-africa-value-ledger`
33. `https://www.monokromatik.com/pricing`
34. `https://www.monokromatik.com/membership`

## What to expect

After submission + request-indexing, cornerstone pages typically appear in Google within days; broader indexing of the full 329-URL sitemap follows over weeks as the first backlinks build authority. Re-run `npm run search:insights` (or the `search-insights` workflow) after ~1–2 weeks — impressions starting to register is the signal it's working.

## Side note — missing category landing pages

`/music`, `/sports`, `/fashion`, `/business` return 404 — the site's IA uses sub-brand section names (`/culture`, `/spirits`, `/roots`, `/arena`, `/waves`) rather than content categories. Worth considering keyword-targeted category hubs later (a `/music` hub listing every music piece is a natural ranking target for "African music" queries) — but that's a build decision, not an indexing blocker.
