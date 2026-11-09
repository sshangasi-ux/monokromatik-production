'use client';

import LeadMagnetCapture from './LeadMagnetCapture';

/**
 * In-article lead-magnet capture — a dark band that interrupts the prose mid/late,
 * where readers at ~17s dwell actually are (the same placement logic the inline
 * report teaser uses). Offers The African Ownership Map in exchange for a Weekly
 * Signal join. Fires `newsletter_signup` tagged `article-inline:<slug>` so inline
 * capture is separable from the footer form in GA4.
 *
 * `not-prose` opts the card out of the surrounding `prose` typography so its own
 * layout is untouched by the article's markdown styles.
 */
export default function InlineLeadMagnet({ slug }: { slug: string }) {
  return (
    <div className="not-prose my-10">
      <div className="bg-mono-black p-6 md:p-8 border-l-4 border-mono-amber">
        <LeadMagnetCapture tone="dark" source={`article-inline:${slug}`} />
      </div>
    </div>
  );
}
