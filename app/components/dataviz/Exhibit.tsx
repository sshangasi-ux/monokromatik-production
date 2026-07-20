// The exhibit shell — the flagship's most important component.
//
// The chrome IS the distribution mechanic. Every exhibit carries a source line
// ending in the edition credit, so a screenshot lifted into someone else's deck
// still credits us. That is how a small publisher gets cited: not by asking, but
// by making the citation travel inside the artwork.
//
// Frame follows The Economist's chart furniture (accent rule at the top, a solid
// tag block, title and subtitle flush left, source bottom-left) — the most
// copyable spec in journalism and instantly recognisable as "a chart from a
// publication" rather than "a graphic in a blog post".

import type { ReactNode } from 'react';
import { EDITION } from '../../../lib/edition-01';

export interface ExhibitProps {
  /** Exhibit number within the edition. Numbered per-report from one array so they can't drift. */
  n: number;
  title: string;
  /** States what is plotted — not a restatement of the title. */
  subtitle?: string;
  /** Where the data came from. The edition credit is appended automatically. */
  source?: string;
  /** A caveat printed under the graphic. Use it for what the exhibit must NOT be read as. */
  note?: string;
  /** Stable anchor id; defaults to e{nn}. */
  id?: string;
  children: ReactNode;
}

export default function Exhibit({ n, title, subtitle, source, note, id, children }: ExhibitProps) {
  const anchor = id ?? `e${String(n).padStart(2, '0')}`;
  const num = String(n).padStart(2, '0');
  const credit = `MONOKROMATIK CULTURAL-SIGNAL INDEX · RUBRIC ${EDITION.rubric.toUpperCase()} · EDITION ${EDITION.number}`;

  return (
    <figure id={anchor} className="not-prose my-12 scroll-mt-28 border border-mono-gray/25 bg-mono-white">
      {/* Accent rule — full width, top. The single most recognisable piece of chart furniture. */}
      <div className="h-[3px] w-full bg-mono-amber" />

      <div className="p-5 md:p-7">
        <div className="flex items-start gap-4">
          <span className="shrink-0 bg-mono-amber px-2 py-1 text-[10px] font-display font-bold tracking-[0.22em] text-mono-white">
            EXHIBIT {num}
          </span>
          <a
            href={`#${anchor}`}
            aria-label={`Link to exhibit ${num}`}
            className="ml-auto shrink-0 text-mono-gray hover:text-mono-amber-strong text-sm leading-none pt-1"
          >
            ¶
          </a>
        </div>

        <figcaption className="mt-4">
          <h3 className="font-display font-semibold text-lg md:text-xl text-mono-black leading-snug">{title}</h3>
          {subtitle && <p className="mt-1 font-body text-sm text-mono-gray leading-relaxed">{subtitle}</p>}
        </figcaption>

        <div className="mt-6">{children}</div>

        {note && (
          <p className="mt-5 border-l-2 border-mono-gray/30 pl-3 font-body text-[13px] text-mono-charcoal leading-relaxed">
            {note}
          </p>
        )}
      </div>

      <div className="border-t border-mono-gray/20 px-5 md:px-7 py-3">
        <p className="font-body text-[11px] leading-relaxed text-mono-gray/90">
          {source && <>{source} · </>}
          {credit}
        </p>
      </div>
    </figure>
  );
}
