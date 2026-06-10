# Issue 001 Media and Source Register

## Purpose

This register governs visual, video, audio and source usage for the founding Monokromatik release package. The objective is a rich, visually led editorial experience built from attributable evidence rather than untraceable media inventory.

## Operating rule

> Use official or clearly attributable media in service of original analysis. Credit visibly. Retain the source record. Do not treat publisher-owned material as unrestricted stock.

## Usage classifications

| Classification | Use in Issue 001 | Publication rule |
|---|---|---|
| Monokromatik owned | Cover artwork, motion system, designed intelligence elements | May be used prominently across site, social and future print derivatives |
| Official brand / agency media | Campaign stills, films and press assets released by the campaign authority | Use with visible credit and source link; verify asset remains accessible before publication |
| Official embedded film / audio | Platform-hosted official campaign media | Embed with visible credit and official campaign source; do not download or rehost by default |
| Independent reporting | Context, reported outcomes and external verification | Cite as evidence; do not reproduce publisher imagery unless separately permitted |
| Contributor media | Portraits, recording, quotations and audio/video | Use only once contributor permission and credit terms are recorded |
| Unclear origin | Untraceable visuals, ripped films or missing ownership | Do not publish prominently; replace or secure permission |

## Implemented media register

| Asset ID | Editorial surface | Asset / purpose | Source authority | Usage classification | Credit treatment | Status |
|---|---|---|---|---|---|---|
| ISSUE001-COVER-001 | Homepage Living Cover; Issue 001 landing; cover-study page | Kinetic founding cover: grid, signal marker, orbit fields and issue numbering | Monokromatik | Owned | Monokromatik / Issue 001 | Implemented in preview |
| NIKE-AA-IMG-001 | The Work / Nike × Air Afrique | Air Max RK61 campaign hero image | NIKE, Inc. Newsroom / official Nike-hosted media | Official brand media | Courtesy of NIKE, Inc. / Air Afrique; source link visible | Implemented in preview; asset-load review required |
| NIKE-AA-IMG-002 | The Work / Nike × Air Afrique | Campaign quote/editorial visual supporting cultural-reading section | NIKE, Inc. Newsroom / official Nike-hosted media | Official brand media | Courtesy of NIKE, Inc. / Air Afrique; source link visible | Implemented in preview; asset-load review required |
| NIKE-AA-REP-001 | The Work / Nike × Air Afrique | Abidjan-first launch and consumer-access reporting context | Vogue Business | Independent reporting | Listed in source ledger only; publisher visuals not reused | Implemented as evidence source |
| ORANGE-WF-VID-001 | Will It Land? / South Africa | Orange and Marcel campaign film reference and viewing experience | Publicis France / Marcel campaign source and official hosted film | Official embedded media | Orange / Marcel / Publicis France; campaign source visible | Implemented in South Africa draft; embed playback review required |
| ORANGE-WF-REP-001 | Will It Land? / South Africa | Independent context on original campaign premise and response | TIME | Independent reporting | Listed in source ledger | Implemented as evidence source |
| SA-WF-CTX-001 | Will It Land? / South Africa | Banyana Banyana achievement and current support/preparation context | Current reputable women’s-football reporting; final primary-source confirmation desirable | Editorial context evidence | Listed in source ledger | Implemented as contextual input; final verification gate remains |
| BW-001-DESIGN | Brand Weather | Recurring briefing design treatment | Monokromatik | Owned | Monokromatik | Implemented in preview |
| BBB-001-CONTRIB | Boardroom / Backroom | Portraits, audio, video and quotation material from founding participants | To be secured from accepted contributors | Contributor media | Named contributor/photographer/production credits required | Not yet commissioned |

## Media requirements still to secure

| Feature | Required enhancement | Preferred source | Gate before use |
|---|---|---|---|
| Cover essay | Optional supporting visual spread or related-work module | Monokromatik owned artwork or official case media already credited elsewhere | Editorial decision and source attribution |
| Nike × Air Afrique | Optional official film or motion asset for campaign immersion | Nike or Air Afrique official embeddable release | Official source confirmed and embed verified |
| Orange / South Africa test | Optional official still or agency key visual in addition to film | Orange / Marcel / Publicis official source | Asset-source confirmation and credit line |
| Brand Weather | Additional official-source cards for first live edition | Approved Source Desk inputs | Freshness, source and confidence rating |
| Boardroom / Backroom | Portraits, audio/video recording and quoted copy | Selected contributor and commissioned production | Written consent and quote approval |

## Source evidence roles

| Evidence role | Definition | Examples in Issue 001 |
|---|---|---|
| Official fact basis | Confirms campaign identity, stated rationale, credits, product or film assets | Nike Newsroom; Publicis France / Marcel |
| Independent verification | Provides externally reported context, reception or stated outcomes | Vogue Business; TIME |
| Local relevance context | Grounds global-to-market analysis in the selected African context | South African women’s-football evidence for Will It Land? |
| Monokromatik interpretation | Our strategic reading, clearly separated from verified facts | Africa-first access argument; South Africa continuity test |

## Required database fields for Track 2

When the Intelligence database is introduced, each media record should store:

- `asset_id`
- `feature_slug`
- `asset_type` — image, video, audio, embed, illustration, document
- `title`
- `owner_or_credit`
- `official_source_url`
- `asset_url_or_embed_reference`
- `usage_classification`
- `visible_credit_line`
- `permission_or_terms_checked`
- `rights_risk_status`
- `verified_on`
- `verified_by`
- `withdrawn_or_replaced_on`

## Publication gate

A media-rich story can be approved for production only when:

1. Each displayed external asset has a visible credit and a retained source link.
2. Prominent media is owned, official, embedded, licensed or otherwise cleared for the intended editorial use.
3. Referenced external reporting is cited for evidence, not quietly used as image inventory.
4. Video and image assets are tested in the release environment.
5. Contributor media and quotations have recorded permission.
6. A source withdrawal, broken embed or rights query triggers removal or replacement review.
