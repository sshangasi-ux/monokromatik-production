'use client';

import { ArrowRight } from 'lucide-react';
import { track } from '../../lib/analytics';
import type { ArticleEntryReport } from '../../lib/article-report';

// Compact mid-article report teaser — a slim, one-line ask placed HIGH in the
// piece (after the opening), where readers who never scroll to the foot still
// see the paid shelf. The full RelatedReportCTA card stays at the end of the
// article; this is the early surface the funnel was missing (~17s average dwell
// means the end-of-article ask is seen by almost no one). Routes to the report's
// own page (`/reports/<slug>`), which carries the full rail — PayPal (worldwide
// cards) first — not a direct ZAR charge. Fires report_buy_click tagged
// `article-inline:<slug>` so GA can separate inline vs end-of-article conversion.
export default function InlineReportTeaser({
  report,
  articleSlug,
}: {
  report: ArticleEntryReport;
  articleSlug: string;
}) {
  const label = report.tier === 'report' ? 'The full intelligence report' : 'The value-capture study';
  return (
    <aside className="not-prose my-8 border-l-2 border-mono-amber bg-mono-paper/60 px-5 py-4">
      <p className="font-display text-[10px] font-bold uppercase tracking-[0.28em] text-mono-amber-strong">
        Go deeper · {label}
      </p>
      <a
        href={report.landingUrl}
        onClick={() =>
          track('report_buy_click', {
            slug: report.slug,
            price: report.price,
            source: `article-inline:${articleSlug}`,
          })
        }
        className="group mt-1 inline-flex flex-wrap items-baseline gap-x-2 gap-y-0 font-display text-lg font-bold leading-snug text-mono-black transition-colors hover:text-mono-amber-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mono-amber-strong focus-visible:ring-offset-2"
      >
        <span className="text-balance">{report.title}</span>
        <span className="whitespace-nowrap text-sm font-bold text-mono-amber-strong">
          {report.price}
          <ArrowRight
            size={14}
            className="ml-1 inline -translate-y-px transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </span>
      </a>
    </aside>
  );
}
