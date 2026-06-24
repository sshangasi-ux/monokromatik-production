import Link from 'next/link';
import { ArrowLeft, ArrowRight, BookOpen, ShieldCheck } from 'lucide-react';
import Navigation from './Navigation';
import ReadingProgress from './ReadingProgress';

export interface EditorialSource {
  label: string;
  publisher: string;
  href: string;
  use: string;
}

interface IssueFeatureProps {
  franchise: string;
  title: string;
  standfirst: string;
  readingTime: string;
  market: string;
  evidence: 'SOURCE-LED ANALYSIS' | 'EDITORIAL ESSAY' | 'COMMISSIONING BRIEF' | 'SIGNAL BRIEFING';
  children: React.ReactNode;
  sources: EditorialSource[];
  next?: { label: string; href: string };
  /** The issue this feature belongs to (back-link + masthead). Defaults to "001". */
  issueNumber?: string;
}

export function FeatureSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="py-8 border-t border-mono-gray/20 first:border-t-0 first:pt-0">
      <p className="text-[10px] tracking-[0.3em] text-mono-amber font-display font-bold mb-5">{title.toUpperCase()}</p>
      <div className="space-y-5 text-lg text-mono-charcoal font-body leading-relaxed">{children}</div>
    </section>
  );
}

export function PullQuote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="my-12 border-y border-mono-black py-9 text-3xl md:text-4xl text-mono-black font-display font-bold leading-tight">
      {children}
    </blockquote>
  );
}

export default function IssueFeature({ franchise, title, standfirst, readingTime, market, evidence, children, sources, next, issueNumber = '001' }: IssueFeatureProps) {
  return (
    <div className="min-h-screen bg-mono-paper">
      <ReadingProgress />
      <Navigation />
      <header className="bg-mono-black text-mono-white py-16 md:py-24 border-b border-mono-white/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href={`/issues/${issueNumber}`} className="inline-flex items-center gap-2 text-xs tracking-[0.2em] font-display font-bold text-mono-gray hover:text-mono-amber-bright transition-colors mb-12">
            <ArrowLeft size={14} /> ISSUE {issueNumber}
          </Link>
          <p className="text-xs tracking-[0.36em] font-display font-bold text-mono-amber-bright mb-7">{franchise}</p>
          <h1 className="max-w-5xl text-5xl md:text-7xl font-feature font-bold leading-[0.97]">{title}</h1>
          <p className="max-w-3xl mt-8 text-2xl md:text-3xl text-mono-soft-white font-feature italic leading-snug">{standfirst}</p>
          <div className="mt-12 pt-6 border-t border-mono-white/20 flex flex-wrap gap-x-8 gap-y-3 text-[11px] tracking-[0.19em] font-display font-bold text-mono-gray">
            <span className="text-mono-amber">{evidence}</span>
            <span>{market}</span>
            <span>{readingTime}</span>
            <span>MONOKROMATIK / ISSUE {issueNumber}</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 grid lg:grid-cols-[minmax(0,760px)_300px] gap-14">
        <article className="min-w-0">{children}</article>
        <aside className="lg:sticky lg:top-28 h-fit space-y-8">
          <div className="bg-mono-soft-white border-l-4 border-mono-amber p-6">
            <ShieldCheck className="text-mono-amber mb-5" size={22} />
            <p className="text-xs tracking-[0.24em] font-display font-bold text-mono-amber mb-3">EVIDENCE STANDARD</p>
            <p className="font-body text-sm text-mono-charcoal leading-relaxed">Facts are distinguished from Monokromatik interpretation. The sources listed below informed this feature and are cited for verification.</p>
          </div>
          <div className="border border-mono-gray/20 p-6">
            <p className="text-xs tracking-[0.24em] font-display font-bold text-mono-amber mb-5">SOURCES</p>
            <div className="space-y-5">
              {sources.map((source) => (
                <a key={source.href} href={source.href} target="_blank" rel="noreferrer" className="block group">
                  <p className="text-xs font-display font-bold text-mono-black group-hover:text-mono-amber">{source.publisher}</p>
                  <p className="mt-1 text-sm font-body text-mono-charcoal">{source.label}</p>
                  <p className="mt-2 text-[11px] font-body text-mono-gray">Use: {source.use}</p>
                </a>
              ))}
            </div>
          </div>
          <Link href="/intelligence/source-desk" className="block border border-mono-black p-6 hover:border-mono-amber transition-colors">
            <BookOpen className="text-mono-amber mb-4" size={20} />
            <p className="font-display font-bold text-mono-black">Explore the Source Desk</p>
            <p className="text-sm font-body text-mono-charcoal mt-2">How Monokromatik converts sources into intelligence.</p>
          </Link>
        </aside>
      </main>

      {next && (
        <section className="bg-mono-black text-mono-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div><p className="text-xs tracking-[0.28em] text-mono-amber font-display font-bold mb-4">CONTINUE ISSUE {issueNumber}</p><h2 className="text-3xl font-display font-bold">{next.label}</h2></div>
            <Link href={next.href} className="inline-flex items-center gap-2 bg-mono-amber text-mono-black px-7 py-4 font-display font-bold">READ NEXT <ArrowRight size={18} /></Link>
          </div>
        </section>
      )}
    </div>
  );
}
