import { ExternalLink } from 'lucide-react';
import type { ArticleSource } from '../../../lib/articles';

/**
 * The numbered References block. Inline `[n]` citation marks in the prose link
 * to `#ref-n` here. Every article has at least one reference (the legacy source
 * is synthesised as [1] by getReferences).
 */
export default function References({ sources }: { sources: ArticleSource[] }) {
  if (!sources || sources.length === 0) return null;
  return (
    <section aria-labelledby="references-heading" className="mt-12 pt-8 border-t-2 border-mono-charcoal">
      <h2
        id="references-heading"
        className="font-display font-bold uppercase tracking-[0.14em] text-sm text-mono-gray mb-4"
      >
        References
      </h2>
      <ol className="space-y-3 font-body text-sm text-mono-charcoal list-none pl-0">
        {sources.map((s, i) => {
          const n = i + 1;
          return (
            <li
              key={`${n}-${s.url}`}
              id={`ref-${n}`}
              className="flex gap-3 scroll-mt-28 target:bg-mono-soft-white target:rounded-md target:-mx-2 target:px-2 target:py-1 transition-colors"
            >
              <span className="font-display font-bold text-mono-amber-strong tabular-nums shrink-0">{n}.</span>
              <span>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-mono-black font-semibold hover:text-mono-amber-strong hover:underline inline-flex items-center gap-1"
                >
                  {s.publisher} <ExternalLink size={12} className="shrink-0" />
                </a>
                <span className="text-mono-gray"> — {s.label}</span>
                {s.use && <span className="block text-mono-gray italic mt-0.5">{s.use}</span>}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
