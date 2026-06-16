# Claude Session Handoff — MonoKromatik

**Written:** 2026-06-16 (Sibu's local SAST)
**Purpose:** Onboarding document for the next Claude session so it can pick up the
MonoKromatik work without asking "where are we?" or making stale assumptions.
**Reason for the handoff:** Prior session became long and lost local-execution tools
mid-flight. Sibu is starting fresh with this document as the catch-up.

The new Claude should READ this document end-to-end before acting on anything,
then ask Sibu what to tackle next. **Do not start work proactively** — wait for direction.

---

## 1. Who & What

**Sibu Shangase** — solo operator of **MonoKromatik Network**, an African
culture/sports/entertainment publication. Tech: Next.js on Vercel,
Anthropic + OpenAI API agents, GitHub Actions for orchestration, Kit for
newsletter, Resend for operator notifications.

**Live site:** https://www.monokromatik.com (currently healthy, HTTP 200)
**Repo:** https://github.com/sshangasi-ux/monokromatik-production
**Local working copy:** `/Users/sibushangase/Downloads/monokromatik-production 2`
**Vercel project id:** `prj_JsbPRDl8mq7c40cHMurMIqyH4mWR`
**Vercel team id:** `team_D61yfhX8pjxtBVIrtnuT9Aat`

---

## 2. The Big Migration Story (May → June 2026)

The platform went through a fundamental architecture change between
late May and mid June. Understanding this sequence is critical so the
new Claude doesn't try to re-do or undo any of it.

### May 11 – May 20 — Original autonomous-publish era
- Daily GitHub Actions cron at 06:00 UTC ran the agent pipeline
  end-to-end (Scout → Curator → Writer → Stylist → Image Sourcer →
  EIC → Publisher) and committed/pushed directly to `main`.
- A second cron at the same time ran the same logic via a Vercel
  serverless route (`app/api/cron/run-pipeline/route.ts`).
- Articles shipped daily without human review. EIC was the only gate.

### May 17 — Sunday Pulse newsletter built
- `lib/pulse-digest.ts`, `scripts/send-pulse-digest.ts`,
  `.github/workflows/pulse-digest.yml`.
- Designed to fire Sunday 06:00 UTC and broadcast a digest of the
  week's articles via Kit.

### June 3 — Sibu directed a pause and re-architecture
- Operator instruction: **pause autonomous publishing**, design a new
  workflow co-built with OpenAI/ChatGPT where neither model can publish
  without an approval gate. Quote from Sibu:

  > "Immediately pause autonomous production publishing from the old
  > pipeline, preserve its discovery capability, and rebuild it into a
  > shared Claude + OpenAI editorial intelligence workflow where
  > neither model can publish without an approval gate."

- Target workflow shape:
  ```
  Approved source universe
          ↓
  Story / signal discovery
          ↓
  Research pack creation
          ↓
  Source and media verification
          ↓
  Draft development
          ↓
  Editorial review
          ↓
  Operator approval for premium/public release
          ↓
  Publishing
  ```

- Pause commit `4c64f90` then amended to single clean commit at
  `79e429b` — reduced `vercel.json` to `{}` and added
  `docs/MIGRATION-PAUSE.md`.
- Both GitHub Actions workflows (`agents.yml`, `pulse-digest.yml`)
  disabled via UI.
- All three pause points active by June 3 EOD.

### June 9 — Tooling reset
- `38f1476` Sibu installed the `ui-ux-pro-max` design intelligence
  skill and added the Magic Patterns MCP server. Setup for the v2 rebuild.

### June 10 — MonoKromatik 2.0 ships in one massive day
This is the day the entire publication architecture changed. Commits
landed in this rough order:

  - `318fc63` Design system foundation
  - `97728c0` Amber-link a11y sweep
  - `44f8ea7` Brand image primitive + motion system (duotone, MediaImage, framer-motion)
  - `62c3146` Fix homepage StoryCard collapse inside StaggerItem
  - `ac5f551` Wire design-system foundation into v2 components
  - `74f685c` **MonoKromatik 2.0 — design system + Living Magazine integration (go-live)**
  - `b3b2e18` Strip pre-launch preview/draft labels for live site
  - `a361a43` Brand data-viz kit + intelligence pages enriched
  - `2b8f3ed` **Fable 5 integrated as the pipeline brain**
  - `e3eba95` Credited media-sourcing layer (static + video) + dataviz rollout
  - `bf97d6f` Backfill script + stock motion video + dataviz on sub-pages
  - `d06e232` "Backfill Article Media" workflow (manual dispatch)
  - `5341aa8` Proxy hotlink-protected images
  - `88f327f` Persist media credits + video fields through EIC
  - `1eebe59` Self-host images instead of third-party proxy
  - `6a24299` `[Agent]` Backfill self-hosted credited media for existing articles
  - `d5814a6` **Activate review-gated daily orchestration (stage candidates as a PR)** ← THE NEW WORKFLOW
  - `0d6461a` Cast getAllArticles JSON import to `Article[]`
  - `a60790b` Stock-video sourcing robust + Pexels diagnostic
  - `949f722` YouTube Data API sourcing for relevant clips
  - `fb63b07` `[Agent]` Second media-backfill pass

### June 11 — Polish
- `cb175ac` Repair broken remote images (proxy safety net)
- `d49f4e7` Analytics instrumentation + reporting & monetization docs

### June 16 (today) — Steady state
- Pause is fully applied + fully superseded by the new architecture
- 29 articles live on origin/main (frozen since the pause; new content
  ships only via PR review now)
- All four GitHub workflows are `active`, but the daily agent run no
  longer publishes — it stages PRs instead.

---

## 3. Current Architecture (what's live now)

### The agent fleet has not been deleted — it's been rewired

The `/lib` discovery/drafting code is largely intact. What changed
is the **publish trigger**, not the agents themselves.

### Active GitHub Actions workflows

| Workflow | File | Schedule | What it does |
|---|---|---|---|
| MonoKromatik Daily Discovery and Review Run | `.github/workflows/agents.yml` | `0 4 * * *` (06:00 SAST) | Discovers, generates, media-enriches, EIC-reviews — then **opens a PR** with approved candidates. **No direct push to `main`.** |
| MonoKromatik Sunday Pulse | `.github/workflows/pulse-digest.yml` | `0 6 * * 0` (Sun 06:00 UTC) | Sends weekly Pulse digest to Kit subscribers |
| Backfill Article Media | `.github/workflows/backfill-media.yml` | manual dispatch only | One-shot media-backfill across articles |
| CI | `.github/workflows/ci.yml` | on push/PR | Build + type check |

The CRITICAL change: `agents.yml` now has `permissions: contents: write, pull-requests: write`. The workflow opens a PR. The PR must be merged by the operator (or an automation that represents the operator) before content reaches `main` → Vercel. **This is the approval gate** the new architecture required.

### Vercel cron — still paused

`vercel.json` is `{}` on origin. The cron route handler at
`app/api/cron/run-pipeline/route.ts` is still in the codebase but
unscheduled. It was never re-enabled because the GitHub Actions
review-gated path is now the single source of truth.

---

## 4. Critical Operational Docs (read these first)

These all live in `/docs` and were written between June 10 and 14:

| File | What it covers |
|---|---|
| `MONOKROMATIK_2_PRODUCT_BLUEPRINT.md` | The product Sibu is building. Read this first. |
| `MONOKROMATIK_EDITORIAL_VOICE.md` | The voice guide — what makes a MonoKromatik article. |
| `AI_ORCHESTRATION_ARCHITECTURE.md` | How Claude + OpenAI work together in the new workflow. |
| `EDITORIAL_GOVERNANCE.md` | Approval gates, accountability, audit trail. |
| `OFFICIAL_MEDIA_ENRICHMENT_WORKFLOW.md` | How media (images, video) gets attached to articles with credits. |
| `SOURCE_AND_RIGHTS_POLICY.md` | Source vetting + rights handling. |
| `FOUNDING_ISSUE_COMMISSIONING_SLATE.md` | The first issue's editorial slate. |
| `ISSUE_001_MEDIA_AND_SOURCE_REGISTER.md` | Per-article source + media registry for Issue 001. |
| `ISSUE_001_RELEASE_READINESS.md` | Launch checklist for Issue 001. |
| `BOARDROOM_BACKROOM_FOUNDING_TARGETS.md` | Distribution / business targets at launch. |
| `MONETIZATION.md` | Revenue model. |
| `ANALYTICS.md` | What's measured + where the dashboards live. |
| `MIGRATION-PAUSE.md` | Historical record of the June 3 pause (now mostly superseded by the new architecture). |

If the new Claude is asked to do editorial work, the **voice + governance + media workflow** docs are the source of truth. If asked to make product decisions, the **product blueprint** doc is.

---

## 5. Operator Boundaries (HARD RULES)

These were stated explicitly by Sibu and apply to all Claude work on
this project until rescinded.

1. **Do not push to `origin/main` directly.** Sibu pushes via GitHub Desktop. Every commit Claude makes is local-only until Sibu pushes.
2. **Do not manually push Claude-created content to `main`.** Content goes through the PR-based approval gate. Infrastructure/doc commits go through Sibu's manual push.
3. **Do not trigger any deployment.** No `vercel deploy`, no `workflow_dispatch` triggers.
4. **Do not run any scheduled job.** No manual cron triggers.
5. **Do not publish any content.** The publication mechanism belongs to the approval-gated workflow, not to interactive sessions.
6. **Do not touch articles, homepage content, features, newsletter data, API keys or any other production-facing functionality** without explicit operator instruction. Read-only by default.
7. **Verify before changes.** Sibu's user memory says: ALWAYS run `npx tsc --noEmit` and `npm run build` before committing. Vercel uses turbopack with strict type checking; silent build failures can block deploys for days.
8. **Believe the live state over the conversation history.** Conversations get stale. Always re-verify via `git fetch`, `cat vercel.json`, etc. before acting on assumptions.

---

## 6. Repository Quick-Reference Card

| Thing | Value |
|---|---|
| Local repo root | `/Users/sibushangase/Downloads/monokromatik-production 2` |
| GitHub repo | `sshangasi-ux/monokromatik-production` |
| Default branch | `main` |
| Last clean fetched commit at handoff | `2c1e9f5` — `MonoKromatik Network: Analytics instrumentation + reporting & monetization docs` (2026-06-11) |
| Working tree at handoff | Clean (no uncommitted changes) |
| Articles count on origin/main | 29 |
| Live site status | HTTP 200, fresh |

### Key files to know

| Path | What it is |
|---|---|
| `data/articles.json` | The publication's database (file-backed CMS) — 29 articles |
| `data/articles.archive.json` | Killed pitches / rejected drafts |
| `lib/voice-profile.md` | The voice profile the Stylist enforces |
| `lib/editor-in-chief.ts` | EIC agent (6-dimension review) |
| `lib/fetch-article-body.ts` | Full-source-body scraper (the May 17 fix that solved the "BellaNaija monopoly") |
| `scripts/run-agents.ts` | Full pipeline orchestrator |
| `scripts/send-pulse-digest.ts` | Sunday Pulse sender |
| `vercel.json` | `{}` — Vercel cron paused/superseded |
| `app/api/cron/run-pipeline/route.ts` | Dormant cron route, intact but unscheduled |

### Env vars / secrets (present in Vercel + GitHub Secrets, do not re-add)

| Name | Used by |
|---|---|
| `ANTHROPIC_API_KEY` | All Claude calls in the agent fleet |
| `OPENAI_API_KEY` | OpenAI calls (added in MonoKromatik 2.0) |
| `RESEND_API_KEY` | EIC operator digest emails |
| `EIC_DIGEST_TO` | `sshangasi@gmail.com` |
| `KIT_API_KEY` | Newsletter signup + Pulse broadcast |
| `KIT_FORM_ID` | `9403327` |
| `PEXELS_API_KEY` | Stock images + video |
| `YOUTUBE_API_KEY` | Media enrichment (added June 10) |
| `CRON_SECRET` | Protects the now-dormant Vercel cron route |

---

## 7. Recent Authoring Pattern

Looking at June 9 – June 11 commits, the rhythm has been:

  1. Claude commits with author `Claude` to a local feature branch
  2. Sibu reviews + pushes via GitHub Desktop
  3. The push lands on `main` with author `MonoKromatik Network` (the merge identity)

You'll see paired commits — same message, both `Claude` and
`MonoKromatik Network` versions. That's normal. The `MonoKromatik
Agent` identity is reserved for the CI runner (only 4 commits since
the pause: the pause itself + 2 media-backfill chores).

---

## 8. What's Open / Deferred / Not Done

### Deferred earlier, may still be relevant

- **Brandwatch.com integration evaluation.** Sibu asked about adding "relevant and reliable" Brandwatch elements to the revised site build. Claude's prior assessment: Brandwatch is $800-$5,000+/month enterprise SaaS — wrong fit for an indie publication. Recommended path: build "Brandwatch-lite" with AI agents (X API, Reddit API, RSS) for $100-$200/month. Discovery/sentiment/influencer-ID layer would fit into "Story / signal discovery" stage of the new workflow. **Not built.** Open question.

- **Homepage "Every Sunday, 8AM SAST" CTA.** Whether to keep or update during the migration. Not addressed.

### Known about, status uncertain

- **Has the first PR been merged through the new review-gated workflow yet?** The workflow activated June 10. Article count on `main` is still 29 (same as at pause time). Either no PRs have opened, or they've been opened but not merged, or they've been opened and rejected. Worth checking the GitHub PRs tab.

- **Pulse digest cron — has it fired since the pause?** The pulse-digest.yml is still active and scheduled. It fired May 31 (per old transcript). Whether it has fired June 7 / June 14 is unverified in this handoff.

---

## 9. How the New Claude Should Start

1. **Read this document end to end.** Don't skim.
2. **Read at least these three docs in `/docs`:**
   - `MONOKROMATIK_2_PRODUCT_BLUEPRINT.md`
   - `MONOKROMATIK_EDITORIAL_VOICE.md`
   - `AI_ORCHESTRATION_ARCHITECTURE.md`
3. **Run a read-only state check before any action:**

   ```bash
   cd "/Users/sibushangase/Downloads/monokromatik-production 2"
   git fetch origin
   git log --oneline -5
   git rev-list --left-right --count origin/main...main
   git status -s
   cat vercel.json
   ```

4. **Verify the live site is healthy:**

   ```bash
   curl -sI --resolve www.monokromatik.com:443:216.198.79.1 https://www.monokromatik.com/ | head -3
   ```

5. **Check the GitHub workflow status:**

   ```bash
   curl -s "https://api.github.com/repos/sshangasi-ux/monokromatik-production/actions/workflows" | python3 -m json.tool | grep -E '"name"|"state"'
   ```

6. **Then ask Sibu:** "I've read the handoff. What are we working on today?"

Do not start work. Do not propose. Wait for direction.

---

## 10. How to Talk to Sibu (style notes from prior sessions)

- Sibu reads carefully and likes honest framing. Don't pretend a recommendation is the obvious answer when there's a tradeoff.
- Sibu likes short option menus (use the `ask_user_input_v0` tool with 2-4 concrete options + a "wait" option) when there's a real decision to make.
- Sibu doesn't like generic praise. Specific, accurate framing over "great question."
- Sibu commits via GitHub Desktop. Phrase actions as "I'll prepare the change locally; push it via GitHub Desktop when ready" rather than promising to push.
- When something is broken, say so clearly. When you're confused or have stale info, say so clearly. Don't bluff.
- If the Anthropic Constitution / safety guidelines conflict with an operator request, follow the Constitution. But default to assuming the request is legitimate and proceed unless there's a real concern.

---

## 11. Strategic Framework Context (from Sibu's project memory)

There's a strategic framework document in the project: *"MONOKROMATIK-DIARY-OF-CEO-STRATEGIC-FRAMEWORK.md"* — Steven Bartlett's *Diary of a CEO* 33 Laws applied to MonoKromatik. Key principles Sibu has internalised:

- **Law 11: Avoid wallpaper at all costs.** Every UI element must earn attention.
- **Law 16: Psychological moonshots.** Small details = big perception gains (peak-end rule, operational transparency, idleness aversion, uncertainty reduction, goal-gradient).
- **Law 25: Live by a code.** MonoKromatik's editorial commandments (publish daily, celebrate Africa, no poverty porn, credit sources, be transparent, engage community, measure everything, kill what doesn't work, build for scale, serve diaspora first).
- **Law 32: Fight for your constraints.** Zero budget is a feature, not a bug.

If the new Claude is asked to make product / editorial / brand decisions, these are the operating principles.

---

## 12. Final Note from the Outgoing Session

The MonoKromatik 2.0 build is genuinely impressive. In a single working day (June 10) the platform was rebuilt from "autonomous publisher with thin RSS scraping" to "design-system-driven Living Magazine with credited media, review-gated agents, and an editorial governance doc set." The pause that triggered this was the right call.

The next Claude should respect the new architecture as the source of truth — don't try to revive the old autonomous-publish path. The publication has matured past it.

If asked about Brandwatch, the prior Claude's recommendation was Path B (build agents instead of subscribing). If asked about anything else operational, default to read-only checks first.

**Welcome aboard.**

— Claude (outgoing session), 2026-06-16
