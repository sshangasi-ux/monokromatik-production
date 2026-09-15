import Link from 'next/link';
import { ArrowLeft, ArrowRight, FileText, Lock, Scale } from 'lucide-react';
import Navigation from './Navigation';
import ReadingProgress from './ReadingProgress';
import { StatStrip, IndexScorecard, ReportExhibit } from './dataviz/Charts';
import { isLocked, type Report } from '../../lib/reports';
import { isMember } from '../../lib/entitlements';
import { membershipsLive, reportCheckoutUrl, reportPrice, reportLaunchNote, reportEnterprise } from '../../lib/commerce';

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

/** Human date for the report meta — never show a raw ISO timestamp. */
function fmtDate(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

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
            {locked && oneOffUrl && <span className="text-mono-amber-bright">{reportPrice(r.slug)} · ONE-TIME</span>}
            {r.statusNote && <span>{r.statusNote.toUpperCase()}</span>}
            {r.publishedAt && <span>{fmtDate(r.publishedAt).toUpperCase()}</span>}
          </div>
          {/* Early value + price anchor — so a mobile reader sees the offer near
              the top instead of scrolling the full standfirst first. */}
          {locked && oneOffUrl && (
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
              <a
                href={oneOffUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-mono-amber text-mono-black px-6 py-3.5 font-display font-bold hover:bg-mono-amber/90 transition-colors"
              >
                BUY THIS REPORT — {reportPrice(r.slug)} <ArrowRight size={16} />
              </a>
              <span className="text-[11px] tracking-[0.06em] font-body text-mono-gray">
                One-time · secure Paystack checkout · delivered as a PDF
              </span>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        {/* Exhibits — the weighty visual read. Shown above the body so they
            remain visible (and enticing) even when the analysis is gated. */}
        {(r.keyStats?.length || r.index || r.exhibit) && (
          <div className="mb-14 space-y-10">
            {r.keyStats && r.keyStats.length > 0 && <StatStrip items={r.keyStats} tone="light" />}
            {r.index && <IndexScorecard scores={r.index} />}
            {r.exhibit && <ReportExhibit exhibit={r.exhibit} />}
            {r.exhibits?.map((ex, i) => <ReportExhibit key={i} exhibit={ex} />)}
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
              const price = reportPrice(r.slug);
              const launchNote = reportLaunchNote(r.slug);
              const enterprise = reportEnterprise(r.slug);
              // Copy adapts to the purchase paths actually live: both, membership-
              // only, or report-only (the pay-per-report fast-track).
              const blurb = oneOff
                ? 'Buy this report for instant access — delivered as a PDF.'
                : membersLive
                  ? 'The full report is part of the Intelligence membership.'
                  : 'Buy the full report — instant access, one-time purchase.';
              return (
              <>
              <div className="border border-mono-amber bg-mono-soft-white p-8 text-center">
                <Lock className="mx-auto text-mono-amber mb-4" size={24} />
                <p className="text-xs tracking-[0.24em] font-display font-bold text-mono-amber mb-3">
                  {ACCESS_LABEL[r.access].toUpperCase()}
                </p>
                <p className="font-body text-mono-charcoal max-w-md mx-auto">{blurb}</p>
                <div className="mt-6 flex flex-col items-center gap-3">
                  {oneOff && (
                    <a href={oneOff} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-mono-amber text-mono-black px-8 py-4 font-display font-bold text-base hover:bg-mono-amber/90 transition-colors">
                      BUY THIS REPORT{price ? ` — ${price}` : ''} <ArrowRight size={18} />
                    </a>
                  )}
                  <div className="flex flex-wrap gap-3 justify-center">
                    {membersLive && (
                      <Link href="/membership" className="inline-flex items-center gap-2 border border-mono-black text-mono-black px-6 py-3 font-display font-bold hover:bg-mono-white transition-colors">BECOME A MEMBER <ArrowRight size={16} /></Link>
                    )}
                    <Link href="/account?next=/reports" className="inline-flex items-center gap-2 border border-mono-black text-mono-black px-6 py-3 font-display font-bold hover:bg-mono-white transition-colors">SIGN IN</Link>
                  </div>
                </div>
                {oneOff && (
                  <p className="mt-4 text-[11px] tracking-[0.04em] text-mono-gray font-body">
                    One-time purchase · secure checkout via Paystack
                    {launchNote ? ` · ${launchNote}` : ''}
                  </p>
                )}
              </div>
              {/* Enterprise upsell — for flagship (report-tier) editions, the real
                  value on the asset sits above a single-copy sale: the report plus
                  the data, a briefing, and license rights. Routed to the desk. */}
              {enterprise && (
                <div className="mt-4 border border-mono-black bg-mono-black text-mono-white p-6 md:p-7">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <p className="text-[10px] tracking-[0.28em] font-display font-bold text-mono-amber-bright">ENTERPRISE &amp; LICENSE</p>
                    <p className="text-[11px] tracking-[0.14em] font-display font-bold text-mono-soft-white">{enterprise.priceFrom}</p>
                  </div>
                  <p className="mt-3 font-body text-[15px] text-mono-soft-white leading-relaxed">{enterprise.blurb}</p>
                  <Link
                    href="/work-with-us?interest=license"
                    className="mt-5 inline-flex items-center gap-2 bg-mono-amber text-mono-black px-6 py-3 font-display font-bold hover:bg-mono-amber/90 transition-colors"
                  >
                    TALK TO THE DESK <ArrowRight size={16} />
                  </Link>
                </div>
              )}
              </>
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
        {locked && oneOffUrl && <div className="h-20 md:hidden" aria-hidden />}
      </div>
      {/* Sticky mobile BUY bar — keeps the ask visible at any scroll depth, since
          the gate otherwise sits well below the standfirst + exhibits on mobile. */}
      {locked && oneOffUrl && (
        <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-mono-black/95 backdrop-blur border-t border-mono-amber/40 px-4 py-3 flex items-center justify-between gap-3">
          <div className="leading-tight min-w-0">
            <div className="text-[9px] tracking-[0.18em] font-display font-bold text-mono-gray truncate">{r.series.toUpperCase()}</div>
            <div className="text-sm font-display font-bold text-mono-white">
              {reportPrice(r.slug)}<span className="text-mono-gray font-body font-normal text-xs"> · one-time</span>
            </div>
          </div>
          <a
            href={oneOffUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-1.5 bg-mono-amber text-mono-black px-5 py-2.5 font-display font-bold text-sm"
          >
            BUY <ArrowRight size={15} />
          </a>
        </div>
      )}
    </div>
  );
}
