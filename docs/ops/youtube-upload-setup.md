# YouTube upload — one-time setup + how to publish an article video

The video pipeline (Higgsfield + Remotion, see [[video-pipeline]] / `video/`) renders a finished MP4 per article. This wires the **last mile**: uploading that MP4 to the MonoKromatik YouTube channel via the YouTube Data API, with title/description/tags/citations pulled from the article, then looping the resulting URL back into the article's `videoUrl` so the article embeds its own video.

Uploading needs a one-time Google OAuth (like the LinkedIn token). Videos are large and local, so the uploader runs **locally**, not in CI.

## ⚡ One-time OAuth setup — exact click-path (~15 min)

Do this signed in as the **YouTube channel owner's** Google account.

**A. Project + API**
1. Go to **console.cloud.google.com**.
2. Top bar → **project dropdown** (left of the search box) → **New Project** → Name `MonoKromatik` → **Create** → select it once created.
3. Top search box → type **YouTube Data API v3** → open it → **Enable**.

**B. Consent screen** (☰ left nav → **APIs & Services → OAuth consent screen**; may open as "Google Auth Platform")
4. **Get started** → **App name** `MonoKromatik`, **User support email** = your email → Next.
5. **Audience** → **External** → Next → add your **contact email** → agree → **Create**.
6. Left nav → **Audience** → **Test users → + Add users** → add the channel owner's Google email → **Save**. (Leave Publishing status = **Testing** — correct for your own uploads.)

**C. OAuth client** (left nav → **Clients**, or **APIs & Services → Credentials**)
7. **+ Create client** (or **+ Create Credentials → OAuth client ID**).
8. **Application type: Desktop app** → Name `MonoKromatik uploader` → **Create**.
9. Copy the **Client ID** and **Client secret** from the dialog.

**D. Refresh token**
10. In `video/`:
    ```bash
    cd video
    npm i googleapis
    export YT_CLIENT_ID="<client id>"
    export YT_CLIENT_SECRET="<client secret>"
    node build/youtube-auth.mjs
    ```
11. Open the URL it prints → sign in as the channel owner → **"Google hasn't verified this app" → Continue** (it's your own testing app) → **Allow** the YouTube permission.
12. The terminal prints **`YT_REFRESH_TOKEN=...`**.

**E. Save the 3 secrets** in `video/.env` (never commit):
```
YT_CLIENT_ID=...
YT_CLIENT_SECRET=...
YT_REFRESH_TOKEN=...
```
Then tell me — I'll upload the EPL video and loop the URL into the article.

## Publish a video for an article

```bash
cd video
node build/youtube-upload.mjs \
  --file out/epl-higgsfield-h-web.mp4 \
  --slug premier-league-2026-27-brand-reset-who-owns-african-footballs-upside \
  --privacy unlisted        # start unlisted; flip to public when you're happy
```

It reads the article, sets:
- **Title** = the article title (trimmed to YouTube's 100-char limit).
- **Description** = the excerpt + "Full piece → <article URL>" + a **Sources:** list (the article's cited publishers — honours the standing cited-media rule even in the description).
- **Tags** = the article tags.
- **Category** = Sports (17) for sports pieces, else People & Blogs (22).

On success it prints the **watch URL** and can loop it back:

```bash
node build/youtube-upload.mjs --file ... --slug ... --privacy unlisted --set-video-url
```
`--set-video-url` writes `videoUrl` (+ `videoType: "embed"`, `videoCredit: "MonoKromatik"`) into that article's object in `data/articles.json`, so the article page embeds the video. Commit that change via a normal PR.

## Notes
- **Quota:** a YouTube upload costs ~1,600 units of the default 10,000/day quota — ~6 uploads/day. Fine for a rollout; batch over days if backfilling many.
- Start videos **unlisted**, review on the channel, then set public (`--privacy public` re-run updates, or flip in YouTube Studio).
- The refresh token is long-lived but can be revoked; if uploads start 401ing, redo step 5.

## Setting privacy programmatically (manage scope)

The original upload token only had `youtube.upload` + `youtube.readonly`, which can create videos but **cannot change an existing video's privacy** (`videos.update` → 403 "insufficient scopes"). Re-authed 24 Aug 2026 to add the broad **`youtube` (manage)** scope.

- **Re-auth (one-time, when the token lacks manage):** `video/build/youtube-reauth.mjs` runs a loopback OAuth catcher on `localhost:53682`, requests `youtube.upload` + `youtube` + `youtube.readonly`, and writes the new `YT_REFRESH_TOKEN` into `video/.env`. Launch it **detached** (`nohup node build/youtube-reauth.mjs &`) — the harness background runner gets torn down at session boundaries and the loopback dies before the redirect lands. Open the printed `AUTH_URL`, approve as the channel owner (accept the "unverified app" warning — it's your own client), done.
- **Set privacy:** `node build/yt-set-privacy.mjs --id <videoId> --privacy public|unlisted|private`. Reads current status, flips `privacyStatus`, preserves the other status fields.
- **Implementation note:** the re-auth + privacy scripts use **pure Node `https` built-ins**, not `googleapis`. That was a workaround for the old `~/Documents` (iCloud-synced) checkout where `googleapis` loaded pathologically slowly. On the current `~/dev/monokromatik-production` checkout `googleapis` loads in ~1s, so the newer tools below use it freely.

## Pipeline scripts (`video/build/`)

The full toolkit that turns an article into a published, cross-linked video. Run from `video/` with `set -a; . ./.env; set +a` first (loads YT creds).

| Script | What it does |
|---|---|
| `scene-data-from-article.mjs <slug>` | Generate scene data (title/stats/pull/sources + image prompts + VO) from a `data/articles.json` article → `build/generated/<slug>.scenes.json`. Hand-polish the 5 stat scenes (they share one generic prompt) before generating. |
| *(Higgsfield MCP)* | seedream frames → seedance clips (16:9, `start_image`) → seed_audio (Bram voice `549ff70a-…`). Download to `public/hf/hclipN.mp4` + `voN.wav`. |
| *(Remotion)* | `npx remotion render src/index.ts HiggsfieldExplainerH out/<slug>-h.mp4` (horizontal) / `HiggsfieldExplainer` (vertical). Reads `src/hf-manifest-h.json` / `hf-manifest.json` + `hf-scenes.json`. |
| `youtube-upload.mjs --file --slug [--privacy] [--set-video-url]` | Upload a finished MP4 with article-derived metadata; `--set-video-url` writes `videoUrl` into the article. |
| `yt-set-privacy.mjs --id --privacy` | Flip an existing video public/unlisted/private (needs the `youtube` manage scope). |
| `youtube-reauth.mjs` | Loopback OAuth to (re)issue a refresh token with the manage scope. |
| `make-short.sh <slug> <c1 c2 c7 a1 a2 a7>` | Cut a vertical Short (scenes 1/2/7 = hook → stat → thesis) from an explainer's Higgsfield clip/audio URLs, render it (`HiggsfieldExplainer`). |
| `upload-short.mjs --file --title --slug --tags` | Upload a vertical Short public with a Shorts description + article/site links. |
| `make-banner.mjs` | Render the 2560×1440 channel banner (SVG → PNG via `sharp`) → `build/banner.png`. |
| `channel-setup.mjs` | One-shot channel identity: About, keywords, country, trailer, enriched video metadata, and the series-playlist architecture. |
| `update-descriptions.mjs` | Rewrite the long-video + trailer descriptions with the funnel CTA stack (article → The Weekly Signal → Membership), UTM-tagged, preserving title/tags/category. |

Outputs (`out/`, `build/generated/`, `build/frames/`, `build/banner.png`, `public/hf/`) and `.env` are gitignored.

## Analytics read — GA4 + Search Console (`video/build/ga-*.mjs`)

Reuses the **same Google OAuth client** as the YouTube tooling (in the GCP project `gen-lang-client-0210831932`), so no new app is needed — just two read-only scopes.

- **Prereq:** enable **Google Analytics Data API** + **Search Console API** (and **Analytics Admin API** if you want property auto-discovery) in that GCP project.
- **`ga-auth.mjs`** — loopback OAuth (localhost:53682, same detached-`nohup` launch as `youtube-reauth.mjs`) requesting `analytics.readonly` + `webmasters.readonly`; writes `GA_REFRESH_TOKEN` into `video/.env`.
- **`ga-report.mjs [propertyId]`** — pulls a 28-day read: GA4 overview, top pages, sources (source/medium), UTM campaigns, countries + GSC total clicks/impressions/CTR, top queries and top pages. Pass the numeric GA4 **Property ID** (from GA4 → Admin → Property details) as the arg, or set `GA_PROPERTY_ID`, if the Admin API isn't enabled. Current property: `534321100`.
