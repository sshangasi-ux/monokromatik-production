# MonoKromatik Migration Pause

**Status:** ⏸️ Autonomous publishing PAUSED
**Date paused:** 2026-05-20
**Paused by:** Sibu Shangase (operator)
**Reason:** Transition to MonoKromatik 2.0 — a shared Claude + OpenAI editorial
workflow with a mandatory human approval gate before any content reaches
production.

This document is the source of truth for what is currently disabled, why,
and how to restore it when the new pipeline is ready. It is intended to be
read by anyone (current Sibu, future Sibu, OpenAI collaborator, audit, or
any developer onboarding to the codebase) who needs to understand the
operational state of this repo during the pause.

---

## The new workflow this pause is making room for

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

The critical change vs. the pre-pause architecture: **no model — neither
Claude nor OpenAI — can publish without explicit operator approval.**
Discovery, drafting, and review can run autonomously. Publication cannot.

---

## What is paused

| # | Component | File / Location | Method of pause | Reversible? |
|---|---|---|---|---|
| 1 | Daily agent pipeline (06:00 UTC) | `.github/workflows/agents.yml` | Disabled via GitHub UI (Repo Settings → Actions → Workflows → Disable) | Yes — re-enable in same UI |
| 2 | Sunday Pulse newsletter (Sun 06:00 UTC) | `.github/workflows/pulse-digest.yml` | Disabled via GitHub UI | Yes — re-enable in same UI |
| 3 | Vercel cron route (06:00 UTC) | `vercel.json` | `vercel.json` reduced to `{}` (no `crons` entry). Original schedule documented below. | Yes — reinstate the `crons` block (snapshot in section *"Vercel cron — paused config snapshot"*) |

After this pause is fully applied, NO scheduled job in this repo will
publish content, send broadcasts, or modify `data/articles.json` on any
schedule.

### Vercel cron — paused config snapshot

This is the cron configuration that was in `vercel.json` prior to the
pause. It is recorded here verbatim so it can be restored exactly when
autonomous publishing resumes under the new approval-gated workflow.

DO NOT copy this back into `vercel.json` until the new Claude + OpenAI
editorial workflow with mandatory operator approval is approved and
shipping. Restoring this configuration re-activates daily autonomous
publishing via the Vercel serverless cron path.

```json
{
  "crons": [
    {
      "path": "/api/cron/run-pipeline",
      "schedule": "0 6 * * *"
    }
  ]
}
```

| Field | Value |
|---|---|
| Path | `/api/cron/run-pipeline` |
| Schedule | `0 6 * * *` (daily 06:00 UTC = 08:00 SAST) |
| Auth | `CRON_SECRET` Bearer header (unchanged — secret not rotated) |
| Handler | `app/api/cron/run-pipeline/route.ts` (code intact, just unscheduled) |
| Status | **Paused during MonoKromatik 2.0 migration** |

## What is NOT paused (intentionally)

| Component | Why it stays | Risk during pause |
|---|---|---|
| Live site at https://www.monokromatik.com | Already-published content is EIC-approved and operator-acknowledged | None |
| 12 articles in `data/articles.json` | These are the publication's current output | None |
| Next.js app, Vercel hosting, DNS | Serving existing content is unrelated to publishing new content | None |
| `app/api/cron/run-pipeline/route.ts` (the API route itself) | Code intact; it just isn't scheduled anymore. Could still be invoked manually via cURL with `CRON_SECRET` if needed. | If someone calls the endpoint manually, it would run the pipeline. `CRON_SECRET` rotation is an extra layer of safety; not done by default. |
| All `/lib/*` agent code (Scout, Curator, Writer, Stylist, EIC, etc.) | Discovery and drafting capability is preserved for the new workflow | None — code can't act unless invoked |
| `scripts/run-agents.ts` | Same | Operator can still run manually for research/draft only |
| `scripts/send-pulse-digest.ts` | Same | Operator can still dry-run locally |
| EIC daily kill-digest email | Already paused: fires only inside the agent pipeline, which is paused | None |

---

## What stops happening as a result of this pause

- ❌ No autonomous content publication on `main`
- ❌ No new commits to `data/articles.json` from the GitHub Actions runner
- ❌ No Sunday newsletter broadcasts to Kit subscribers
- ❌ No EIC digest emails (since they fire from inside the daily agent run)
- ❌ No Vercel auto-deploys triggered by agent commits

## What CONTINUES to happen during this pause

- ✅ Live site stays up with the current 12 published articles
- ✅ Existing articles remain reachable, indexed, and cached
- ✅ Newsletter signup form on the homepage still collects subscribers
- ✅ The agent code can still be run manually (`npm run agents -- --no-push --dry-run`)
  for research / draft creation as part of the new workflow
- ✅ All third-party integrations (Anthropic, Resend, Kit, Pexels) remain
  configured but are no longer invoked on schedule

---

## How the live site behaves during the pause

The 12 published articles continue to serve normally. No visible change
for readers. The homepage CTA still says **"Every Sunday, 8AM SAST"** —
this promise will not be honored during the pause. **Recommended follow-up
(NOT applied in this commit):** update the homepage CTA to read something
honest like "The Pulse returns soon — we're upgrading the newsroom" so
new visitors aren't promised a delivery that won't arrive.

That copy change has been intentionally deferred so the pause itself
introduces zero user-facing changes. Decide separately whether to make
the homepage transparent about the migration.

---

## How to verify the pause is complete

After applying all three pause actions:

1. **GitHub Actions tab** (https://github.com/sshangasi-ux/monokromatik-production/actions):
   - Both `MonoKromatik Daily Agent Run` and `MonoKromatik Sunday Pulse`
     should show a "This scheduled workflow is disabled" banner.
   - No new runs should appear with `trigger=schedule`.

2. **Vercel project settings** → Cron Jobs:
   - The `/api/cron/run-pipeline` daily job should NOT appear in the
     active crons list.

3. **Wait 24 hours** and check that no commit appears on `main` with
   author `MonoKromatik Agent <agents@monokromatik.com>`. If one does,
   the pause is incomplete.

---

## How to resume autonomous publishing

When the new MonoKromatik 2.0 workflow is approved and ready to ship,
restore the three pause points in reverse:

1. **`vercel.json`** — reinstate the cron config block from the
   *"Vercel cron — paused config snapshot"* section above. Replace the
   `{}` contents of `vercel.json` with the documented JSON. Commit and
   push. Vercel will re-register the cron on the next deploy.

2. **`.github/workflows/agents.yml`** — go to GitHub UI:
   Actions → MonoKromatik Daily Agent Run → "⋯" (top right) → Enable workflow.

3. **`.github/workflows/pulse-digest.yml`** — same UI flow, but pick
   the Sunday Pulse workflow.

**Or, more likely** — the new workflow will introduce new entry points
(an approval gate, perhaps a different workflow file entirely). In that
case, treat the disabled workflows as deprecated rather than re-enabling
them. The code in `lib/` is still useful as discovery/drafting primitives
in the new pipeline; only the autonomous publishing trigger needs to die.

---

## Architectural note for whoever designs MonoKromatik 2.0

The capability to publish autonomously to `main` lives in two places in
this codebase:

  - **In CI:** `.github/workflows/agents.yml` runs `npm run agents`, which
    runs `scripts/run-agents.ts`, which commits and pushes via the default
    `GITHUB_TOKEN` (write permission on `main`).

  - **In the API route:** `app/api/cron/run-pipeline/route.ts` runs the
    same logic in a Vercel serverless function on its cron schedule.
    It writes to `data/articles.json` and uses git inside the function
    to commit.

When designing the approval gate, plan to neutralize both code paths
or redesign them so the publish step is contingent on an explicit
human-approved signal (e.g. a labelled PR merge, a Notion approval,
or a webhook from the operator's approval UI).

Reducing `vercel.json` to `{}` and disabling workflows is sufficient
for an operational pause. It is NOT sufficient for a permanent architectural
shift — the code paths still exist and would re-activate if the cron
config were reinstated and the workflows re-enabled. That's deliberate:
the pause should be cheap to reverse while the new architecture is being
designed.

---

## Reference

Last successful autonomous publish before the pause:

  Commit:    d4692c5f (May 19, 2026, 07:40 UTC)
  Author:    MonoKromatik Agent <agents@monokromatik.com>
  Articles:  2 published
             - Mesoma Onyeagba's Quilts Hang in the Finnish Consulate
             - Omowunmi Dada Wore Northern Nigerian Royalty to a Lagos Premiere

Last attempted autonomous publish before the pause:

  Run:       #20 (May 20, 2026, 07:38 UTC)
  Outcome:   Pipeline ran successfully; 0 articles published (all
             candidates either duplicates or killed by EIC).

State of `data/articles.json` at pause time:

  12 articles, all category=culture, all sourceName=BellaNaija,
  all EIC-approved with scores 8.0+/10.
