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
