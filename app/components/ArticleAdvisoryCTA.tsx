'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { track } from '../../lib/analytics';
import type { ArticleAdvisory } from '../../lib/articles';

// The in-article commercial ask. Most articles convert to the newsletter; a
// high-intent commercial piece (e.g. a value-capture read aimed at a named buyer)
// also carries this band, routing the reader to the already-wired lead form
// (/work-with-us -> /api/lead -> Supabase + Resend). Kept deliberately light — a
// single proposition + one CTA — not the full AdvisoryBridge form, so it reads
// as the invitation at the end of the argument, not a second page. Rendered only
// when the article defines `advisory` (see lib/articles.ts).

export default function ArticleAdvisoryCTA({
  advisory,
  slug,
}: {
  advisory: ArticleAdvisory;
  slug: string;
}) {
  const href = `/work-with-us?interest=${encodeURIComponent(advisory.interest)}`;
  const label = advisory.cta || 'Work with the desk';

  return (
    <aside className="my-12 border-l-4 border-mono-amber bg-mono-black p-8 text-mono-white md:p-10">
      <p className="mb-4 font-display text-[11px] font-bold uppercase tracking-[0.28em] text-mono-amber">
        {advisory.eyebrow}
      </p>
      <h2 className="font-display text-2xl font-bold leading-[1.1] text-balance md:text-3xl">
        {advisory.heading}
      </h2>
      <p className="mt-4 max-w-2xl font-body leading-relaxed text-mono-soft-white">
        {advisory.blurb}
      </p>
      <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
        <Link
          href={href}
          onClick={() =>
            track('advisory_cta_click', { source: `article:${slug}`, interest: advisory.interest })
          }
          className="inline-flex items-center gap-2 bg-mono-amber px-7 py-4 font-display font-bold text-mono-black transition-colors hover:bg-mono-amber-bright focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mono-amber-strong focus-visible:ring-offset-2 focus-visible:ring-offset-mono-black"
        >
          {label} <ArrowRight size={18} aria-hidden="true" />
        </Link>
        <span className="font-body text-sm text-mono-soft-white/70">
          A short brief, no obligation — we reply from a real inbox.
        </span>
      </div>
    </aside>
  );
}
