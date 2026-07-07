# Analytics & Integrations — operator setup checklist

*The fixes surfaced by the 7 Jul backend review. Each is a short config task in an external console. Grouped by priority. Names in `code` are the exact GitHub Actions secret/variable or console field.*

---

## 1. Google Analytics 4 — clean the data (5 min)
**Problem:** ~22% of traffic is attributed to `vercel.com` — that's deploy/preview/bot referral noise, not real visitors. It inflates every number.

**Fix — add referral exclusions + an internal filter:**
1. GA4 → **Admin → Data streams →** your web stream → **Configure tag settings → Show all → List unwanted referrals.**
2. Add referral domains to exclude: `vercel.com`, `vercel.app`, `monokromatik-network*.vercel.app`.
3. Admin → **Data filters →** create an **Internal Traffic** filter (define your own IP under *Data streams → Configure tag settings → Define internal traffic*), set the filter to **Active** (it defaults to Testing).
4. Optional: a **Developer Traffic** exclusion if you browse the site while building.

**Result:** the daily brief's source mix + engagement numbers become trustworthy.

## 2. Google Cloud + Search Console — turn on the SEO loop (10 min)
**Problem:** GSC returns only ~5 queries and **0 page-2 opportunities** — the SEO near-miss loop is effectively blind. Two causes: the site has almost no organic footprint yet, *and* Search Console isn't fully wired.

**Fix:**
1. **Google Cloud Console** (the project that owns the `GA4_SERVICE_ACCOUNT_JSON` service account) → **APIs & Services → Library →** enable **Google Search Console API** (and confirm **Google Analytics Data API** is enabled).
2. **Search Console** (search.google.com/search-console) → verify the `https://www.monokromatik.com` property if not already → **Settings → Users and permissions → Add user →** paste the **service-account email** (from the JSON's `client_email`), role **Full** or **Restricted**.
3. **GitHub → repo → Settings → Secrets and variables → Actions → Variables →** set `GSC_SITE_URL` = `https://www.monokromatik.com` (or the `sc-domain:` form if you verified a domain property).
4. Re-run the **Search Insights** workflow — page-2 near-misses will start surfacing once the site ranks for anything.

> The deeper truth: only ~5 queries means SEO is the growth gap, not just config. This wiring makes the loop *work*; distribution (LinkedIn, citations) + depth builds the footprint it reports on.

## 3. Resend — deliver the operator emails (2 min)
**Problem:** `RESEND_API_KEY` is not set, so the **daily brief + digests are never emailed** (they only commit to the `daily-briefs` branch + the run summary).

**Fix:** GitHub → repo → **Settings → Secrets and variables → Actions → Secrets →** add `RESEND_API_KEY` (from resend.com). Optionally set repo **variables** `DAILY_BRIEF_TO` (e.g. `editor@monokromatik.com`) and `EIC_DIGEST_FROM` (a verified Resend sender). Next run lands in your inbox.

## 4. LinkedIn auto-poster — token (the code is already built)
**The Page** is a manual 5-min task (see the fill-in kit). To light up the existing daily auto-post (`linkedin-publish.ts`):
1. **developer.linkedin.com → Create app**, associate it with the new MonoKromatik Page.
2. Request **Community Management API** access (product) — grants `w_organization_social`. (LinkedIn reviews org-posting apps; approval can take a few days.)
3. Generate a **3-legged OAuth access token** with `w_organization_social` scope → this is `LINKEDIN_ACCESS_TOKEN`.
4. Get the Page's **organization URN**: `https://api.linkedin.com/v2/organizationAcls?q=roleAssignee` → the `organization` field, form `urn:li:organization:XXXXXXX` → this is `LINKEDIN_AUTHOR_URN`.
5. Add both as GH **secrets**, set repo **variable** `LINKEDIN_AUTOPOST=on`. The 15:07 UTC cron then posts the branded cards.

## Missing-secrets summary (what's blocking what)
| Secret / var | Unblocks | Owner |
|---|---|---|
| `RESEND_API_KEY` | daily brief + digest **emails** | operator |
| Anthropic credit top-up | Breaking Radar, agents, engine, flagship, case-study cycle (all AI) | operator |
| `GSC_SITE_URL` + Search Console API | the **SEO near-miss loop** | operator |
| GA4 referral/internal filters | **clean analytics** | operator |
| `LINKEDIN_ACCESS_TOKEN` + `LINKEDIN_AUTHOR_URN` + `LINKEDIN_AUTOPOST` | LinkedIn **auto-posting** | operator |
| `IG_ACCESS_TOKEN` + `IG_USER_ID` | Instagram **auto-posting** | operator |

Everything else (Paystack, Supabase, GA4 collection, Kit, Pexels, YouTube) is live.
