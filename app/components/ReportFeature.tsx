import Link from 'next/link';
import { ArrowLeft, ArrowRight, FileText, Lock } from 'lucide-react';
import Navigation from './Navigation';
import { isLocked, type Report } from '../../lib/reports';

const ACCESS_LABEL: Record<Report['access'], string> = {
  open: 'Open Signal Briefing',
  premium: 'Premium Report',
  partner: 'Partner Edition',
};

const STATUS_LABEL: Record<Report['status'], string> = {
  live: 'LIVE',
  'in-development': 'IN DEVELOPMENT',
  planned: 'PLANNED',
};

export default function ReportFeature({ report }: { report: Report }) {
  const r = report;
  const live = r.status === 'live';
  const locked = isLocked(r);

  return (
    <div className="min-h-screen bg-mono-white">
      <Navigation />
      <header className="bg-mono-black text-mono-white py-16 md:py-24 border-b border-mono-white/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/reports"
            className="inline-flex items-center gap-2 text-xs tracking-[0.2em] font-display font-bold text-mono-gray hover:text-mono-amber transition-colors mb-12"
          >
            <ArrowLeft size={14} /> REPORTS
          </Link>
          <div className="flex flex-wrap items-center gap-3 mb-7">
            <p className="text-xs tracking-[0.36em] font-display font-bold text-mono-amber">{r.series}</p>
            <span className="text-[10px] tracking-[0.2em] px-2.5 py-1 bg-mono-amber text-mono-white font-display font-bold">
              {STATUS_LABEL[r.status]}
            </span>
          </div>
          <h1 className="max-w-5xl text-5xl md:text-7xl font-display font-bold leading-[0.96]">{r.title}</h1>
          <p className="max-w-3xl mt-8 text-xl md:text-2xl text-mono-soft-white font-body leading-relaxed">{r.summary}</p>
          <div className="mt-12 pt-6 border-t border-mono-white/20 flex flex-wrap gap-x-8 gap-y-3 text-[11px] tracking-[0.19em] font-display font-bold text-mono-gray">
            <span className="text-mono-amber">{ACCESS_LABEL[r.access].toUpperCase()}</span>
            {r.statusNote && <span>{r.statusNote.toUpperCase()}</span>}
            {r.publishedAt && <span>{r.publishedAt}</span>}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        {live && r.sections && r.sections.length > 0 ? (
          // Published report: render the body. If it's a locked tier, show only
          // the opening section as a teaser behind the gate.
          <article className="space-y-12">
            {(locked ? r.sections.slice(0, 1) : r.sections).map((section, i) => (
              <section key={i}>
                <h2 className="text-[10px] tracking-[0.3em] text-mono-amber font-display font-bold mb-5">
                  {section.heading.toUpperCase()}
                </h2>
                <div className="space-y-5 text-lg text-mono-charcoal font-body leading-relaxed">
                  {section.paragraphs.map((p, j) => (
                    <p key={j}>{p}</p>
                  ))}
                </div>
              </section>
            ))}
            {locked && (
              <div className="border border-mono-amber bg-mono-soft-white p-8 text-center">
                <Lock className="mx-auto text-mono-amber mb-4" size={24} />
                <p className="text-xs tracking-[0.24em] font-display font-bold text-mono-amber mb-3">
                  {ACCESS_LABEL[r.access].toUpperCase()}
                </p>
                <p className="font-body text-mono-charcoal max-w-md mx-auto">
                  The full report is part of the Intelligence tier.
                </p>
              </div>
            )}
          </article>
        ) : (
          // Not yet published: an honest commissioning state, not a dead end.
          <div className="space-y-10">
            <div className="border-l-4 border-mono-amber bg-mono-soft-white p-6 md:p-8">
              <FileText className="text-mono-amber mb-4" size={24} />
              <p className="text-xs tracking-[0.24em] font-display font-bold text-mono-amber mb-3">
                {STATUS_LABEL[r.status]} · {ACCESS_LABEL[r.access].toUpperCase()}
              </p>
              <p className="font-body text-lg text-mono-charcoal leading-relaxed">
                This edition is {r.status === 'in-development' ? 'in active development' : 'on the commissioning slate'}
                {r.statusNote ? ` (${r.statusNote})` : ''}. It will publish as a source-verified, designed report once
                the research and editorial work are complete.
              </p>
            </div>

            <div>
              <p className="text-[10px] tracking-[0.3em] text-mono-amber font-display font-bold mb-5">WHAT IT WILL COVER</p>
              <div className="flex flex-wrap gap-2">
                {r.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] tracking-[0.16em] border border-mono-gray/30 px-4 py-2.5 font-display font-bold text-mono-charcoal"
                  >
                    {tag.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                href="/intelligence/source-desk"
                className="inline-flex items-center gap-2 bg-mono-black text-mono-white px-6 py-3.5 font-display font-bold"
              >
                SEE THE EVIDENCE METHOD <ArrowRight size={16} />
              </Link>
              <Link
                href="/reports"
                className="inline-flex items-center gap-2 border border-mono-black text-mono-black px-6 py-3.5 font-display font-bold"
              >
                ALL EDITIONS
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
