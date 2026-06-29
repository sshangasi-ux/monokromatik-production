// Shared social post queue — picks the next unposted item (Wire break first, else
// latest article) and builds its branded-card URL + caption + canonical link.
// Used by every network publisher (Instagram, LinkedIn) so they select and
// caption content identically; each network keeps its OWN dedup ledger, so the
// same item can post once per network.

import { getAllArticles } from './articles';
import { getBreaks } from './breaking-feed';
import { articleCaption, breakCaption } from './social-caption';

const SITE = 'https://www.monokromatik.com';

export interface SocialCandidate {
  id: string;
  kind: 'break' | 'article';
  title: string;
  /** Public branded card image (same-origin, IG/LinkedIn can fetch it). */
  cardUrl: string;
  caption: string;
  /** Canonical link to the piece. */
  link: string;
}

function mkArticle(a: ReturnType<typeof getAllArticles>[number]): SocialCandidate {
  return {
    id: `art:${a.slug}`,
    kind: 'article',
    title: a.title,
    cardUrl: `${SITE}/api/social-card?slug=${encodeURIComponent(a.slug)}&format=jpg`,
    caption: articleCaption(a),
    link: `${SITE}/article/${a.slug}`,
  };
}

/** Next item this network hasn't posted yet. `slugFlag` targets a specific article. */
export function nextCandidate(posted: Set<string>, slugFlag?: string): SocialCandidate | null {
  if (slugFlag) {
    const a = getAllArticles().find((x) => x.slug === slugFlag);
    if (a) return mkArticle(a);
  }
  // Wire breaks first (most timely), newest → oldest.
  for (const [i, b] of getBreaks().entries()) {
    const id = `break:${b.link}`;
    if (!posted.has(id))
      return {
        id,
        kind: 'break',
        title: b.title,
        cardUrl: `${SITE}/api/social-card?break=${i}&format=jpg`,
        caption: breakCaption(b),
        link: `${SITE}/breaking`,
      };
  }
  for (const a of getAllArticles()) {
    if (!posted.has(`art:${a.slug}`)) return mkArticle(a);
  }
  return null;
}
