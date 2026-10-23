'use client';

import { ArrowRight } from 'lucide-react';
import { track } from '../../lib/analytics';
import type { ArticleEntryReport } from '../../lib/article-report';

// The in-article STUDY ask — the affordable middle rung between the free
// newsletter and the high-ticket advisory lead. A reader who just finished a free
// piece is shown the R220 value-capture study that goes deeper on exactly that
// subject, as a one-click Paystack buy. Fires report_buy_click tagged with the
// article source, so GA attributes the article → study path (the entry conversion
// the funnel was missing). Rendered only when the article maps to a specific study
// (see lib/article-report.ts), so it is always on-topic — never a generic pitch.
// Mirrors BuyButton's anchor + event, with the extra `source` attribution.
export default function RelatedReportCTA({
  report,
  articleSlug,
}: {
  report: ArticleEntryReport;
  articleSlug: string;
}) {
  return (
    <aside className="my-12 border border-mono-black bg-mono-paper p-8 md:p-10">
      <p className="mb-3 font-display text-[11px] font-bold uppercase tracking-[0.28em] text-mono-amber">
        Go deeper · the value-capture study
      </p>
      <h2 className="font-display text-2xl font-bold leading-[1.1] text-balance text-mono-black md:text-3xl">
        {report.title}
      </h2>
      <p className="mt-4 max-w-2xl font-body leading-relaxed text-mono-charcoal">
        The full, source-verified value-capture read on this — who authors the work, who keeps the
        money, and where the value leaks — with the framework, the evidence and a Bear Case.
        Delivered as a designed PDF.
      </p>
      <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
        <a
          href={report.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() =>
            track('report_buy_click', { slug: report.slug, price: report.price, source: `article:${articleSlug}` })
          }
          className="inline-flex items-center gap-2 bg-mono-amber px-7 py-4 font-display font-bold text-mono-black transition-colors hover:bg-mono-amber/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mono-amber-strong focus-visible:ring-offset-2"
        >
          Keep the study — {report.price} <ArrowRight size={18} aria-hidden="true" />
        </a>
        <span className="font-body text-sm text-mono-charcoal/70">
          One-time · secure Paystack checkout · instant PDF
        </span>
      </div>
    </aside>
  );
}
