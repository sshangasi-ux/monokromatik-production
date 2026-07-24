# LinkedIn auto-poster — app, access request & token

*Everything to light up the built poster (`scripts/linkedin-publish.ts`). Two values go into GitHub secrets at the end: `LINKEDIN_ACCESS_TOKEN` (you generate) and `LINKEDIN_AUTHOR_URN` (already known below).*

## Your org URN
> ⚠️ **Two Pages spotted.** Screenshots showed two company IDs — `135245970` and `135245970` — both "MonoKromatik", 0 followers. That's almost certainly a **duplicate Page**. Keep ONE (deactivate the other via *Settings → Deactivate page*), then use its ID.

Your org URN is `urn:li:organization:<companyID>`, where `<companyID>` is the number in the kept Page's admin URL (`linkedin.com/company/<companyID>/`). If you keep the current one:
```
LINKEDIN_AUTHOR_URN = urn:li:organization:135245970
```
**Definitive check** (removes all doubt, whichever Page): once you have a token, run
`curl -s -H "Authorization: Bearer TOKEN" "https://api.linkedin.com/v2/organizationAcls?q=roleAssignee"` → the `organization` field is your exact URN.

## What the code needs (so the app matches)
- **Product:** Community Management API (grants the versioned Posts + Images APIs and org posting)
- **Scope:** `w_organization_social` (post as the org) — plus `r_organization_social` is fine to include
- **API version header:** `202405` (the code's default; set `LINKEDIN_VERSION` only to change it)

---

## Step 1 — Create the Developer app (~3 min)
1. Go to **developer.linkedin.com** → **My apps** → **Create app**.
2. App name: `MonoKromatik Auto-Poster`. **LinkedIn Page:** select **MonoKromatik** (this associates the app with your Page — required for org posting). Upload the logo, tick the legal box, **Create app**.
3. **Settings** tab → **Verify** the app for the Page (click *Verify*, approve from the Page — you're admin, so it's instant).

## Step 2 — Request product access (the "app-access request")
On the app's **Products** tab, request:
- **Share on LinkedIn** (usually auto-granted) — gives member-level posting.
- **Community Management API** — gives **org** posting (`w_organization_social`). This one shows a short application form. Paste this justification:

> **How will you use the Community Management API?**
> MonoKromatik operates a company Page (MonoKromatik, urn:li:organization:135245970) for our brand-intelligence publication. We will use the Posts and Images APIs to programmatically publish our own original editorial content — branded cards linking to articles and reports on monokromatik.com — to our own Page, on a scheduled basis. We are the Page owner and admin; posts are first-party content only. No third-party data, no messaging, no reading of member data — publishing our own posts to our own Page.

*(LinkedIn may approve instantly for a verified Page-associated app, or review over a few days. If Community Management isn't available to you, "Share on LinkedIn" + `w_member_social` posts to your personal profile as a fallback — but the auto-poster targets the Page, so aim for Community Management.)*

## Step 3 — Generate the access token
Easiest path (no code): the portal's built-in generator.
1. App → **Auth** tab → under **OAuth 2.0 tools**, click **Create token** (a.k.a. the token generator).
2. **Select scopes:** tick `w_organization_social` (and `r_organization_social`, `w_member_social` if shown).
3. Click through the LinkedIn consent screen → it returns an **access token**. Copy it. *(This is `LINKEDIN_ACCESS_TOKEN`.)*

> **Token lifetime:** LinkedIn access tokens last ~**60 days**. Note a calendar reminder to regenerate, or later wire the refresh token. If posts suddenly stop, the token expired — regenerate via Step 3 and re-paste.

## Step 4 — Verify the token works
Paste it into a terminal (replace `TOKEN`):
```
curl -s -H "Authorization: Bearer TOKEN" -H "X-Restli-Protocol-Version: 2.0.0" https://api.linkedin.com/v2/me
```
A JSON body with your member id = the token is valid.

## Step 5 — Set the GitHub secrets/vars
GitHub → repo → **Settings → Secrets and variables → Actions**:
- **Secret** `LINKEDIN_ACCESS_TOKEN` = the token from Step 3
- **Variable** `LINKEDIN_AUTHOR_URN` = `urn:li:organization:135245970`
- **Variable** `LINKEDIN_AUTOPOST` = `on`  *(off/absent = review-mode: it previews the post in the run summary but doesn't publish)*
- *(Optional)* **Variable** `LINKEDIN_VERSION` = `202405` (only if you ever need a different API version)

## Step 6 — Test it
1. GitHub → **Actions → "MonoKromatik Social Auto-Post (LinkedIn)" → Run workflow** with **publish = false** (dry run) → check the run summary shows the card + caption it *would* post.
2. Happy? Run again with **publish = true** (or leave `LINKEDIN_AUTOPOST=on` and let the **daily 15:07 UTC** cron do it). First real post appears on the Page.

---

### Summary
| Value | Where it comes from | Goes to |
|---|---|---|
| `LINKEDIN_AUTHOR_URN` | **`urn:li:organization:135245970`** (known) | GH variable |
| `LINKEDIN_ACCESS_TOKEN` | You generate (Step 3) — a secret; never share it in chat/commit | GH secret |
| `LINKEDIN_AUTOPOST` | `on` | GH variable |

Once these are in, the poster runs itself daily, publishing your branded cards to the Page — a free, automated distribution channel.

---

## Known issue — the link comment 403s (fix: re-auth the token with the comment scope)

*Logged 24 Jul 2026, on the first live post (the World Cup arrival-fashion piece, `urn:li:share:7486425489662824448`).*

**Symptom.** The post body publishes fine, but the run log ends with:

```
Published to LinkedIn (urn:li:share:…).
⚠️ First comment failed: comment failed (403): "Not enough permissions to access: partnerApiSocialActions.CREATE.20260601"
```

**Why it matters.** By design the article link rides in the **first comment**, not the post body — LinkedIn throttles the reach of posts that carry an outbound link inline (see `scripts/linkedin-publish.ts`). So when the comment call fails, the post goes up with **no clickable path to the article**, and the link has to be added to the post by hand every time.

**Cause.** The current `LINKEDIN_ACCESS_TOKEN` can *post* but was not granted the **social-actions write** entitlement, so the `socialActions.CREATE` (comment) call is rejected. This is a token/product scope gap, not a code bug — the body post and the comment use the same token but different permissions.

**The fix — regenerate the token with the comment scope:**
1. **developer.linkedin.com → your app → Products.** Confirm **Community Management API** is *approved* (not merely requested). The comment (`socialActions`) permission comes with it; "Share on LinkedIn" alone does **not** grant it.
2. **Auth tab → Create token.** Tick **every** Community Management scope offered — at minimum `w_organization_social` **and** the social-actions / comment scope if it is listed separately. Do not tick only the posting scope.
3. Click through consent, copy the new token.
4. **Verify it can comment** before trusting it (replace `TOKEN`; the org URN is `urn:li:organization:135245970`):
   ```
   curl -s -X POST "https://api.linkedin.com/v2/socialActions/urn:li:share:7486425489662824448/comments" \
     -H "Authorization: Bearer TOKEN" -H "X-Restli-Protocol-Version: 2.0.0" \
     -H "Content-Type: application/json" \
     -d '{"actor":"urn:li:organization:135245970","message":{"text":"test"}}'
   ```
   A `201`/created (not a `403`) = the scope is now present. Delete the test comment.
5. **GitHub → Settings → Secrets and variables → Actions →** update the `LINKEDIN_ACCESS_TOKEN` secret with the new token.
6. Re-run the workflow with `publish=false` on a fresh item to confirm, then `publish=true`.

**Note on API version.** The failing run used `LINKEDIN_VERSION=202606` (the error names `…20260601`). The setup steps above default to `202405`; either works for the body post, but keep the version consistent between the post and comment calls — the poster already does.

**Interim workaround** (until the token is re-authed): after each auto-post, open the post and add the first comment by hand — `Full piece → https://www.monokromatik.com/article/<slug>` — which is exactly what the workflow intends to post.
