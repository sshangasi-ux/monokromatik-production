# CLAUDE HANDOFF — MonoKromatik Network

**Written:** 18 June 2026 · **For:** the next Claude session (Claude Code, desktop)
**Author of this doc:** prior Claude session (chat, with Mac/Vercel tool access)

Read this top-to-bottom before taking any action. It is the warm-start for everything we've been working on. Live state always beats this doc if they ever disagree — verify, don't assume.

---

## 1. WHO / WHAT

- **Project:** MonoKromatik Network — AI-powered African culture, sports & entertainment publication for African + diaspora audiences. Solo operator.
- **Operator:** Sibu Shangase (Johannesburg). Zero-budget model. AI-agent newsroom with a human-in-the-loop merge step.
- **Live site:** https://www.monokromatik.com
- **Local repo (this Mac):** `/Users/sibushangase/Downloads/monokromatik-production 2`  ← note the trailing " 2" with a space; quote the path in shell.
- **GitHub:** `sshangasi-ux/monokromatik-production` (public, HTTPS remote)
- **Vercel project:** `monokromatik-network` · id `prj_JsbPRDl8mq7c40cHMurMIqyH4mWR` · team `team_D61yfhX8pjxtBVIrtnuT9Aat`
- **Stack:** Next.js (App Router, turbopack, strict TS), deployed on Vercel. Domain on a Plesk/1-Grid server but Vercel serves the app.

---

## 2. HARD RULES (do not violate)

1. **Never push directly to `main`.** Sibu pushes via GitHub Desktop / clicks Merge. You prepare branches + PRs.
2. **Claude never triggers production deploys or scheduled agent runs**, and never handles credentials/tokens in chat.
3. **ALWAYS run the build gate before any commit:** `npx tsc --noEmit` then `npm run build`. Turbopack strict-TS once froze deploys for days while git looked healthy. No exceptions.
4. **Read-only by default.** Propose, show diffs, get sign-off, then act.
5. **Believe live state over history.** Re-verify SHAs, deploy status, file contents before acting.
6. Branch protection ruleset `main` (id `17816487`) is Active: Restrict deletions, Require PR before merging (0 approvals — correct for solo), Require status check `build`, Block force pushes. CI gate lives in `.github/workflows/ci.yml`.

---

## 3. WHERE THINGS STAND (as of this handoff)

- **`main` is at commit `213cec7`** — "Merge pull request #22 from sshangasi-ux/content/merge-7-articles".
- **Production deploy `dpl_CbLBbfEhtPrW2uETjnwMX8GwJCov` is READY** on `213cec7`.
- **Article catalogue: 36 articles live in production** (was 29; +7 shipped this session). Verified live: Rema article returns HTTP 200 fully rendered (local webp, BellaNaija credit, YouTube embed, JSON-LD, GA4 G-9F5R5FM8NS, READ NEXT cross-links).
- The 7 new articles shipped **culture-only (brandRead = N)**. That's the top of the backlog.

### The 7 new article slugs (all brandRead = N)
```
tony-elumelu-takes-the-chair-at-seplat-energy-nigeria-wins-again
tyla-took-over-sofi-stadium-and-reminded-the-world-who-she-is
dr-congo-showed-up-to-the-world-cup-dripped-in-history
sarkodie-and-shatta-wale-just-made-ghana-whole-again
rema-just-owned-the-world-cup-stage-nigeria-was-watching
mr-eazi-temi-are-back-and-they-brought-all-the-real-ones
jackline-sirai-is-rewriting-golf-s-rules-one-nairobi-woman-at-a-time
```

---

## 4. PENDING BACKLOG (in recommended order)

### A. Brand-read backfill for the 7 new articles — NATURAL FIRST PICK
- Command: `npx tsx scripts/backfill-brand-reads.ts --only-missing`
- The script is the brand-read editor: LLM-driven, fail-closed, **hard-drops any read scoring < 8**. Needs API keys (in `.env.local`).
- Run it **deliberately and eyeball each attachment** before staging — don't fire-and-forget.
- `tsx` does NOT auto-load `.env.local` for some scripts in this repo (see audit-video.ts which hand-rolls a loader). If env vars come back `undefined`, that's the cause.
- Result goes through the normal flow: stage a branch → build gate → PR → Sibu merges.
- Note: 3 of the original 29 also lack brandRead, so culture-only is an accepted state, not a bug.

### B. PR #19 harvest (`claude/install-uiux-pro-max-skill-vpsahr`, OPEN, ~13 commits ahead)
- **Do NOT merge wholesale** — it's a grab-bag. Cherry-pick into clean, small PRs.
- Worth taking:
  - `7a700d4` — GA4 service-account decode fix (`lib/analyze-performance.ts`)
  - `eb8ba94` — nav active-state
  - `6211eb0` — Trending wire-up "On the Pulse" homepage section + honest recency ranking + error boundary (`app/error.tsx`) + a11y (Escape-to-close, role=dialog)
  - `3ab7e78` — Gemini image provider
  - `84c6b3f` — video backfill
- **DROP:** the Lighthouse CI job (`c26daee` made it non-blocking, but skip it entirely).

### C. Two BLOCKED articles (Group B — not among the 7)
- Serena/Mboko Queen's Club, and Veekee James. Both hotlink `bellanaija.com` with no local image.
- Need a `sourceMedia` rerun to localize images, then a 2nd merge pass.

### D. Intelligence build-out — BIGGEST strategic gap
- The Intelligence tier (Case Studies / Reports / Issues / Source Desk / Conversations) are **0-data shells**: `lib/case-studies.ts` and `data/case-studies.json` 404; `/intelligence/case-studies` is hardcoded JSX.
- 6-dimension case-study structure: **Context / Strategic Bet / Creative Move / Evidence / African Read / Lesson**.
- 4 World Cup case studies are the natural first content.
- Recommend a **staged, reviewable data-layer package** (build the lib + JSON + types, get Sibu's input on content) — NOT a live commit.

### E. Optional
- Enable "Require branches to be up to date before merging" on ruleset `main`.
- Confirm `YOUTUBE_API_KEY` in Vercel env + Actions secrets.
- Cosmetic: `metadataBase` warning.

---

## 5. REPO MAP (key files)

- `data/articles.json` — the catalogue (36 objects). Large; in chat we had to copy it out to analyze, but in Code you can read/grep it directly.
- `lib/articles.ts` — schema + accessors: `getAllArticles / getArticleBySlug / getLatestArticles / getArticlesByCategory / getReadingTime`.
  - Article fields: `slug, title, content, excerpt, category, tags, imageUrl?, imageCredit?, imageSourceUrl?, videoUrl?, videoType?, videoCredit?, videoSourceUrl?, sourceLink, sourceName, publishedAt, brandRead?`
  - `BrandRead`: `attribution, attributionRole?, take, pullQuote?, takeaways?, confidence?`
- `lib/strategist.ts`, `lib/brand-read-editor.ts` — agent pipeline brains.
- `scripts/` — `backfill-brand-reads.ts`, `run-agents.ts`, `run-pipeline.ts`, `audit-video.ts`, `backfill-media.ts`, `refresh-images.ts`, `refresh-voice.ts`, `send-pulse-digest.ts`, plus tests.
- `public/article-media/` — local webp images (49 files after this session's +7).
- `app/api/newsletter/route.ts` — newsletter (Kit/ConvertKit v4 w/ v3 fallback).
- `.github/workflows/ci.yml` — the build gate. `agents.yml` — daily content pipeline (cron 04:00 UTC + workflow_dispatch), stages review-gated PRs.
- `docs/` — operational docs incl. `AI_ORCHESTRATION_ARCHITECTURE.md`.
- Nav (live): SIGNAL · INTELLIGENCE · ISSUES · CONVERSATIONS · CULTURE · ABOUT + SOURCE DESK.

---

## 6. TOOLING NOTES FOR CLAUDE CODE

- You now have a **real terminal, real git, real npm/tsx** in the repo — none of the prior session's workarounds (osascript shell, Filesystem text-only writes, no-TTY git auth wall) are needed. Use them directly.
- **Build gate is mandatory before every commit** (rule #3). `export PATH` is not needed in Code the way it was under osascript, but if `npx`/`npm` aren't found, check node is on PATH.
- **What you LOSE vs the prior chat session:** the Vercel MCP tools (live-site fetch + deploy status) and the in-chat browser. To verify production after a merge, either ask Sibu to glance at the Vercel dashboard, or keep a Claude.ai chat tab open alongside Code for verification. `curl` to monokromatik.com may not be on Code's network allowlist — don't assume it works.
- **Never put API keys in chat.** They live in `.env.local` (already rotated once). `COMPOSIO_API_KEY` is there; Composio YouTube currently 0 connections.
- Rollback candidate if a deploy goes bad: prior production `734e17c` ("backfill brand reads across catalogue").

---

## 7. STRATEGIC SPINE (don't re-litigate — this is decided)

Culture-forward **HYBRID**: culture hooks pull the audience in, the **Intelligence** tier monetizes, and articles carry a **dual read** — the culture story + the "Brand Read" (the strategic/commercial decode). This is why the Intelligence build-out (backlog D) matters most long-term, and why brand-reads on culture pieces (backlog A) are the connective tissue.

Framework reference in project files: `MONOKROMATIK-DIARY-OF-CEO-STRATEGIC-FRAMEWORK.md` (Bartlett's 33 Laws applied — positioning, "create your own category," lean/zero-budget as a feature).

---

## 8. OTHER DEFERRED / POST-LAUNCH

- Phase 2 features: polls (Supabase), gallery lightbox, live scores, social feed.
- Post-launch ops: Ezoic monetization, ConvertKit newsletter embed, logo → `images/logo.png`, reserve `@monokromatik` on Instagram / Twitter-X / Facebook, Google Search Console (verification token `V25p3DOYTN6kChFRtlU0cL0V4vGdcUcfkKHfJuGJ1qY` already live), GA4 is live (`G-9F5R5FM8NS`).

---

*End of handoff. Start with backlog item A unless Sibu redirects.*
