# Reliable triggers — making the always-on loop actually always-on

_Why the schedules sometimes don't fire, and the one external cron that fixes it._

## The problem

GitHub Actions `schedule:` (cron) triggers are **best-effort, not guaranteed**. Under
load — and especially on free-tier private repos and high-frequency (hourly) crons —
GitHub **delays or silently drops** scheduled runs. Observed on 25 Jun 2026: the daily
discovery run (`agents.yml`, 10:07 UTC) was skipped entirely, and several hourly
breaking-radar slots were missed. The pipelines are healthy; the *trigger* is the weak link.

## The fix: an external heartbeat

`.github/workflows/heartbeat.yml` is the reliable layer. An **external cron service** pings
it every ~20–30 minutes; the heartbeat then **fans out** to whichever workflows are due:

- **Dedup** — it checks each workflow's last-run time and only dispatches if enough time has
  passed (radar ≥ 50 min, daily ≥ 20 h, weekly ≥ 6 days), so frequent pings never double-fire.
- **Time gates** — daily fires only at/after 10:00 UTC; weekly jobs only on their day
  (engine Mon, coverage Thu, index-snapshot Mon), mirroring the native crons.
- **Native fallback** — the heartbeat also keeps a best-effort `*/30` GitHub schedule, and the
  individual workflows keep their own `schedule:` crons. The external ping is what makes it
  reliable; everything else is belt-and-suspenders. Dedup makes the overlap harmless.

```
external cron ──(every ~25 min)──▶ repository_dispatch: heartbeat
                                          │
                              heartbeat.yml (dedup + gates)
                                          │
        ┌──────────────┬──────────────────┼───────────────┬────────────────┐
   breaking-news     agents          engine-cycle   coverage-discover   index-snapshot
```

### Why it needs the PAT

`GITHUB_TOKEN` **cannot trigger other workflows** — GitHub blocks it to prevent recursion.
So both the external ping and the heartbeat's fan-out must use **`GH_PAT`**. Without it, the
heartbeat runs but every dispatch silently no-ops (it logs a warning).

## Operator setup (one external cron job)

### 1. PAT scope

Use the **same `GH_PAT`** added in [BACKEND_ACTIVATION.md](BACKEND_ACTIVATION.md), but ensure
its fine-grained **Repository permissions** include all three:

| Permission | Why |
|---|---|
| **Contents: Read and write** | `repository_dispatch` (the external ping) + the content workflows' branch pushes |
| **Actions: Read and write** | the heartbeat's `gh workflow run` fan-out |
| **Pull requests: Read and write** | the content workflows open review PRs |

(If you already created `GH_PAT` with only Contents + PRs, regenerate or edit it to add
**Actions: Read and write**.)

### 2. The external cron job

Any scheduler that can POST with custom headers works — [cron-job.org](https://cron-job.org)
(free) is the simplest. Create one job:

- **URL:** `https://api.github.com/repos/sshangasi-ux/monokromatik-production/dispatches`
- **Method:** `POST`
- **Schedule:** every 20–30 minutes
- **Headers:**
  - `Authorization: Bearer <YOUR_GH_PAT>`
  - `Accept: application/vnd.github+json`
  - `X-GitHub-Api-Version: 2022-11-28`
  - `Content-Type: application/json`
  - `User-Agent: monokromatik-heartbeat`
- **Body:** `{"event_type":"heartbeat"}`

A successful ping returns **HTTP 204** (no content). The PAT value lives in the cron service's
header config — treat it as a secret: use a dedicated fine-grained PAT, minimal scope above,
and rotate it on your chosen expiry.

> curl equivalent (to test from a terminal):
> ```
> curl -X POST \
>   -H "Authorization: Bearer $GH_PAT" \
>   -H "Accept: application/vnd.github+json" \
>   -H "X-GitHub-Api-Version: 2022-11-28" \
>   https://api.github.com/repos/sshangasi-ux/monokromatik-production/dispatches \
>   -d '{"event_type":"heartbeat"}'
> ```

## Verify it works

1. **Manually:** Actions tab → "MonoKromatik Heartbeat" → "Run workflow" (optionally set
   `force` to `breaking-news` to force one dispatch). Watch it fan out in the run log.
2. **From the external job:** after it fires, the Actions tab shows a Heartbeat run, then the
   due downstream runs appear within a minute or two.
3. If dispatches log `secrets.GH_PAT is not set` or no downstream runs appear, the PAT is
   missing or lacks **Actions: write**.

## Tuning

Cadence and gates live in `heartbeat.yml` (the `dispatch <workflow> <min_gap_minutes>` calls) —
adjust there, in the repo, not in the external service. The external job only needs to ping
often enough (≤ the smallest gap); ~25 min comfortably covers the hourly radar.
