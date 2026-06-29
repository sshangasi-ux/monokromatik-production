# Social auto-posting — operator setup

The code is done. What's left is credentials, which only you can create. Each
network needs its secrets set in **GitHub → Settings → Secrets and variables →
Actions**. Nothing publishes until they're set; until then every run is a safe
preview.

---

## Instagram (built — needs credentials)

Posts the next unposted Wire break / article to Instagram via the Meta Graph
API, using the public branded card (`/api/social-card`) + an AI caption.

**Secrets to set:** `IG_USER_ID`, `IG_ACCESS_TOKEN`
**Optional repo variable:** `SOCIAL_AUTOPOST=on` (daily auto-post; otherwise review-gated)

### Prerequisites
1. An **Instagram Business or Creator** account (convert in the IG app: Settings → Account type).
2. A **Facebook Page** linked to that IG account (IG app → Settings → Linked accounts, or via the Page's settings).

### Steps
1. **Create a Meta app** — <https://developers.facebook.com/apps> → *Create app* → type **Business**. Add the **Instagram Graph API** product (and **Facebook Login** for token generation).
2. **Generate a token with these scopes** — in the **Graph API Explorer** (<https://developers.facebook.com/tools/explorer>), select your app, *Generate Access Token*, and grant:
   - `instagram_basic`
   - `instagram_content_publish`
   - `pages_show_list`
   - `pages_read_engagement`
   - `business_management`
3. **Make the token long-lived** — short tokens last ~1 hour. Exchange for a ~60-day token:
   ```
   GET https://graph.facebook.com/v21.0/oauth/access_token
       ?grant_type=fb_exchange_token
       &client_id=<APP_ID>&client_secret=<APP_SECRET>
       &fb_exchange_token=<SHORT_TOKEN>
   ```
   For a **non-expiring** token, create a **System User** in Meta Business Settings and generate its token instead. → this is `IG_ACCESS_TOKEN`.
4. **Find your `IG_USER_ID`** (the *Instagram* account id, not the Page id):
   ```
   GET https://graph.facebook.com/v21.0/me/accounts?access_token=<TOKEN>      # → your Page id
   GET https://graph.facebook.com/v21.0/<PAGE_ID>?fields=instagram_business_account&access_token=<TOKEN>
   ```
   The returned `instagram_business_account.id` is `IG_USER_ID`.
5. **Set the two secrets** in GitHub Actions (above).
6. **Verify (no post):** Actions → *MonoKromatik Social Auto-Post (Instagram)* → **Run workflow** → check **verify** → Run. It resolves your handle, follower/post counts, token longevity, and confirms the publish permission. Fix anything it flags.
7. **Send one real post:** Run workflow again with **publish = true**. Confirm it appears on the feed.
8. **Go fully automatic (optional):** add repo **variable** `SOCIAL_AUTOPOST=on`. The daily 16:37 SAST run then posts automatically. Leave it off to keep approving each post by hand.

> Local testing: put the two values in `.env.local` and run `npm run social:verify` then `npm run social:publish -- --dry`.

---

## LinkedIn

_Coming next — integration to be built, then this section will list its setup steps._
