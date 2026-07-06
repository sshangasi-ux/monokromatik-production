import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Navigation from './Navigation';

/** Shared shell for the legal/policy pages (Terms, Refunds, Privacy). */
export default function LegalPage({
  eyebrow,
  title,
  intro,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-mono-paper">
      <Navigation />
      <header className="bg-mono-black text-mono-white py-16 md:py-24 border-b border-mono-white/15">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center gap-2 text-xs tracking-[0.2em] font-display font-bold text-mono-gray hover:text-mono-amber-bright transition-colors mb-12">
            <ArrowLeft size={14} /> MONOKROMATIK
          </Link>
          <p className="text-xs tracking-[0.35em] font-display font-bold text-mono-amber mb-6">{eyebrow}</p>
          <h1 className="text-4xl md:text-6xl font-display font-bold leading-[0.98]">{title}</h1>
          <p className="mt-7 max-w-2xl text-lg text-mono-soft-white font-body leading-relaxed">{intro}</p>
          <p className="mt-6 text-[11px] tracking-[0.18em] font-display font-bold text-mono-gray">LAST UPDATED · {updated}</p>
        </div>
      </header>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="legal-prose space-y-10 font-body text-mono-charcoal leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

/** A titled policy section. */
export function LegalSection({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-xs tracking-[0.28em] font-display font-bold text-mono-amber-strong mb-4">{n} · {title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
