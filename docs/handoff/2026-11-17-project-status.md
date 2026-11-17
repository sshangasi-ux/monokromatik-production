# MonoKromatik Network — project status (17 Nov 2026)

Single source of truth for where the project stands. Everything below is either on `main` or saved on a branch.

## Shipped to main today
- **PR #847** merged: "Rented, not owned" argument essay + Ownership Ladder framework + exhibit.
  - `/article/ambassador-is-not-owner-africa-world-brands-no-equity`
  - `/article/the-ownership-ladder-brand-deals-framework`
- **PR #848** merged: `/editions` route with Edition 01, "The Ownership Issue".
  - `/editions/the-ownership-issue`, `/editions` index, `data/editions.json`, `lib/editions.ts`.
- main head: `755ab95`.

## Open items
1. **LinkedIn posting is down.** Verify run 44072543925 returned 401 (token invalid or expired). Regenerate the token per `docs/ops/linkedin-app-and-token-setup.md`, including the comment scope, then update the `LINKEDIN_ACCESS_TOKEN` secret.
2. **Scheduled LinkedIn runs are preview-only.** `LINKEDIN_AUTOPOST` is unset, so runs report green without publishing. Consider making a non-publishing run fail visibly.
3. **Email send is blocked.** Gmail is missing the send permission. Bird has no verified sending domain. Kit (the list) is not connected to this session. The Edition 01 preview is saved in `docs/ops/edition-01-email/`.
4. **Claude for Chrome cannot run from this session.** It runs in a desktop-app session only.
5. **GA4.** Key events marked: `purchase`, `newsletter_signup`, `report_buy_click`. `lead_submit` is pending one real form submission. The two Explore funnels are not finished.
6. **Optional:** apex → www redirect is a 307 in Vercel; change it to 308 permanent.
7. **Next.js security advisory** flagged during build. Upgrade is pending review.
8. **Session trust.** Attaching the Mac limited this session to trusted devices. This cannot be undone within the session.

## Where things live
- Code and content: GitHub, `sshangasi-ux/monokromatik-production`. Local folder on the Mac is not a git checkout.
- Edition 01 email assets: `docs/ops/edition-01-email/`.
- LinkedIn setup: `docs/ops/linkedin-app-and-token-setup.md`.
