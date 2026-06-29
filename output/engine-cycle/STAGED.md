# Engine drafts — staging report

_Generated 2026-06-29T08:33:51.458Z._

Deterministic gates over the review queue. **Publish = merging this PR.**
Auto-patched items are appended to `data/articles.json` (review the diff);
everything else is a proposal with its gate verdict.

| Decision | Count | Meaning |
|---|---|---|
| 🟢 AUTO_PATCH | 2 | Culture article, ≥2 sources, no dup — written to data |
| 🟠 NEEDS_AUTHORING | 5 | Claim-bearing — human authors it (gates pre-passed) |
| 🔵 ENRICH | 0 | Duplicates an existing entry — enrich, don't duplicate |
| 📇 OUTREACH | 3 | Contributor brief — reach out, not publish |
| 🟡 HOLD | 2 | <2 independent sources — needs corroboration |
| 🔴 REJECT | 0 | Failed schema — not usable as-is |

**Auto-patched into `data/articles.json`:** `the-accra-accord-from-un-resolution-to-a-global-framework`, `samuel-ogazi-4338-the-nigerian-who-rewrote-the-rulebook-of-ncaa-and-turned-pro-a`

## Per-item verdicts

### 📇 OUTREACH — HYBE & African Music Managers: The K-Pop Model Meets Afrobeats
- **Section:** conversations · **Kind:** Conversation
- **Sources:** 2 (https://www.musicbusinessworldwide.com/hybe-to-build-a-global-platform-for-african-talent-via-new-partnership-with-tyla-managers-brandon-hixon-and-colin-gayle/; https://www.businesswire.com/news/home/20251215194889/en/HYBE-Partners-with-Acclaimed-Music-Executives-Brandon-Hixon-and-Colin-Gayle-To-Manage-Grammy-Award-Winning-Artist-Tyla-and-To-Build-A-Global-Platform-for-African-Talent)
- **Why:** contributor brief — action is outreach, not publish

### 📇 OUTREACH — Vivo Fashion & Shop Zetu: African Operator Building Home-Market Brand Authority
- **Section:** conversations · **Kind:** Conversation
- **Sources:** 2 (https://african.business/2026/03/trade-investment/african-business-women-in-leadership-2026-part-three; https://fashionista.com/2026/01/african-fashion-global-expansion-strategy-obstacles)
- **Why:** contributor brief — action is outreach, not publish

### 📇 OUTREACH — The Fashion Law Africa Summit: Building Legal Infrastructure to Protect African Design IP
- **Section:** conversations · **Kind:** Conversation
- **Sources:** 4 (https://www.tflas.com/; https://businessday.ng/news/article/fashion-law-institute-africa-debuts-summit-unveils-continental-report-journal/; https://www.fashionlawinstitute.com/institute-events/13th-annual-symposium; https://www.clearlyinvincible.com/post/fashion-law-in-africa)
- **Why:** contributor brief — action is outreach, not publish

### 🟢 AUTO_PATCH — The Accra Accord: From UN Resolution to a Global Framework
- **Section:** culture · **Kind:** Culture
- **Sources:** 6 (Graphic Online; AllAfrica/Ghanaian Times; Ghana Ministry of Foreign Affairs; GBC Ghana Online)
- **Why:** Culture article, ≥2 sources, no duplicate — eligible for auto-patch

### 🟢 AUTO_PATCH — Samuel Ogazi, 43.38: The Nigerian Who Rewrote the Rulebook of NCAA and Turned Pro at 20
- **Section:** culture · **Kind:** Culture
- **Sources:** 8 (Alabama Athletics; World Athletics; Wikipedia; Blueprint Newspapers)
- **Why:** Culture article, ≥2 sources, no duplicate — eligible for auto-patch

### 🟠 NEEDS_AUTHORING — Nike × Air Afrique — *Première Classe*: Reclaiming the Archive, Selling the Elevation
- **Section:** intelligence · **Kind:** Intelligence
- **Sources:** 12 (https://about.nike.com/en/newsroom/releases/nike-air-afrique-air-max-rk61-official-images; https://sneakernews.com/2025/09/16/nike-air-max-rk61-release-date/; https://www.okayafrica.com/air-afrique-pays-tribute-to-afro-diasporic-elegance-with-new-nike-collaboration/1411318; https://wwd.com/footwear-news/sneaker-news/air-afrique-nike-air-max-rk61-sneaker-loafer-release-date-hq6416-001-1238290750/)
- **Duplicate of:** `cs:tyla-pandora-styled-authorship`
- **Why:** Intelligence carries analysis/scores — staged for human authoring (gates pre-checked); ⚠️ possible duplicate of "cs:tyla-pandora-styled-authorship" (similarity 0.45) — verify before authoring/publishing

### 🟠 NEEDS_AUTHORING — Streaming Millions, Publishing Zeros: The African Music Money Gap
- **Section:** issues · **Kind:** Issue
- **Sources:** 6 (https://trendsnafrica.com/africas-creative-economy-poised-to-reach-usd-200-bn-by-2030/; https://downtownmusic.africa/what-changed-between-ifpis-2025-and-2026-global-music-reports-and-why-africas-story-still-matters/; https://www.okayafrica.com/global-sound-local-loss-africas-music-money-gap/1427679; https://www.afrosoundtrack.com/how-african-songwriters-make-money/)
- **Why:** Issue carries analysis/scores — staged for human authoring (gates pre-checked)

### 🟡 HOLD — The Next Export: Lekompo, Krio Fusion, and the Sounds Africa Is Building Behind Afrobeats
- **Section:** issues · **Kind:** Issue
- **Sources:** 1 (https://www.okayafrica.com/the-rising-african-music-genres-of-2026/1421063)
- **Why:** only 1 independent source domain(s) — needs ≥2

### 🟠 NEEDS_AUTHORING — 'Made in Africa' Is Not a Trend. It's a Power Position.
- **Section:** issues · **Kind:** Issue
- **Sources:** 3 (https://fashionista.com/2026/01/african-fashion-global-expansion-strategy-obstacles; https://www.sundaytimes.timeslive.co.za/lifestyle/fashion-and-beauty/2026-04-20-how-africa-and-the-uae-are-shaping-the-luxury-fashion-industry/; https://www.businessoffashion.com/articles/global-markets/the-bank-investing-millions-in-africa-fashion-industry/)
- **Why:** Issue carries analysis/scores — staged for human authoring (gates pre-checked)

### 🟠 NEEDS_AUTHORING — Producing the World's Athletes, Capturing Almost None of the Revenue
- **Section:** issues · **Kind:** Issue
- **Sources:** 4 (https://www.mission33group.com/post/the-african-sports-economy-a-20-billion-asset-the-world-is-underpricing; https://panafricanvisions.com/2026/01/premier-invest-advances-launch-of-african-sports-infrastructure-fund-asif-at-game-time-africa-summit-2026/; https://www.howwemadeitinafrica.com/the-rise-of-sports-business-in-africa/153553/; https://shore.africa/2026/01/15/african-billionaires-investing-in-sports/)
- **Why:** Issue carries analysis/scores — staged for human authoring (gates pre-checked)

### 🟡 HOLD — African Fashion Off the Pop-Up Rack — and Into the Ledger
- **Section:** signal · **Kind:** Signal
- **Sources:** 1 (https://africafashiontour.com/en/africa-now-2026-how-does-the-galeries-lafayette-pop-up-showcase-the-maturity-of-african-fashion/)
- **Why:** only 1 independent source domain(s) — needs ≥2

### 🟠 NEEDS_AUTHORING — ÀLKÉ and the Infrastructure Argument — Building the Machine, Not Just the Moment
- **Section:** signal · **Kind:** Signal
- **Sources:** 5 (https://www.thecoast.co.ke/2026/06/18/african-cultural-intelligence-and-creative-economies-protection-framework-outlined/40/38/business-news/thecoast/16423/11/; https://www.brandessencenigeria.com/africas-creative-economy-has-a-150bn-opportunity-this-institution-is-building-the-infrastructure-to-capture-it/; https://businessamlive.com/alke-ball-positions-africa-for-bigger-role-in-global-luxury-economy/; https://uk.fashionnetwork.com/news/Alke-ball-launches-as-a-new-institution-to-secure-recognition-for-african-fashion,1791898.html)
- **Why:** Signal carries analysis/scores — staged for human authoring (gates pre-checked)
