// The asset-valuation index — the data spine behind the self-serve "value an
// asset" tool (app/intelligence/value). It joins the four real data sources on a
// normalised brand key, so a typed asset returns ONLY reads we actually hold:
// the Ownership 100 verdict + owner, the acquisitions-ledger verdict, the
// Cultural-Signal Index score, and the deep "Who Owns X" brief. Nothing is
// fabricated — an asset with no record returns no read (the tool then routes to
// a commissioned valuation). HOLLOWED is never assigned to a stored record (it
// exists only in the interactive Value-Capture Checker); here verdicts come
// straight from the source data.

import { brandSlug, rankIndex, signalBand } from './signal-index';
import { getAllCaseStudies } from './case-studies';
import { getOwnership100Entries, type OwnershipStatus } from './ownership100';
import { getAcquisitions, type Verdict } from './acquisitions';
import { getAllArticles } from './articles';
import { normName, type Archetype, type AssetRead } from './asset-read';

export type { AssetRead, Archetype } from './asset-read';
export { ARCHETYPE_NOTE, normName } from './asset-read';

const STATUS_TO_ARCH: Record<OwnershipStatus, Archetype> = {
  Retained: 'RETAINED',
  Exported: 'EXPORTED',
  Contested: 'CONTESTED',
};
const VERDICT_TO_ARCH: Record<Verdict, Archetype> = {
  retained: 'RETAINED',
  exported: 'EXPORTED',
  mixed: 'CONTESTED',
};

// Strip a trailing "(70%)" / "(minority)" qualifier from an acquisition target.
function cleanTarget(t: string): string {
  return t.replace(/\s*\([^)]*\)\s*$/, '').trim();
}

/**
 * Build the unified, deduped asset index. Merge priority per field: the first
 * non-empty source wins for display/href; structured verdict/owner come from
 * Ownership 100, then acquisitions; the score comes from the Index. Deterministic
 * at build time (no per-request cost — the page passes this to the client).
 */
export function buildAssetIndex(): AssetRead[] {
  const map = new Map<string, AssetRead>();

  const upsert = (name: string, keyName?: string): AssetRead => {
    const key = brandSlug(keyName ?? name);
    let r = map.get(key);
    if (!r) {
      r = { key, display: name, norm: normName(name), sources: [] };
      map.set(key, r);
    }
    return r;
  };
  const addSource = (r: AssetRead, s: string) => {
    if (!r.sources.includes(s)) r.sources.push(s);
  };

  // 1. The Cultural-Signal Index (score layer).
  for (const b of rankIndex(getAllCaseStudies())) {
    if (b.score == null) continue;
    const r = upsert(b.brand);
    r.score = Math.round(b.score);
    r.band = signalBand(b.score)?.band;
    if (!r.href) r.href = `/intelligence/signal-index/${brandSlug(b.brand)}`;
    addSource(r, 'Cultural-Signal Index');
  }

  // 2. The Ownership 100 (primary verdict + ownership).
  for (const e of getOwnership100Entries()) {
    const r = upsert(e.brand);
    if (!r.sector) r.sector = e.sector;
    r.owner = e.owner;
    r.ownerCountry = e.ownerCountry;
    r.ownership = e.ownership;
    r.verdict = STATUS_TO_ARCH[e.status];
    if (!r.take) r.take = e.note;
    r.rank = e.rank;
    if (e.articleSlug) r.href = `/article/${e.articleSlug}`;
    addSource(r, 'Ownership 100');
  }

  // 3. The acquisitions ledger (deals) — matched on the (cleaned) target.
  for (const a of getAcquisitions()) {
    const r = upsert(cleanTarget(a.target));
    if (!r.sector) r.sector = a.sector;
    if (!r.owner) r.owner = a.acquirerParent || a.acquirer;
    if (!r.verdict) r.verdict = VERDICT_TO_ARCH[a.verdict];
    if (!r.take) r.take = a.read;
    if (!r.href && a.relatedArticle) r.href = `/article/${a.relatedArticle}`;
    addSource(r, 'Acquisitions ledger');
  }

  // 4. Article coverage — the deep read for every brand/person we've covered.
  //    "Who Owns X" briefs are the canonical ownership read, so they run first and
  //    win the deep-read link; then every other article's brand/person entities are
  //    added, so an asset we've written about is searchable even without a stored
  //    verdict or score (the read is then "here's our coverage").
  const articles = getAllArticles();
  const addArticleAsset = (
    display: string,
    keyName: string,
    slug: string,
    excerpt: string | undefined,
    canonical: boolean,
  ) => {
    const name = display.trim();
    if (!name) return;
    const r = upsert(name, keyName);
    if (canonical || !r.href) r.href = `/article/${slug}`;
    if (!r.take && excerpt) r.take = excerpt;
    addSource(r, canonical ? 'Who Owns X brief' : 'MonoKromatik coverage');
  };
  for (const art of articles) {
    if (!art.slug.startsWith('who-owns-')) continue;
    const be = art.entities?.find((e) => e.kind === 'brand');
    const name =
      be?.name || art.title.replace(/^who owns\s+/i, '').replace(/\?$/, '').trim();
    addArticleAsset(name, be?.brand ?? name, art.slug, art.excerpt, true);
  }
  for (const art of articles) {
    if (art.slug.startsWith('who-owns-')) continue;
    for (const e of art.entities ?? []) {
      if (e.kind !== 'brand' && e.kind !== 'person') continue;
      addArticleAsset(e.name, e.brand ?? e.name, art.slug, art.excerpt, false);
    }
  }

  // Only expose assets that carry a substantive read (verdict, score or a linked
  // deep read) — a bare name is not a valuation.
  return Array.from(map.values()).filter(
    (r) => r.verdict || r.score != null || r.href,
  );
}
