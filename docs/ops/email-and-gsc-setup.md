# Turn on operator email (Resend) + wire Google Search Console

*Almost everything is pre-wired. What's left is the bits only you can do: one API key, and clicking "verify" in Google. ~10 minutes total.*

---

## A · Operator email (Resend) — powers your **daily brief** + **breaking alerts** by inbox

**What it does:** the daily analytics brief (GA4 insights) and real-time breaking-news alerts already RUN — they just have nowhere to send. Adding the key makes them land in your inbox.

**Already set for you (repo variables — no action needed):**
- `DAILY_BRIEF_TO` = `sshangasi@gmail.com`
- `EIC_DIGEST_TO` = `sshangasi@gmail.com`
- `EIC_DIGEST_FROM` = `MonoKromatik <onboarding@resend.dev>` *(Resend's instant sender — works with zero DNS)*
- `breaking-news.yml` normalised to read these from variables (matches `daily-brief.yml`).

**What you do (the one missing piece — an API key):**
1. Go to **resend.com** → sign up **with `sshangasi@gmail.com`** *(important: in the free/no-domain mode Resend only delivers to the address you signed up with — which is exactly where these alerts go, so it works immediately).*
2. **API Keys → Create API Key** → copy the `re_…` value.
3. Set it as a GitHub **secret** (never paste it into chat):
   - GitHub → repo → **Settings → Secrets and variables → Actions → New repository secret**
   - Name: `RESEND_API_KEY` · Value: the `re_…` key
   - *(or run `gh secret set RESEND_API_KEY` and paste at the prompt)*
4. **Test it now:** GitHub → **Actions → "Operator's Daily Brief" → Run workflow**. Within a minute the brief should hit your inbox (from `onboarding@resend.dev`).

**Later upgrade (optional — branded from-address + emailing non-you recipients):**
- In Resend, **verify the `monokromatik.com` domain** (add the DNS records Resend shows — SPF/DKIM).
- Then change the `EIC_DIGEST_FROM` variable to e.g. `MonoKromatik <radar@monokromatik.com>`.
- Only needed if you want a branded sender or to send to inboxes other than your own.

---

## B · Google Search Console — get properly indexed + feed search data into the brief

### B1 · Verify + submit the sitemap *(gets you indexed and gives you Search UI data)*
1. **search.google.com/search-console** → **Add property** → **URL prefix** → `https://www.monokromatik.com/`
2. **Verify:** choose the **"HTML tag"** method. The tag is **already live on the site** (token `V25p3DOYTN6…` in `app/layout.tsx`), so it should verify **instantly**. *(If Google nudges you to a different method, a **DNS TXT** record also works.)*
3. **Sitemaps** (left nav) → enter `sitemap.xml` → **Submit**. *(`robots.txt` already points crawlers to it.)*

That alone starts the indexing + gives you the "which queries show us / where we rank" dashboard — the data we've been flying blind without.

### B2 · Feed Search data into the daily brief (API) — reuses your existing GA4 service account
The code (`lib/search-console.ts`) is already written and `GSC_SITE_URL` is already set as a variable. It just needs the service account to have access:
1. **Find the service account email:** it's the `client_email` field inside your `GA4_SERVICE_ACCOUNT_JSON` secret — looks like `something@your-project.iam.gserviceaccount.com`.
2. In **GSC → Settings → Users and permissions → Add user** → paste that email → role **Restricted** → Add.
3. Make sure the **"Google Search Console API"** is enabled for that project: **console.cloud.google.com → APIs & Services → Library → search "Search Console API" → Enable**.

Once that's done, the next **Daily Brief** stops saying *"GSC loop not returning data yet"* and starts surfacing near-miss ranking opportunities (queries where you're on page 2 and a nudge lands page 1).

---

## Summary — what's pre-done vs. what's left for you
| Piece | Status |
|---|---|
| Recipient/from variables, workflow wiring | ✅ done (this change) |
| `RESEND_API_KEY` secret | ⬜ **you** (Resend account → key → GH secret) |
| GSC verification tag in site | ✅ already live |
| Sitemap in robots.txt | ✅ already live |
| Add GSC property + submit sitemap | ⬜ **you** (~2 min, verifies instantly) |
| `GSC_SITE_URL` variable | ✅ done |
| Grant service account GSC access + enable API | ⬜ **you** (for the brief's search data) |

The only true blocker to email is the single `RESEND_API_KEY`. Everything else is a click.
