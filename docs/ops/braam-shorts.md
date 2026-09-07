# Braam Shorts — weekly vertical explainer engine

Turns a flagship article into a ~20–40s vertical, Braam-voiced YouTube Short.
Reach lever: Shorts get pushed to non-subscribers and feed the Partner-Programme
threshold. Each Short's description links back to its article (funnel).

## The pieces
- **Voice:** the cloned Braam element `43ab15f2-0fc2-40ad-a11f-8cc5b59f690d`
  (seed_audio, `speech_rate: 15`) — NOT the rejected "Bram" preset.
- **Template clips:** `video/public/hf-template/*.mp4` — committed, generic
  Editorial-Motion-Graphics collages reused across Shorts (a consistent series
  look; VO + overlays make each one specific). No per-Short video generation, so
  runs are cheap and never hit the seedance rate limit.
- **Assembler:** `video/build/make-braam-short.mjs` — deterministic. Given a slug,
  scene ids, and the VO wavs, it writes the scene/overlay + manifest JSON, maps
  each scene to a template clip (pull → quote clip), measures VO durations, and
  renders the vertical `HiggsfieldExplainer` composition.
- **Picker:** `video/build/weekly-flagship.mjs` — the week's video-ready feature
  (recent, with sources + a numbers module).
- **Uploader:** `video/build/youtube-upload.mjs --title "…"` — public, #Shorts.

## The weekly run (what the scheduled agent does)
1. `cd video && set -a; . ./.env; set +a`
2. `node build/weekly-flagship.mjs 14` → pick the lead slug (or an explicit one).
3. `node build/scene-data-from-article.mjs <slug>` → scene data (VO + overlays).
4. Choose 3 scenes: 2 punchy stats + the `pull` scene. Write clean, speech-ready
   VO for each (spell out symbols: "$282m" → "around 282 million dollars").
5. Generate each line with the Higgsfield MCP (`generate_audio`, seed_audio,
   voice_type `element`, the Braam id, speech_rate 15). Pace to avoid 429.
6. Download the wavs to `video/public/hf/` (e.g. `s1.wav,s2.wav,s3.wav`).
7. `node build/make-braam-short.mjs --slug <slug> --scenes <a,b,c> --vo hf/s1.wav,hf/s2.wav,hf/s3.wav --out <slug>-short`
8. `node build/youtube-upload.mjs --file out/<slug>-short.mp4 --slug <slug> --privacy public --title "<punchy hook> #Shorts"`
9. Post the link. Cadence: 1–2 per week; don't repeat a slug already shorted.

Everything else (the long-form video, the article) is already wired; a Short is a
YouTube-native discovery asset and is not embedded on the site.
