import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { ResolvedEntity } from '../../../lib/entities';

const KIND_LABEL: Record<string, string> = { brand: 'Brand', person: 'Person', campaign: 'Campaign' };

/**
 * The entity flywheel rail: for each brand/person/campaign the piece is about,
 * surface its Cultural-Signal Index score (when scored) and related coverage
 * across the corpus — turning every article into a door into the whole body of
 * work.
 */
export default function EntityRail({ entities }: { entities: ResolvedEntity[] }) {
  const useful = entities.filter((e) => e.score !== null || e.coverage.length > 0);
  if (useful.length === 0) return null;

  return (
    <section aria-labelledby="entities-heading" className="my-12 border-2 border-mono-charcoal rounded-lg bg-mono-white">
      <header className="bg-mono-black px-5 py-2.5">
        <h2 id="entities-heading" className="font-display font-bold uppercase tracking-[0.16em] text-xs text-mono-amber">
          In the Index
        </h2>
      </header>
      <div className="divide-y divide-mono-charcoal/15">
        {useful.map((e) => (
          <div key={`${e.entity.kind}-${e.slug}`} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="font-body text-[0.7rem] uppercase tracking-[0.12em] text-mono-gray">
                  {KIND_LABEL[e.entity.kind] ?? 'Entity'}
                </span>
                <h3 className="font-feature font-bold text-xl text-mono-black leading-tight">{e.entity.name}</h3>
              </div>
              {e.score !== null && e.indexHref && (
                <Link
                  href={e.indexHref}
                  className="group flex flex-col items-center shrink-0 border-2 border-mono-amber rounded-md px-3 py-1.5 hover:bg-mono-amber transition-colors"
                  title={e.workTitle ?? undefined}
                >
                  <span className="font-display font-bold text-2xl text-mono-black leading-none tabular-nums">{e.score}</span>
                  <span className="font-body text-[0.6rem] uppercase tracking-[0.1em] text-mono-gray group-hover:text-mono-black">Signal</span>
                </Link>
              )}
            </div>

            {e.coverage.length > 0 && (
              <div className="mt-3">
                <span className="font-body text-[0.7rem] uppercase tracking-[0.12em] text-mono-gray">More coverage</span>
                <ul className="mt-1.5 space-y-1">
                  {e.coverage.map((c) => (
                    <li key={c.slug}>
                      <Link href={c.href} className="group inline-flex items-center gap-1 font-body text-sm text-mono-charcoal hover:text-mono-black">
                        <span className="group-hover:underline">{c.title}</span>
                        <ArrowUpRight size={13} className="text-mono-gray group-hover:text-mono-amber-strong shrink-0" />
                        {c.kind === 'case-study' && (
                          <span className="text-[0.6rem] uppercase tracking-[0.1em] text-mono-amber-strong border border-mono-amber rounded px-1 ml-0.5">Scored</span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
