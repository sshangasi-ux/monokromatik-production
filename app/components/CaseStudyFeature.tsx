import Link from 'next/link';
import { ArrowLeft, ArrowRight, BookOpen, ShieldCheck, Lock, Film } from 'lucide-react';
import Navigation from './Navigation';
import { FeatureSection, PullQuote } from './IssueFeature';
import { AttributedImage, AttributedImagePair, type AttributedImageAsset } from './AttributedMedia';
import { SignalStrength } from './dataviz/Charts';
import ReadingProgress from './ReadingProgress';
import TrackView from './TrackView';
import SignalScore from './SignalScore';
import { isLocked, type CaseStudy } from '../../lib/case-studies';
import { isMember } from '../../lib/entitlements';
import { membershipsLive } from '../../lib/commerce';
import { compositeScore } from '../../lib/signal-index';

// The evidence-standard label shown in the header, keyed off the analysis
// confidence. A verified, source-anchored decode reads differently from an
// openly interpretive one — say which.
const EVIDENCE_LABEL: Record<CaseStudy['verification'], string> = {
  verified: 'SOURCE-LED ANALYSIS',
  partial: 'SOURCE-LED ANALYSIS',
  interpretive: 'EDITORIAL DECODE',
};

// CaseStudyMedia has optional caption/sourceLabel/sourceHref; AttributedImage
// wants them present. Coerce to the strict shape with safe fallbacks.
function toAsset(m: CaseStudy['media'][number]): AttributedImageAsset {
  return {
    src: m.src,
    alt: m.alt,
    caption: m.caption ?? '',
    credit: m.credit,
    sourceLabel: m.sourceLabel ?? m.credit,
    sourceHref: m.sourceHref ?? '#',
  };
}

export default async function CaseStudyFeature({
  caseStudy,
  next,
}: {
  caseStudy: CaseStudy;
  next?: { label: string; href: string };
}) {
  const c = caseStudy;
  const media = c.media.map(toAsset);
  // Gate only premium studies, and only once memberships are purchasable — so
  // marking content premium is safe before billing is live. Free studies never
  // read the session, so they stay statically rendered.
  const premium = isLocked(c) && membershipsLive();
  const locked = premium && !(await isMember());
  const signalScore = compositeScore(c.decode);

  return (
    <div className="min-h-screen bg-mono-paper">
      <ReadingProgress />
      <TrackView event="case_study_view" params={{ slug: c.slug, brand: c.brand }} />
      <Navigation />
      <header className="bg-mono-black text-mono-white py-16 md:py-24 border-b border-mono-white/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/intelligence/case-studies"
            className="inline-flex items-center gap-2 text-xs tracking-[0.2em] font-display font-bold text-mono-gray hover:text-mono-amber-bright transition-colors mb-12"
          >
            <ArrowLeft size={14} /> CASE STUDIES
          </Link>
          <p className="text-xs tracking-[0.36em] font-display font-bold text-mono-amber-bright mb-7">
            THE WORK / CASE STUDY
          </p>
          <h1 className="max-w-5xl text-5xl md:text-7xl font-feature font-bold leading-[0.97]">{c.title}</h1>
          <p className="max-w-3xl mt-8 text-2xl md:text-3xl text-mono-soft-white font-feature italic leading-snug">
            {c.standfirst}
          </p>
          <div className="mt-12 pt-6 border-t border-mono-white/20 flex flex-wrap gap-x-8 gap-y-3 text-[11px] tracking-[0.19em] font-display font-bold text-mono-gray">
            <span className="text-mono-amber">{EVIDENCE_LABEL[c.verification]}</span>
            <span>{c.market}</span>
            {c.readingTime && <span>{c.readingTime}</span>}
            <span>{c.collection.toUpperCase()}</span>
          </div>
          {c.related && (
            <Link
              href={c.related.href}
              className="mt-8 inline-flex items-center gap-2 text-xs tracking-[0.18em] font-display font-bold text-mono-amber hover:text-mono-white transition-colors"
            >
              {c.related.label.toUpperCase()} <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 grid lg:grid-cols-[minmax(0,760px)_300px] gap-14">
        <article className="min-w-0">
          {/* The decode matrix — the four-axis editorial read. */}
          <FeatureSection title="The Monokromatik decode">
            {signalScore !== null && (
              <div className="not-prose mb-6 flex items-end justify-between gap-5 border-b border-mono-gray/25 pb-5">
                <p className="text-sm text-mono-gray font-body max-w-md">
                  Our editorial read across the four dimensions we use to assess creative work — an
                  authorship-weighted Cultural-Signal Score, reflecting judgement, not a measured metric.
                </p>
                <SignalScore score={signalScore} size="lg" />
              </div>
            )}
            <div className="not-prose mt-6 grid sm:grid-cols-2 gap-px border border-mono-gray/25 bg-mono-gray/25">
              {c.decode.map((d) => (
                <div key={d.label} className="bg-mono-white p-5">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[11px] tracking-[0.22em] font-display font-bold text-mono-amber-strong">
                      {d.label}
                    </span>
                    <SignalStrength level={d.level} tone="light" />
                  </div>
                  <p className="mt-3 text-sm font-body text-mono-charcoal leading-relaxed">{d.note}</p>
                </div>
              ))}
            </div>
          </FeatureSection>

          <FeatureSection title="The context">
            {c.context.map((p, i) => (
              <p key={i} className={i === 0 ? 'dropcap' : undefined}>{p}</p>
            ))}
          </FeatureSection>

          {media[0] && <AttributedImage asset={media[0]} feature />}

          {locked ? (
            <div className="my-12 border border-mono-amber bg-mono-soft-white p-8 text-center">
              <Lock className="mx-auto text-mono-amber mb-4" size={24} />
              <p className="text-xs tracking-[0.24em] font-display font-bold text-mono-amber mb-3">PREMIUM CASE STUDY</p>
              <p className="font-body text-mono-charcoal max-w-md mx-auto">
                The full strategic decode — the bet, the creative move, the evidence ledger and the lessons — is part
                of the Intelligence membership.
              </p>
              <div className="mt-6 flex flex-wrap gap-3 justify-center">
                <Link href="/membership" className="inline-flex items-center gap-2 bg-mono-black text-mono-white px-6 py-3 font-display font-bold hover:bg-mono-charcoal transition-colors">BECOME A MEMBER <ArrowRight size={16} /></Link>
                <Link href="/account?next=/intelligence/case-studies" className="inline-flex items-center gap-2 border border-mono-black text-mono-black px-6 py-3 font-display font-bold hover:bg-mono-white transition-colors">SIGN IN</Link>
              </div>
            </div>
          ) : (
            <>
              {c.pullQuotes?.[0] && <PullQuote>{c.pullQuotes[0]}</PullQuote>}

              <FeatureSection title="The strategic bet">
                {c.strategicBet.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </FeatureSection>

              <FeatureSection title="The creative move">
                {c.creativeMove.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </FeatureSection>

              {media.length > 1 && <AttributedImagePair assets={media.slice(0, 2)} />}

              {c.videoUrl && (
                <figure className="my-10">
                  <div className="aspect-video overflow-hidden bg-mono-charcoal border border-mono-gray/20">
                    {c.videoType === 'file' ? (
                      <video src={c.videoUrl} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                    ) : (
                      <iframe
                        src={c.videoUrl.includes('vimeo.com')
                          ? c.videoUrl.replace('vimeo.com/', 'player.vimeo.com/video/')
                          : c.videoUrl.replace('watch?v=', 'embed/')}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    )}
                  </div>
                  {c.videoCredit && (
                    <figcaption className="mt-3 flex items-center gap-2 text-[10px] tracking-[0.16em] font-display font-bold text-mono-gray">
                      <Film size={13} className="text-mono-amber shrink-0" />
                      {c.videoSourceUrl ? (
                        <a href={c.videoSourceUrl} target="_blank" rel="noopener noreferrer" className="text-mono-amber-strong hover:text-mono-amber-hover hover:underline">{c.videoCredit}</a>
                      ) : (
                        <span>{c.videoCredit}</span>
                      )}
                    </figcaption>
                  )}
                </figure>
              )}

              <FeatureSection title="The evidence">
                {c.evidence.confirmed.map((e, i) => (
                  <p key={`c${i}`}>
                    <strong>Confirmed:</strong> {e}
                  </p>
                ))}
                {c.evidence.reported.map((e, i) => (
                  <p key={`r${i}`}>
                    <strong>Reported independently:</strong> {e}
                  </p>
                ))}
                {c.evidence.notClaimed.map((e, i) => (
                  <p key={`n${i}`}>
                    <strong>Not claimed at this stage:</strong> {e}
                  </p>
                ))}
              </FeatureSection>

              {c.pullQuotes?.[1] && <PullQuote>{c.pullQuotes[1]}</PullQuote>}

              <FeatureSection title="The African read">
                {c.africanRead.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </FeatureSection>

              <FeatureSection title="Lessons for brand builders">
                {c.lessons.map((l, i) => (
                  <p key={i}>
                    <strong>{l.title}</strong> {l.body}
                  </p>
                ))}
              </FeatureSection>

              {c.verificationNote && (
                <FeatureSection title="Publication verification status">
                  <p>{c.verificationNote}</p>
                </FeatureSection>
              )}
            </>
          )}
        </article>

        <aside className="lg:sticky lg:top-28 h-fit space-y-8">
          <div className="bg-mono-soft-white border-l-4 border-mono-amber p-6">
            <ShieldCheck className="text-mono-amber mb-5" size={22} />
            <p className="text-xs tracking-[0.24em] font-display font-bold text-mono-amber mb-3">EVIDENCE STANDARD</p>
            <p className="font-body text-sm text-mono-charcoal leading-relaxed">
              Facts are distinguished from Monokromatik interpretation. The sources listed below informed this case
              study and are cited for verification.
            </p>
          </div>
          <div className="border border-mono-gray/20 p-6">
            <p className="text-xs tracking-[0.24em] font-display font-bold text-mono-amber mb-5">SOURCES</p>
            <div className="space-y-5">
              {c.sources.map((source) => (
                <a key={source.href} href={source.href} target="_blank" rel="noreferrer" className="block group">
                  <p className="text-xs font-display font-bold text-mono-black group-hover:text-mono-amber">
                    {source.publisher}
                  </p>
                  <p className="mt-1 text-sm font-body text-mono-charcoal">{source.label}</p>
                  <p className="mt-2 text-[11px] font-body text-mono-gray">Use: {source.use}</p>
                </a>
              ))}
            </div>
          </div>
          <Link
            href="/intelligence/source-desk"
            className="block border border-mono-black p-6 hover:border-mono-amber transition-colors"
          >
            <BookOpen className="text-mono-amber mb-4" size={20} />
            <p className="font-display font-bold text-mono-black">Explore the Source Desk</p>
            <p className="text-sm font-body text-mono-charcoal mt-2">
              How Monokromatik converts sources into intelligence.
            </p>
          </Link>
        </aside>
      </div>

      {next && (
        <section className="bg-mono-black text-mono-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
              <p className="text-xs tracking-[0.28em] text-mono-amber font-display font-bold mb-4">NEXT CASE STUDY</p>
              <h2 className="text-3xl font-display font-bold">{next.label}</h2>
            </div>
            <Link
              href={next.href}
              className="inline-flex items-center gap-2 bg-mono-amber text-mono-black px-7 py-4 font-display font-bold"
            >
              READ NEXT <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
