'use client';

import ReactMarkdown from 'react-markdown';
import { Quote, ArrowUpRight } from 'lucide-react';
import type { BrandRead as BrandReadData } from '../../lib/articles';

const confidenceLabel: Record<NonNullable<BrandReadData['confidence']>, string> = {
  verified: 'Verified',
  partial: 'Partly verified',
  interpretive: 'Interpretation',
};

/**
 * The Brand Read — the dual-read strategic layer that turns a cultural story
 * into intelligence for decision makers. See docs/MONOKROMATIK_EDITORIAL_VOICE.md.
 *
 * Renders nothing when no brandRead is present, so it's safe to drop into any
 * article template unconditionally.
 */
export default function BrandRead({ data }: { data?: BrandReadData }) {
  if (!data || !data.take?.trim()) return null;

  const { attribution, attributionRole, take, pullQuote, takeaways, confidence } = data;

  return (
    <aside
      aria-label="The Brand Read"
      className="my-14 bg-mono-black text-mono-white p-7 md:p-10 border-l-4 border-mono-amber"
    >
      <div className="flex items-center justify-between gap-4 border-b border-mono-white/15 pb-5">
        <p className="text-[11px] tracking-[0.34em] font-display font-bold text-mono-amber">
          THE BRAND READ
        </p>
        {confidence && (
          <span className="text-[10px] tracking-[0.2em] font-display font-bold text-mono-gray uppercase">
            {confidenceLabel[confidence]}
          </span>
        )}
      </div>

      {pullQuote && (
        <blockquote className="mt-7 flex gap-4">
          <Quote className="shrink-0 text-mono-amber mt-1" size={26} />
          <p className="text-2xl md:text-3xl font-display font-bold leading-snug text-mono-white">
            {pullQuote}
          </p>
        </blockquote>
      )}

      <div className="mt-6 brand-read-body font-body text-mono-soft-white text-lg leading-relaxed">
        <ReactMarkdown>{take}</ReactMarkdown>
      </div>

      {takeaways && takeaways.length > 0 && (
        <div className="mt-8">
          <p className="text-[11px] tracking-[0.28em] font-display font-bold text-mono-gray mb-4">
            FOR THE DECISION MAKER
          </p>
          <ul className="space-y-7">
            {takeaways.map((point, i) => {
              const isStructured = typeof point !== 'string';
              const key = isStructured ? point.insight : point;
              return (
                <li key={key ?? i} className="flex gap-3 font-body text-mono-soft-white leading-relaxed">
                  <ArrowUpRight className="shrink-0 text-mono-amber mt-1" size={18} />
                  {isStructured ? (
                    <span className="block">
                      <span className="block">
                        <span className="block text-[10px] tracking-[0.2em] font-display font-bold text-mono-gray uppercase mb-1">
                          Where this lands
                        </span>
                        {point.insight}
                      </span>
                      <span className="block mt-4 text-mono-white">
                        <span className="block text-[10px] tracking-[0.2em] font-display font-bold text-mono-amber uppercase mb-1">
                          What to do with it
                        </span>
                        {point.move}
                      </span>
                    </span>
                  ) : (
                    <span>{point}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="mt-8 pt-5 border-t border-mono-white/15 flex items-baseline gap-2">
        <span className="font-display font-bold text-mono-white">{attribution}</span>
        {attributionRole && (
          <span className="font-body text-sm text-mono-gray">— {attributionRole}</span>
        )}
      </div>

      <style jsx global>{`
        .brand-read-body p {
          margin-bottom: 1rem;
        }
        .brand-read-body p:last-child {
          margin-bottom: 0;
        }
        .brand-read-body strong {
          color: var(--mono-white);
          font-weight: 700;
        }
        .brand-read-body a {
          color: var(--mono-amber);
          text-decoration: underline;
        }
      `}</style>
    </aside>
  );
}
