# LinkedIn auto-poster — app, access request & token

*Everything to light up the built poster (`scripts/linkedin-publish.ts`). Two values go into GitHub secrets at the end: `LINKEDIN_ACCESS_TOKEN` (you generate) and `LINKEDIN_AUTHOR_URN` (already known below).*

## Your org URN (done)
Your Page is **MonoKromatik**, company ID **135095870** (from the admin URL). So:
```
LINKEDIN_AUTHOR_URN = urn:li:organization:135095870
```
*(Double-check once you have a token: GET `https://api.linkedin.com/v2/organizationAcls?q=roleAssignee` → the `organization` field.)*

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
> MonoKromatik operates a company Page (MonoKromatik, urn:li:organization:135095870) for our brand-intelligence publication. We will use the Posts and Images APIs to programmatically publish our own original editorial content — branded cards linking to articles and reports on monokromatik.com — to our own Page, on a scheduled basis. We are the Page owner and admin; posts are first-party content only. No third-party data, no messaging, no reading of member data — publishing our own posts to our own Page.

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
- **Variable** `LINKEDIN_AUTHOR_URN` = `urn:li:organization:135095870`
- **Variable** `LINKEDIN_AUTOPOST` = `on`  *(off/absent = review-mode: it previews the post in the run summary but doesn't publish)*
- *(Optional)* **Variable** `LINKEDIN_VERSION` = `202405` (only if you ever need a different API version)

## Step 6 — Test it
1. GitHub → **Actions → "MonoKromatik Social Auto-Post (LinkedIn)" → Run workflow** with **publish = false** (dry run) → check the run summary shows the card + caption it *would* post.
2. Happy? Run again with **publish = true** (or leave `LINKEDIN_AUTOPOST=on` and let the **daily 15:07 UTC** cron do it). First real post appears on the Page.

---

### Summary
| Value | Where it comes from | Goes to |
|---|---|---|
| `LINKEDIN_AUTHOR_URN` | **`urn:li:organization:135095870`** (known) | GH variable |
| `LINKEDIN_ACCESS_TOKEN` | You generate (Step 3) — a secret; never share it in chat/commit | GH secret |
| `LINKEDIN_AUTOPOST` | `on` | GH variable |

Once these are in, the poster runs itself daily, publishing your branded cards to the Page — a free, automated distribution channel.
