// UTM tagging for outbound social links, so LinkedIn/IG/etc. traffic attributes
// cleanly in GA instead of landing as unlabelled "referral". The dynamic
// opengraph-image is served regardless of query params, so the branded card
// still renders with UTMs on the URL — tag the link BEFORE posting (editing a
// live LinkedIn post only tags the in-body text, not the card, so bake it in at
// post time). Keep params minimal and stable; campaign is usually the slug.

export interface UtmParams {
  /** utm_source — the network: 'linkedin', 'instagram', 'youtube', 'newsletter', … */
  source: string;
  /** utm_medium — defaults to 'social'. */
  medium?: string;
  /** utm_campaign — the piece's slug (or 'wire' for the breaking feed). */
  campaign: string;
  /** utm_content — optional variant, e.g. 'personal' vs 'page', 'card' vs 'comment'. */
  content?: string;
}

/** Append UTM params to an internal URL. Returns the URL unchanged if it can't be parsed. */
export function withUtm(url: string, params: UtmParams): string {
  try {
    const u = new URL(url);
    u.searchParams.set('utm_source', params.source);
    u.searchParams.set('utm_medium', params.medium ?? 'social');
    u.searchParams.set('utm_campaign', params.campaign);
    if (params.content) u.searchParams.set('utm_content', params.content);
    return u.toString();
  } catch {
    return url;
  }
}
