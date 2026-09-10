import Link from 'next/link';
import { ArrowLeft, ArrowRight, FileText, Lock, Scale } from 'lucide-react';
import Navigation from './Navigation';
import ReadingProgress from './ReadingProgress';
import { StatStrip, IndexScorecard, BarChart } from './dataviz/Charts';
import { isLocked, type Report } from '../../lib/reports';
import { isMember } from '../../lib/entitlements';
import { membershipsLive, reportCheckoutUrl, INDEX_REPORT } from '../../lib/commerce';

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

export default async function ReportFeature({ report }: { report: Report }) {
  const r = report;
  const live = r.status === 'live';
  // Gate once a purchase path exists — EITHER a recurring membership OR a one-off
  // pay-per-report link. This lets single reports be sold on their own (the cheap
  // fast-track) without requiring memberships to be live first. Free reports
  // never read the session.
  const membersLive = membershipsLive();
  const oneOffUrl = reportCheckoutUrl(r.slug);
  const premium = isLocked(r) && (membersLive || !!oneOffUrl);
  const locked = premium && !(await isMember());

  return (
    <div className="min-h-screen bg-mono-paper">
      <ReadingProgress />
      <Navigation />
      <header className="bg-mono-black text-mono-white py-16 md:py-24 border-b border-mono-white/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/reports"
            className="inline-flex items-center gap-2 text-xs tracking-[0.2em] font-display font-bold text-mono-gray hover:text-mono-amber-bright transition-colors mb-12"
          >
            <ArrowLeft size={14} /> REPORTS
          </Link>
          <div className="flex flex-wrap items-center gap-3 mb-7">
            <p className="text-xs tracking-[0.36em] font-display font-bold text-mono-amber-bright">{r.series}</p>
            <span className="text-[10px] tracking-[0.2em] px-2.5 py-1 bg-mono-amber text-mono-black font-display font-bold">
              {STATUS_LABEL[r.status]}
            </span>
          </div>
          <h1 className="max-w-5xl text-5xl md:text-7xl font-feature font-bold leading-[0.97]">{r.title}</h1>
          <p className="max-w-3xl mt-8 text-2xl md:text-3xl text-mono-soft-white font-feature italic leading-snug">{r.summary}</p>
          <div className="mt-12 pt-6 border-t border-mono-white/20 flex flex-wrap gap-x-8 gap-y-3 text-[11px] tracking-[0.19em] font-display font-bold text-mono-gray">
            <span className="text-mono-amber">{ACCESS_LABEL[r.access].toUpperCase()}</span>
            {r.statusNote && <span>{r.statusNote.toUpperCase()}</span>}
            {r.publishedAt && <span>{r.publishedAt}</span>}
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        {/* Exhibits — the weighty visual read. Shown above the body so they
            remain visible (and enticing) even when the analysis is gated. */}
        {(r.keyStats?.length || r.index || r.exhibit) && (
          <div className="mb-14 space-y-10">
            {r.keyStats && r.keyStats.length > 0 && <StatStrip items={r.keyStats} tone="light" />}
            {r.index && <IndexScorecard scores={r.index} />}
            {r.exhibit && <BarChart title={r.exhibit.title} note={r.exhibit.note} data={r.exhibit.data} />}
            {r.exhibits?.map((ex, i) => <BarChart key={i} title={ex.title} note={ex.note} data={ex.data} />)}
          </div>
        )}
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
            {!locked && r.counterCase && r.counterCase.points.length > 0 && (
              <section className="border border-mono-black bg-mono-black text-mono-white p-8 md:p-10">
                <div className="flex items-center gap-3 mb-5">
                  <Scale size={18} className="text-mono-amber-bright" />
                  <h2 className="text-[10px] tracking-[0.3em] text-mono-amber-bright font-display font-bold">
                    {(r.counterCase.heading || 'THE BEAR CASE').toUpperCase()}
                  </h2>
                </div>
                {r.counterCase.intro && (
                  <p className="text-lg text-mono-soft-white font-feature italic leading-snug mb-6">
                    {r.counterCase.intro}
                  </p>
                )}
                <ul className="space-y-4">
                  {r.counterCase.points.map((p, i) => (
                    <li key={i} className="flex gap-3 text-base text-mono-soft-white font-body leading-relaxed">
                      <span className="text-mono-amber-bright font-display font-bold shrink-0">—</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-6 pt-5 border-t border-mono-white/15 text-[11px] tracking-[0.14em] text-mono-gray font-body">
                  We publish the counter-case because a read you cannot argue against is a read you cannot trust. Where the evidence moves, this section moves first.
                </p>
              </section>
            )}
            {locked && r.counterCase && (
              // Ungated teaser of the counter-case: we show that the piece argues
              // against itself — the heading and framing — but hold the actual
              // counter-arguments behind the gate. It is a trust signal that
              // entices rather than gives away the analysis.
              <section className="border border-mono-black bg-mono-black text-mono-white p-8 md:p-10">
                <div className="flex items-center gap-3 mb-4">
                  <Scale size={18} className="text-mono-amber-bright" />
                  <h2 className="text-[10px] tracking-[0.3em] text-mono-amber-bright font-display font-bold">
                    {(r.counterCase.heading || 'THE BEAR CASE').toUpperCase()}
                  </h2>
                </div>
                {r.counterCase.intro && (
                  <p className="text-lg text-mono-soft-white font-feature italic leading-snug">{r.counterCase.intro}</p>
                )}
                <p className="mt-5 text-[13px] tracking-[0.04em] text-mono-gray font-body">
                  This report makes {r.counterCase.points.length} arguments against its own read — in full, inside the membership. We publish the counter-case because a read you cannot argue against is a read you cannot trust.
                </p>
              </section>
            )}
            {locked && (() => {
              // Two ways past the gate: the recurring membership (best value, all
              // reports) or a one-off purchase of just this report (pay-per-report).
              // The one-off CTA appears only once the Paystack link is configured.
              const oneOff = oneOffUrl;
              const price = INDEX_REPORT.priceLabel;
              // Copy adapts to the purchase paths actually live: both, membership-
              // only, or report-only (the pay-per-report fast-track).
              const blurb = membersLive
                ? (oneOff
                    ? 'Read every report with the Intelligence membership — or buy just this one.'
                    : 'The full report is part of the Intelligence membership.')
                : 'Buy the full report — instant access, one-time purchase.';
              return (
              <div className="border border-mono-amber bg-mono-soft-white p-8 text-center">
                <Lock className="mx-auto text-mono-amber mb-4" size={24} />
                <p className="text-xs tracking-[0.24em] font-display font-bold text-mono-amber mb-3">
                  {ACCESS_LABEL[r.access].toUpperCase()}
                </p>
                <p className="font-body text-mono-charcoal max-w-md mx-auto">{blurb}</p>
                <div className="mt-6 flex flex-wrap gap-3 justify-center">
                  {membersLive && (
                    <Link href="/membership" className="inline-flex items-center gap-2 bg-mono-black text-mono-white px-6 py-3 font-display font-bold hover:bg-mono-charcoal transition-colors">BECOME A MEMBER <ArrowRight size={16} /></Link>
                  )}
                  {oneOff && (
                    <a href={oneOff} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 px-6 py-3 font-display font-bold transition-colors ${membersLive ? 'bg-mono-amber text-mono-black hover:bg-mono-amber/90' : 'bg-mono-black text-mono-white hover:bg-mono-charcoal'}`}>
                      BUY THIS REPORT{price ? ` — ${price}` : ''} <ArrowRight size={16} />
                    </a>
                  )}
                  <Link href="/account?next=/reports" className="inline-flex items-center gap-2 border border-mono-black text-mono-black px-6 py-3 font-display font-bold hover:bg-mono-white transition-colors">SIGN IN</Link>
                </div>
                {oneOff && (
                  <p className="mt-4 text-[11px] tracking-[0.04em] text-mono-gray font-body">One-time purchase · secure checkout via Paystack</p>
                )}
              </div>
              );
            })()}
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
      </div>
    </div>
  );
}
