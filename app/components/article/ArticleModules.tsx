import Link from 'next/link';
import { Check, FileText, CircleSlash, ArrowUpRight } from 'lucide-react';
import type { ModuleVM } from '../../../lib/article-modules';

/** Superscript link from a module datum back to its numbered reference. */
function Cite({ n }: { n?: number }) {
  if (!n) return null;
  return (
    <a href={`#ref-${n}`} className="citation-ref align-super text-[0.65em] text-mono-amber-strong hover:underline ml-0.5">
      [{n}]
    </a>
  );
}

function ModuleShell({ label, title, children }: { label: string; title?: string; children: React.ReactNode }) {
  return (
    <section className="my-10 border-2 border-mono-charcoal rounded-lg overflow-hidden">
      <header className="bg-mono-black px-5 py-2.5">
        <span className="font-display font-bold uppercase tracking-[0.16em] text-xs text-mono-amber">{label}</span>
        {title && <span className="font-body text-mono-white/80 text-sm ml-3">{title}</span>}
      </header>
      <div className="p-5 bg-mono-soft-white">{children}</div>
    </section>
  );
}

export default function ArticleModules({ modules }: { modules: ModuleVM[] }) {
  if (!modules || modules.length === 0) return null;
  return (
    <>
      {modules.map((m, i) => {
        if (m.type === 'numbers') {
          return (
            <ModuleShell key={i} label="By the Numbers" title={m.title}>
              <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {m.items.map((it, j) => (
                  <div key={j} className="border-l-2 border-mono-amber pl-3">
                    <dt className="font-feature font-bold text-3xl text-mono-black leading-none">
                      {it.value}<Cite n={it.source} />
                    </dt>
                    <dd className="font-body text-sm text-mono-gray mt-1.5">{it.label}</dd>
                  </div>
                ))}
              </dl>
            </ModuleShell>
          );
        }
        if (m.type === 'timeline') {
          return (
            <ModuleShell key={i} label="Timeline" title={m.title}>
              <ol className="space-y-3">
                {m.items.map((it, j) => (
                  <li key={j} className="flex gap-4">
                    <span className="font-display font-bold text-mono-amber-strong text-sm whitespace-nowrap shrink-0 w-28">{it.date}</span>
                    <span className="font-body text-mono-charcoal text-sm">{it.event}<Cite n={it.source} /></span>
                  </li>
                ))}
              </ol>
            </ModuleShell>
          );
        }
        if (m.type === 'evidence') {
          const col = (heading: string, items: string[], Icon: typeof Check, tone: string) =>
            items.length > 0 && (
              <div>
                <h4 className={`flex items-center gap-1.5 font-display font-bold uppercase tracking-[0.1em] text-xs mb-2 ${tone}`}>
                  <Icon size={14} /> {heading}
                </h4>
                <ul className="space-y-1.5 font-body text-sm text-mono-charcoal">
                  {items.map((t, j) => <li key={j} className="leading-snug">{t}</li>)}
                </ul>
              </div>
            );
          return (
            <ModuleShell key={i} label="The Evidence" title={m.title ?? 'What we can and can’t stand behind'}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {col('Confirmed', m.confirmed, Check, 'text-emerald-700')}
                {col('Reported', m.reported, FileText, 'text-mono-amber-strong')}
                {col('Not claimed', m.notClaimed, CircleSlash, 'text-mono-gray')}
              </div>
            </ModuleShell>
          );
        }
        if (m.type === 'precedents') {
          return (
            <ModuleShell key={i} label="The Precedents" title={m.title ?? 'Comparable work, scored on the Index'}>
              <ul className="divide-y divide-mono-charcoal/15">
                {m.items.map((p) => (
                  <li key={p.slug}>
                    <Link href={p.href} className="group flex items-center justify-between gap-4 py-2.5">
                      <span className="font-body text-mono-charcoal group-hover:text-mono-black">
                        <span className="font-semibold">{p.brand}</span>
                        <span className="text-mono-gray"> — {p.title}</span>
                      </span>
                      <span className="flex items-center gap-1.5 shrink-0">
                        <span className="font-display font-bold text-mono-black tabular-nums">{p.score}</span>
                        <ArrowUpRight size={15} className="text-mono-gray group-hover:text-mono-amber-strong" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </ModuleShell>
          );
        }
        return null;
      })}
    </>
  );
}
