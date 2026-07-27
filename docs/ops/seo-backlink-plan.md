# Backlink plan — earning the authority to get indexed

*Follow-on to `docs/ops/seo-indexing.md`. Written 27 July 2026.*

## Why this is the whole game

The SEO investigation settled it: the site is technically clean and already partially indexed (33 of 327 pages), but Google won't crawl/index the other ~284 because the domain has **almost no authority — i.e. almost no inbound links**. "Crawled – currently not indexed" (29 pages) is Google saying *"seen it, not convinced it's worth indexing yet."* The fix is not more content or more meta tags. It is **links from other real sites**.

**Goal:** 10–15 quality, *relevant* backlinks over the next 6–8 weeks. Relevance and quality beat volume — five links from real African brand and media sites are worth more than a hundred directory listings. Avoid anything that looks like a link farm; Google discounts or penalises those.

**Track progress:** GSC → *Links* (left nav) shows who links to you. Re-check every 2–3 weeks — as real links land, watch "Crawled – not indexed" fall and "Indexed" rise.

---

## The engine: your Index is a backlink machine

You *rate* brands, and a good rating is something a brand wants to display. Every embedded badge is a relevant, editorial backlink from a real brand's own domain — the highest-value kind of link there is, and one no competitor can replicate because they don't have the ratings. This is the flywheel: rating agency → brands cite the rating → backlinks + authority → indexing + reach.

Assets already built to power this (reuse, don't rebuild):
- `docs/collateral/badge-licensing-one-pager.md` — the badge offer
- `docs/collateral/brand-outreach-templates.md` — the email templates
- `docs/collateral/brand-notification-edition-01.md` — the Edition 01 notification
- Live badge + score page per brand: `/api/badge/<brandSlug>.svg` and `/intelligence/signal-index/<brandSlug>`

---

## Tier 1 — Badge outreach to rated brands 🎯 *(highest leverage — start this week)*

**The move:** email each brand's founder or marketing lead, tell them their Cultural-Signal score, send the badge + one-pager, invite them to display it with the backlink. Even the ones who only post it to LinkedIn build awareness; a meaningful share will link it from their site.

**Who to target first** — brands that scored well *and* are founder-led / challenger / culture brands with nimble marketing and their own website (the ones who actually respond and act, unlike slow multinationals):

| Brand | Score | Score page | Badge |
|---|---|---|---|
| Thebe Magugu | 90 | `/intelligence/signal-index/thebe-magugu` | `/api/badge/thebe-magugu.svg` |
| Iamisigo (Bubu Ogisi) | 87 | `/intelligence/signal-index/iamisigo-bubu-ogisi` | `…/iamisigo-bubu-ogisi.svg` |
| Paystack | 83 | `/intelligence/signal-index/paystack` | `…/paystack.svg` |
| Tongoro | 82 | `/intelligence/signal-index/tongoro` | `…/tongoro.svg` |
| Maison Château Rouge | 82 | `/intelligence/signal-index/maison-ch-teau-rouge` | `…/maison-ch-teau-rouge.svg` |
| Chicken Licken (via Joe Public) | 82 | `/intelligence/signal-index/chicken-licken` | `…/chicken-licken.svg` |
| Moniepoint | 82 | `/intelligence/signal-index/moniepoint` | `…/moniepoint.svg` |
| Bathu | 79 | `/intelligence/signal-index/bathu` | `…/bathu.svg` |
| MaXhosa Africa | 79 | `/intelligence/signal-index/maxhosa-africa` | `…/maxhosa-africa.svg` |
| Kava (Inkblot + Filmhouse) | 79 | `/intelligence/signal-index/kava-inkblot-studios-filmhouse-group` | `…/kava-….svg` |
| Boyedoe | 79 | `/intelligence/signal-index/boyedoe-david-kusi-boye-doe` | `…/boyedoe-….svg` |
| Carry1st | 75 | `/intelligence/signal-index/carry1st` | `…/carry1st.svg` |

*(The big three — Ethiopian Airlines, Capitec, Checkers — scored 95 but are slow multinationals; send them the Edition 01 notification for completeness, but don't expect a badge embed.)*

**Realistic yield:** pitch ~12, expect ~3–6 to display it, of which ~2–4 actually link from their site. That's already a strong authority start for a new domain.

---

## Tier 2 — Owned profiles & directories *(do today, free, ~30 min)*

Low individual value (many are `nofollow`), but they establish MonoKromatik as an entity and give Google clean crawl paths to the site:

- **Social bios** — add `monokromatik.com` to the LinkedIn Page, Sibu's personal LinkedIn, Instagram, X, Facebook, Threads.
- **Crunchbase** — create/claim MonoKromatik as a media company (a genuinely useful, crawlable profile).
- **Muck Rack / Qwoted** — set up a MonoKromatik + Sibu profile (also feeds Tier 3).
- **Relevant directories** — African startup/media lists, Feedspot media databases, any "African publications" roundups.

---

## Tier 3 — Editorial & earned links *(higher value, ongoing — ~1 pitch/week)*

- **Reciprocal citations.** You already cite TechCabal, Bizcommunity, The Media Online, Music In Africa, etc. Pitch them a single Index data point ("MonoKromatik rates X the top African brand-culture work of 2026") — a clean, linkable hook.
- **Guest columns / op-eds.** African media & marketing trade — The Media Online, Bizcommunity, Marklives, Ventures Africa, Music In Africa. A byline with a link back is a strong editorial link. You already write to this standard.
- **Journalist-query services** — Qwoted, Featured (HARO successor), SourceBottle. Answer queries on African brands / Afrobeats / amapiano / nation-branding as a named expert; citations come with links. Set keyword alerts.
- **Podcasts.** African business/culture shows — show-notes link back to the site or the Index.
- **The Index as a citable dataset** (CC BY 4.0, DOI at the 30 Sept baseline). Pitch data journalists and academics covering African brands/culture to cite it — durable `.edu`/media links.

---

## Tier 4 — The Edition 01 launch as a PR moment 🚀 *(30 Sept baseline — the big one)*

Edition 01 of the Cultural-Signal Index is a *launchable report* — the natural press hook of the year. Prep an embargoed press note and pitch African + global marketing/culture press to cover "the first Cultural-Signal Index." Press coverage = the highest-authority links available, and it lands right as the brand-notification wave (16 Sept) primes the rated brands. Build on `docs/collateral/brand-notification-edition-01.md`.

---

## Do this week (concrete checklist)

1. **[today]** Add `monokromatik.com` to every social bio + create the Crunchbase profile. *(Tier 2)*
2. **[this week]** Send Tier-1 badge outreach to the top ~10 brands using `brand-outreach-templates.md` + the badge/score links above.
3. **[this week]** Sign up to Qwoted + Featured; set alerts for "African brands", "Afrobeats", "amapiano", "nation branding".
4. **[ongoing]** One guest-column pitch per week to the Tier-3 outlets.
5. **[by mid-Sept]** Draft the Edition 01 press note.

## Realistic expectations

- 10–15 quality links over 6–8 weeks is a strong start for a young domain.
- Indexing typically responds within a few weeks of the first real links — the ~284 stuck pages start clearing.
- This is the single highest-leverage non-content work available right now. The content and the machine are already built; this is what makes them findable.
