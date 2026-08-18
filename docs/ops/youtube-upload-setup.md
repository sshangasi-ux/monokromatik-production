# YouTube upload — one-time setup + how to publish an article video

The video pipeline (Higgsfield + Remotion, see [[video-pipeline]] / `video/`) renders a finished MP4 per article. This wires the **last mile**: uploading that MP4 to the MonoKromatik YouTube channel via the YouTube Data API, with title/description/tags/citations pulled from the article, then looping the resulting URL back into the article's `videoUrl` so the article embeds its own video.

Uploading needs a one-time Google OAuth (like the LinkedIn token). Videos are large and local, so the uploader runs **locally**, not in CI.

## ⚡ One-time OAuth setup (~15 min)

1. **console.cloud.google.com → create/select a project** (e.g. "MonoKromatik").
2. **APIs & Services → Library → enable "YouTube Data API v3".**
3. **OAuth consent screen** → External → add your Google account (the channel owner) as a **Test user** (keeps it in testing mode, no verification needed for your own uploads). Scope needed: `https://www.googleapis.com/auth/youtube.upload`.
4. **Credentials → Create credentials → OAuth client ID → Desktop app.** Copy the **Client ID** and **Client secret**.
5. **Get a refresh token** (one-time): run `node build/youtube-auth.mjs` from `video/` — it opens a consent URL, you approve as the channel owner, paste the code back, and it prints a **refresh token**. (Do this on a machine with a browser.)
6. **Export the three secrets** (a local `.env` in `video/`, or your shell) — never commit them:
   ```
   YT_CLIENT_ID=...
   YT_CLIENT_SECRET=...
   YT_REFRESH_TOKEN=...
   ```
7. `cd video && npm i googleapis` (one-time dep for the uploader).

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
