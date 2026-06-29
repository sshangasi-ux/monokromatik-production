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

## LinkedIn (built — needs credentials)

Posts the next unposted item to a LinkedIn **Page** via the versioned Posts API,
using the same branded card + caption (with the link in the post text).

**Secrets to set:** `LINKEDIN_ACCESS_TOKEN`, `LINKEDIN_AUTHOR_URN`
**Optional repo variables:** `LINKEDIN_AUTOPOST=on` (daily auto-post), `LINKEDIN_VERSION` (API version override, default `202405`)

### Prerequisites
1. A **LinkedIn Page** (Company Page) you administer — posts go out as the Page.
2. A **LinkedIn Developer app** (<https://www.linkedin.com/developers/apps>) with your Page set as its associated organization, and the **Community Management API** product requested/approved (this grants the org posting scopes).

### Steps
1. **Request the scopes** on the app: `w_organization_social` + `r_organization_social` (Page posting). For posting as a *person* instead, use `w_member_social`.
2. **Generate an OAuth access token** with those scopes (the app's *Auth* tab → OAuth 2.0, or the token generator). Tokens are typically ~60 days — refresh before expiry. → `LINKEDIN_ACCESS_TOKEN`.
3. **Find your `LINKEDIN_AUTHOR_URN`:**
   - Page: `urn:li:organization:<ORG_ID>` — the numeric ID is in your Page's admin URL (`/company/<ORG_ID>/admin/`), or via `GET https://api.linkedin.com/rest/organizationAcls?q=roleAssignee` (header `LinkedIn-Version: 202405`).
   - Person: `urn:li:person:<ID>` from `GET https://api.linkedin.com/v2/me`.
4. **Set the two secrets** in GitHub Actions.
5. **Verify (no post):** Actions → *MonoKromatik Social Auto-Post (LinkedIn)* → **Run workflow** → check **verify** → Run. It validates the token and echoes the author it will post as.
6. **Send one real post:** Run workflow again with **publish = true**. Confirm it appears on the Page.
7. **Go fully automatic (optional):** add repo **variable** `LINKEDIN_AUTOPOST=on`. The daily 17:07 SAST run then posts automatically.

> Local testing: put the values in `.env.local` and run `npm run linkedin:verify` then `npm run linkedin:publish -- --dry`.

> Note: LinkedIn sunsets API versions periodically. If posts start failing with a version error, set the `LINKEDIN_VERSION` repo variable to a current `YYYYMM` value.
