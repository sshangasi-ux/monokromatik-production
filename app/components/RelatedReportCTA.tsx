'use client';

import { ArrowRight } from 'lucide-react';
import { track } from '../../lib/analytics';
import type { ArticleEntryReport } from '../../lib/article-report';

// The in-article STUDY ask — the affordable middle rung between the free
// newsletter and the high-ticket advisory lead. A reader who just finished a free
// piece is shown the R220 value-capture study that goes deeper on exactly that
// subject. The button goes to the report's own page (`/reports/<slug>`), where the
// full rail — PayPal (worldwide cards) → FNB EFT → Paystack — plus the proof and
// Bear Case live; it does NOT drop the reader into a direct Paystack ZAR charge,
// which declines most diaspora cards. Fires report_buy_click tagged with the
// article source, so GA attributes the article → study path (the entry conversion
// the funnel was missing). Rendered only when the article maps to a specific report
// (see lib/article-report.ts), so it is always on-topic — never a generic pitch.
//
// Tier-aware: a study-tier (R220) match reads as "the value-capture study"; a
// flagship (`report`-tier, R3,500) match — used on our real traffic winners, where
// the exact product IS the flagship — reads as "the full intelligence report" and
// also surfaces the flagship's R220 step-down as a cheaper first yes, so a reader
// who isn't ready for R3,500 still has a one-click on-ramp.
export default function RelatedReportCTA({
  report,
  articleSlug,
}: {
  report: ArticleEntryReport;
  articleSlug: string;
}) {
  const isFlagship = report.tier === 'report';
  const kicker = isFlagship ? 'Go deeper · the full intelligence report' : 'Go deeper · the value-capture study';
  const blurb = isFlagship
    ? 'The deep, framework-led read on this — who authors the value, who captures it, and where the money actually lands — with the model, the deal ledger, the scenarios and a Bear Case. Delivered as a designed PDF.'
    : 'The full, source-verified value-capture read on this — who authors the work, who keeps the money, and where the value leaks — with the framework, the evidence and a Bear Case. Delivered as a designed PDF.';
  const buttonLabel = isFlagship ? `Read the report — ${report.price}` : `Keep the study — ${report.price}`;
  const caption = isFlagship
    ? 'One-time · PayPal, card or EFT · instant PDF · launch price'
    : 'One-time · PayPal, card or EFT · instant PDF';

  return (
    <aside className="my-12 border border-mono-black bg-mono-paper p-8 md:p-10">
      <p className="mb-3 font-display text-[11px] font-bold uppercase tracking-[0.28em] text-mono-amber">
        {kicker}
      </p>
      <h2 className="font-display text-2xl font-bold leading-[1.1] text-balance text-mono-black md:text-3xl">
        {report.title}
      </h2>
      <p className="mt-4 max-w-2xl font-body leading-relaxed text-mono-charcoal">{blurb}</p>
      <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
        <a
          href={report.landingUrl}
          onClick={() =>
            track('report_buy_click', { slug: report.slug, price: report.price, source: `article:${articleSlug}` })
          }
          className="inline-flex items-center gap-2 bg-mono-amber px-7 py-4 font-display font-bold text-mono-black transition-colors hover:bg-mono-amber/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mono-amber-strong focus-visible:ring-offset-2"
        >
          {buttonLabel} <ArrowRight size={18} aria-hidden="true" />
        </a>
        <span className="font-body text-sm text-mono-charcoal/70">{caption}</span>
      </div>

      {/* Flagship step-DOWN: the cheaper first yes for a reader not ready for R3,500. */}
      {report.entry && (
        <p className="mt-5 font-body text-sm text-mono-charcoal/80">
          Not ready for the full report?{' '}
          <a
            href={report.entry.landingUrl}
            onClick={() =>
              track('report_buy_click', {
                slug: report.entry!.slug,
                price: report.entry!.price,
                source: `article:${articleSlug}:entry`,
              })
            }
            className="font-semibold text-mono-black underline decoration-mono-amber decoration-2 underline-offset-2 hover:text-mono-amber-strong"
          >
            Start with the {report.entry.price} study →
          </a>
        </p>
      )}
    </aside>
  );
}
