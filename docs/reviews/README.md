# Monthly Strategy Reviews

Automated, internal-telemetry reviews generated on the 1st of each month by
`.github/workflows/monthly-review.yml` (`npm run review:monthly`) and landed here
as `YYYY-MM.md` via a review PR.

Each review measures the site against the strategic bars in
[`../STRATEGY-REVIEW.md`](../STRATEGY-REVIEW.md) — depth-per-piece, Index scale,
proof, GA4 performance, GSC opportunities — and asks the flagship model to write
an honest assessment + a short, prioritised action list in the house voice.

**Scope:** this is the *internal-telemetry* pass — it grounds only on what the
repo and analytics measure. The deep competitive web-research pass (the one that
produced `STRATEGY-REVIEW.md`) stays a periodic manual exercise.

Run locally: `npm run review:monthly -- --month 2026-07`
