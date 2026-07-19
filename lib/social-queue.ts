// Shared social post queue — picks the next unposted item (Wire break first, else
// latest article) and builds its branded-card URL + caption + canonical link.
// Used by every network publisher (Instagram, LinkedIn) so they select and
// caption content identically; each network keeps its OWN dedup ledger, so the
// same item can post once per network.

import { getAllArticles } from './articles';
import { getBreaks } from './breaking-feed';
import { articleCaption, breakCaption, linkedinArticleCaption, linkedinBreakCaption } from './social-caption';

const SITE = 'https://www.monokromatik.com';

/** Networks caption and order differently — LinkedIn is a professional feed. */
export type SocialNetwork = 'instagram' | 'linkedin';

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

function mkArticle(a: ReturnType<typeof getAllArticles>[number], network: SocialNetwork): SocialCandidate {
  return {
    id: `art:${a.slug}`,
    kind: 'article',
    title: a.title,
    cardUrl: `${SITE}/api/social-card?slug=${encodeURIComponent(a.slug)}&format=jpg`,
    caption: network === 'linkedin' ? linkedinArticleCaption(a) : articleCaption(a),
    link: `${SITE}/article/${a.slug}`,
  };
}

/**
 * Next item this network hasn't posted yet. `slugFlag` targets a specific article.
 *
 * Ordering is network-specific: Instagram leads with the timeliest Wire break,
 * but LinkedIn leads with OUR OWN analysis — a relayed third-party headline is a
 * weak thing to put under a personal professional profile, where the whole point
 * is showing the decode. Breaks are the fallback there, credited and not overclaimed.
 */
export function nextCandidate(
  posted: Set<string>,
  slugFlag?: string,
  opts: { network?: SocialNetwork } = {},
): SocialCandidate | null {
  const network = opts.network ?? 'instagram';

  if (slugFlag) {
    const a = getAllArticles().find((x) => x.slug === slugFlag);
    if (a) return mkArticle(a, network);
  }

  const nextBreak = (): SocialCandidate | null => {
    for (const [i, b] of getBreaks().entries()) {
      const id = `break:${b.link}`;
      if (!posted.has(id))
        return {
          id,
          kind: 'break',
          title: b.title,
          cardUrl: `${SITE}/api/social-card?break=${i}&format=jpg`,
          caption: network === 'linkedin' ? linkedinBreakCaption(b) : breakCaption(b),
          link: `${SITE}/breaking`,
        };
    }
    return null;
  };

  const nextArticle = (): SocialCandidate | null => {
    for (const a of getAllArticles()) {
      if (!posted.has(`art:${a.slug}`)) return mkArticle(a, network);
    }
    return null;
  };

  return network === 'linkedin' ? nextArticle() ?? nextBreak() : nextBreak() ?? nextArticle();
}
