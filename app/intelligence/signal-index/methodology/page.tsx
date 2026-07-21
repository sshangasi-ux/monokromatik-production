import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, ArrowLeft, ShieldCheck, Scale, GitBranch, Database, PenLine, FileCheck2 } from 'lucide-react';
import Navigation from '../../../components/Navigation';
import SignalScore from '../../../components/SignalScore';
import { AXIS_WEIGHTS, SIGNAL_BANDS, compositeScore } from '../../../../lib/signal-index';
import { getCaseStudyBySlug } from '../../../../lib/case-studies';

export const revalidate = 3600;

const SITE = 'https://www.monokromatik.com';

export const metadata: Metadata = {
  title: 'Methodology — The Cultural-Signal Index | MonoKromatik',
  description:
    'How the Cultural-Signal Score is built: an authorship-weighted composite of four editorial dimensions — idea, authorship, execution and consequence — scored 1–5 and expressed out of 100. What it is, and what it is not.',
  alternates: { canonical: `${SITE}/intelligence/signal-index/methodology` },
  openGraph: {
    title: 'How the Cultural-Signal Index is scored',
    description: 'Authorship-weighted, evidence-led, editor-set. The full methodology behind the Index.',
    url: `${SITE}/intelligence/signal-index/methodology`,
  },
};

const AXES: { label: string; what: string; raises: string; lowers: string }[] = [
  {
    label: 'IDEA',
    what: 'The originality and cultural force of the central idea — how far it departs from convention and how specifically it speaks from, not merely about, the culture.',
    raises: 'A genuinely new form; a culturally precise insight; an idea only this author could have had.',
    lowers: 'A borrowed template; a trend chased late; cultural reference as decoration.',
  },
  {
    label: 'AUTHORSHIP',
    what: 'Who actually shaped the work — African and diaspora creative leadership versus localisation of a decision made elsewhere. The question MonoKromatik exists to ask.',
    raises: 'African creatives holding the pen on concept, design and direction; ownership of the IP and the upside.',
    lowers: 'A global team localising; African talent as the face but not the author; value captured offshore.',
  },
  {
    label: 'EXECUTION',
    what: 'Craft and coherence — narrative, design, product detail and the discipline of finishing. Whether the idea is realised at the level it deserves.',
    raises: 'Precise craft; a coherent system across touchpoints; detail that rewards attention.',
    lowers: 'A strong idea undercut by rough delivery; inconsistency; unfinished edges.',
  },
  {
    label: 'CONSEQUENCE',
    what: 'What the work actually moved — in culture and in commerce. Evidence of effect, not just ambition or reach.',
    raises: 'A measurable shift; a category reframed; durable commercial or cultural outcome.',
    lowers: 'Visibility without effect; a moment that left nothing behind; claims without evidence.',
  },
];

export default function MethodologyPage() {
  // JSON-LD: a definedTermSet so the scoring rubric is citable/structured.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'How the Cultural-Signal Index is scored',
    about: 'Methodology of the MonoKromatik Cultural-Signal Index',
    url: `${SITE}/intelligence/signal-index/methodology`,
    publisher: { '@type': 'Organization', name: 'MonoKromatik', url: SITE },
    isPartOf: { '@type': 'Dataset', name: 'The Cultural-Signal Index', url: `${SITE}/intelligence/signal-index` },
  };

  return (
    <div className="min-h-screen bg-mono-paper">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navigation />

      <header className="bg-mono-black text-mono-white py-16 md:py-24 border-b border-mono-white/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/intelligence/signal-index" className="inline-flex items-center gap-2 text-xs tracking-[0.2em] font-display font-bold text-mono-gray hover:text-mono-amber-bright transition-colors mb-12">
            <ArrowLeft size={14} /> THE CULTURAL-SIGNAL INDEX
          </Link>
          <p className="text-xs tracking-[0.35em] font-display font-bold text-mono-amber mb-6">METHODOLOGY</p>
          <h1 className="max-w-4xl text-5xl md:text-7xl font-display font-bold leading-[0.95]">How the score is built.</h1>
          <p className="mt-8 max-w-2xl text-lg md:text-xl text-mono-soft-white font-body leading-relaxed">
            The Cultural-Signal Score is an authorship-weighted composite of four editorial dimensions — each scored
            1–5 and expressed out of 100. It is a defensible, evidence-led reading. This is exactly how it works, and
            exactly what it is not.
          </p>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 space-y-16">
        <section>
          <div className="flex items-center gap-3 mb-5">
            <Scale className="text-mono-amber" size={22} />
            <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong">THE FORMULA</p>
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-mono-black">Four axes, one authorship-weighted score.</h2>
          <p className="mt-6 font-body text-lg text-mono-charcoal leading-relaxed">
            Each work is read across four axes and scored <strong>1–5</strong> on each. The axes are normalised and
            combined into a weighted composite expressed out of 100. The weighting is deliberate: authorship carries
            more than any other dimension, because authorship is the question this publication is built to ask.
          </p>
          <div className="mt-8 border border-mono-gray/25 bg-mono-white">
            {(['IDEA', 'AUTHORSHIP', 'EXECUTION', 'CONSEQUENCE'] as const).map((label) => {
              const pct = Math.round((AXIS_WEIGHTS[label] ?? 0) * 100);
              return (
                <div key={label} className="flex items-center gap-4 px-5 py-4 border-b border-mono-gray/15 last:border-b-0">
                  <span className="w-32 text-[11px] tracking-[0.22em] font-display font-bold text-mono-black">{label}</span>
                  <div className="flex-1 h-2 bg-mono-soft-white overflow-hidden">
                    <div className="h-full bg-mono-amber" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-12 text-right text-sm font-display font-bold text-mono-black tabular-nums">{pct}%</span>
                </div>
              );
            })}
          </div>
          <p className="mt-5 font-body text-sm text-mono-gray">
            Composite = Σ ( axis level ÷ 5 × axis weight ) × 100, rounded. A brand&rsquo;s Index score is the mean
            composite across its scored works.
          </p>
        </section>

        {/* The published band cut-offs. Brand Finance, Interbrand, Kantar and YouGov
            all publish a score; none publishes the boundaries behind it. Ours are
            fixed and versioned — changing them is a dated methodology change. */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <Scale className="text-mono-amber" size={22} />
            <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong">THE BANDS</p>
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-mono-black">
            A rating, not a mark out of a hundred.
          </h2>
          <p className="mt-6 font-body text-lg text-mono-charcoal leading-relaxed">
            The composite maps to a letter band. The cut-offs are fixed and published here — most rating
            providers publish a score but keep the boundaries behind it private. Ours are open, so anyone can
            check that a number and its band agree.
          </p>
          <div className="mt-8 border border-mono-gray/25 bg-mono-white">
            {SIGNAL_BANDS.map((b, i) => {
              const upper = i === 0 ? 100 : SIGNAL_BANDS[i - 1].min - 1;
              return (
                <div key={b.band} className="flex items-center gap-4 px-5 py-4 border-b border-mono-gray/15 last:border-b-0">
                  <span className="w-14 shrink-0 text-center text-sm font-display font-bold text-mono-black border border-mono-black/25 py-1">
                    {b.band}
                  </span>
                  <span className="w-20 shrink-0 text-sm font-display font-bold text-mono-gray tabular-nums">
                    {b.min === 0 ? '< 40' : `${b.min}–${upper}`}
                  </span>
                  <span className="font-body text-sm text-mono-charcoal">{b.label}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Worked examples — computed from the live data, so the page can never
            drift from the scores it claims to explain. One at each end of the
            scale: a rating that only publishes its top band isn't a rating. */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <FileCheck2 className="text-mono-amber" size={22} />
            <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong">WORKED EXAMPLES</p>
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-mono-black">
            Here is the arithmetic, on two real works.
          </h2>
          <p className="mt-6 font-body text-lg text-mono-charcoal leading-relaxed">
            One at the top of the scale and one near the bottom. Both are live case studies; the numbers below are
            read from the same data that powers the Index, so they cannot drift from what we actually published.
          </p>
          <div className="mt-8 space-y-8">
            {(['checkers-sixty60-retail-moat', 'showmax-relaunch-under-canal'] as const).map((slug) => {
              const study = getCaseStudyBySlug(slug);
              if (!study || study.decode.length === 0) return null;
              const total = compositeScore(study.decode);
              return (
                <div key={slug} className="border border-mono-gray/25 bg-mono-white">
                  <div className="flex items-start justify-between gap-5 p-5 md:p-6 border-b border-mono-gray/25">
                    <div className="min-w-0">
                      <p className="text-[11px] tracking-[0.22em] font-display font-bold text-mono-amber-strong">
                        {study.brand.toUpperCase()}
                      </p>
                      <Link
                        href={`/intelligence/case-studies/${study.slug}`}
                        className="mt-1 block font-display font-bold text-lg md:text-xl text-mono-black hover:text-mono-amber-strong"
                      >
                        {study.title}
                      </Link>
                    </div>
                    {total !== null && <SignalScore score={total} />}
                  </div>
                  <table className="w-full text-sm font-body">
                    <tbody>
                      {study.decode.map((d) => {
                        const w = AXIS_WEIGHTS[d.label] ?? 0;
                        return (
                          <tr key={d.label} className="border-b border-mono-gray/15">
                            <td className="px-5 py-3 text-[11px] tracking-[0.18em] font-display font-bold text-mono-black whitespace-nowrap">
                              {d.label}
                            </td>
                            <td className="px-3 py-3 text-mono-charcoal tabular-nums whitespace-nowrap">
                              {d.level} ÷ 5 × {w.toFixed(2)}
                            </td>
                            <td className="px-5 py-3 text-right font-display font-bold text-mono-black tabular-nums">
                              {((d.level / 5) * w * 100).toFixed(1)}
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="bg-mono-soft-white">
                        <td className="px-5 py-3 text-[11px] tracking-[0.18em] font-display font-bold text-mono-black" colSpan={2}>
                          COMPOSITE
                        </td>
                        <td className="px-5 py-3 text-right font-display font-bold text-mono-black tabular-nums">
                          {total}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
          <p className="mt-6 font-body text-sm text-mono-gray leading-relaxed">
            The gap between them is the whole point. Both are competent, well-resourced products built for the same
            continent. What separates a 95 from a 43 is not craft — it is who ended up owning the thing that was
            built, and whether anything verifiable followed.
          </p>
        </section>

        <section>
          <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong mb-6">THE FOUR AXES</p>
          <div className="space-y-px bg-mono-gray/25 border border-mono-gray/25">
            {AXES.map((ax) => (
              <div key={ax.label} className="bg-mono-white p-6 md:p-7">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span className="text-sm tracking-[0.18em] font-display font-bold text-mono-black">{ax.label}</span>
                  <span className="text-xs font-display font-bold text-mono-amber-strong tabular-nums">{Math.round((AXIS_WEIGHTS[ax.label] ?? 0) * 100)}% weight</span>
                </div>
                <p className="font-body text-mono-charcoal leading-relaxed">{ax.what}</p>
                <div className="mt-4 grid sm:grid-cols-2 gap-3 text-sm font-body">
                  <p className="text-mono-charcoal"><span className="text-mono-amber-strong font-bold">Raises it:</span> {ax.raises}</p>
                  <p className="text-mono-charcoal"><span className="text-mono-gray font-bold">Lowers it:</span> {ax.lowers}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-5">
            <GitBranch className="text-mono-amber" size={22} />
            <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong">THE ROLLUP</p>
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-mono-black">We rate the work.</h2>
          <p className="mt-6 font-body text-lg text-mono-charcoal leading-relaxed">
            Scoring happens at the level of a single <strong>work</strong> — a specific case study, with evidence
            attached. That is the unit we stand behind, and it is what the Index ranks.
          </p>
          {/* Stated plainly because it is the first thing a competent critic checks. The
              brand roll-up is real arithmetic but, at one work for almost every brand, it
              is not yet a track record — and the page must not imply that it is. */}
          <p className="mt-5 font-body text-lg text-mono-charcoal leading-relaxed">
            A <strong>brand&rsquo;s</strong> position is the mean of its scored works. Today that mean is drawn from a
            single work for almost every brand in the Index, so treat a brand-level score as a reading of{' '}
            <em>that work</em>, not a verdict on the organisation&rsquo;s record. A brand only earns a track record once
            it carries several scored works, and we say how many each one has beside its score.
          </p>
          <p className="mt-5 font-body text-lg text-mono-charcoal leading-relaxed">
            As new case studies are decoded, positions move — and the snapshot records that movement so the ranking has
            a memory. Movement is only ever computed between snapshots scored under the same rubric: a re-scoring
            changes the ruler, not the work, and we will not publish it as though brands had moved.
          </p>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-5">
            <Database className="text-mono-amber" size={22} />
            <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong">THE MEASURED ANCHOR</p>
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-mono-black">A number you can count, beside the one we judge.</h2>
          <div className="mt-6 space-y-4 font-body text-lg text-mono-charcoal leading-relaxed">
            <p>
              The Signal Score is editorial judgement. So every brand also carries an <strong>Evidence Strength</strong> —
              a second score, 0&ndash;100, that is <strong>measured, not judged</strong>: it is counted directly from the
              corroboration behind the work. Independently-<strong>confirmed facts</strong> weigh most, then
              <strong> verification</strong> status, then <strong>cited sources</strong>, then single-source reported
              claims — passed through a saturation curve so it rises with corroboration without running away on volume.
            </p>
            <p>
              It answers a different question than the rating: not <em>how good</em>, but <em>how well-backed</em>. A high
              Signal Score with a Developing evidence base is an honest signal — a strong read that is still thinly
              corroborated. Tiers: <strong>Strong</strong> (75+), <strong>Moderate</strong> (45+), <strong>Developing</strong> (below 45).
            </p>
            <p>
              This is the rating-agency pattern — a rating paired with a data-quality indicator. It gives a buyer a
              measured anchor for a judged number, and it gives every brand a clear way to climb: deepen the evidence.
            </p>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-5">
            <ShieldCheck className="text-mono-amber" size={22} />
            <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong">WHAT IT IS NOT</p>
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-mono-black">Editorial judgement, stated openly.</h2>
          <div className="mt-6 space-y-4 font-body text-lg text-mono-charcoal leading-relaxed">
            <p>
              The score is <strong>interpretive editorial judgement</strong> — a defensible, evidence-led reading. It is
              not a measured market metric, not sales data, and not a popularity count. We say so plainly because the
              honesty is the point: every score traces to a case study and the evidence behind it.
            </p>
            <p>
              Axis levels are <strong>set by a named human analyst</strong> (see below), not an anonymous committee.
              An AI-assisted workflow — a model drafts the decode, the analyst approves it — scales the scoring without
              surrendering the judgement. It is never autonomous: a person signs every score.
            </p>
            <p>
              The weighting is locked and versioned in code. If it ever changes, that change is documented — a ranking
              you can&rsquo;t audit isn&rsquo;t intelligence.
            </p>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-5">
            <PenLine className="text-mono-amber" size={22} />
            <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong">THE ANALYST</p>
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-mono-black">A name behind the number.</h2>
          <div className="mt-6 space-y-4 font-body text-lg text-mono-charcoal leading-relaxed">
            <p>
              Trust in a rating is personal. Every score on the Cultural-Signal Index is set and signed off by
              <strong> Sibu Shangase</strong>, founder and lead analyst of MonoKromatik — who built the methodology,
              weights each axis against the evidence, and is accountable for the read. Where a score is wrong, the
              correction carries the same byline.
            </p>
            <p>
              This is deliberate: an index is only as credible as the judgement behind it, and judgement has a name.
              The analyst works to the locked methodology above and the measured Evidence Strength beside each score —
              disclosure, not a black box.
            </p>
          </div>
          <div className="mt-7 flex items-center gap-4 border border-mono-gray/25 bg-mono-white p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-mono-black text-mono-amber font-display font-bold text-lg">SS</div>
            <div>
              <p className="font-display font-bold text-mono-black">Sibu Shangase</p>
              <p className="text-sm font-body text-mono-gray">Founder &amp; Lead Analyst, MonoKromatik &middot; Cultural-Signal Index</p>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-5">
            <FileCheck2 className="text-mono-amber" size={22} />
            <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong">CORRECTIONS &amp; INTEGRITY</p>
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-mono-black">Sourced, challengeable, correctable.</h2>
          <div className="mt-6 space-y-4 font-body text-lg text-mono-charcoal leading-relaxed">
            <p>
              <strong>The sourcing standard.</strong> Every case study and report is web-sourced and cited. A draft that
              can&rsquo;t meet the bar — at least two independent, real sources, every factual beat traceable, fact kept
              separate from interpretation — is rejected before it publishes. We do not invent quotes, statistics, dates
              or sources; an unverifiable claim is dropped, not padded. Verification is stated on every decode
              (<em>verified · partial · interpretive</em>) and reflected in the Evidence Strength beside the score.
            </p>
            <p>
              <strong>Right of reply.</strong> If you are a rated brand, you can respond. Send us evidence — a correction,
              context we missed, or proof of an outcome — and it is reviewed against the same methodology. New evidence can
              move a score; that is precisely how the Index is meant to work.
            </p>
            <p>
              <strong>How we correct.</strong> Flag an error or dispute a score at{' '}
              <a href="mailto:editor@monokromatik.com" className="text-mono-amber-strong font-bold hover:text-mono-amber-hover underline">editor@monokromatik.com</a>.
              Material factual errors are corrected promptly; the correction carries the same analyst byline, is dated, and
              — where it changes a score — is recorded in the Index&rsquo;s movement history so the change is auditable. We
              would rather be corrected than wrong.
            </p>
          </div>
          <div className="mt-7">
            <a
              href="mailto:editor@monokromatik.com?subject=Cultural-Signal%20Index%20%E2%80%94%20correction%20%2F%20right%20of%20reply"
              className="inline-flex items-center gap-2 bg-mono-black text-mono-white px-7 py-4 font-display font-bold hover:bg-mono-charcoal transition-colors"
            >
              FLAG AN ERROR / RIGHT OF REPLY <ArrowRight size={17} />
            </a>
          </div>
        </section>

        <section className="border-t border-mono-gray/20 pt-12">
          <div className="flex items-center gap-3 mb-5">
            <Database className="text-mono-amber" size={22} />
            <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong">USE THE DATA</p>
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-mono-black">The scores are open. Cite them.</h2>
          <p className="mt-6 font-body text-lg text-mono-charcoal leading-relaxed">
            The full ranking is available as a machine-readable feed — JSON for applications and AI engines, CSV for
            analysts. The licensed tiers add refresh cadence, segmentation and team citation rights.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a href="/api/index" className="inline-flex items-center gap-2 bg-mono-black text-mono-white px-7 py-4 font-display font-bold hover:bg-mono-charcoal transition-colors">JSON FEED <ArrowRight size={17} /></a>
            <a href="/api/index?format=csv" className="inline-flex items-center gap-2 border border-mono-black text-mono-black px-7 py-4 font-display font-bold hover:bg-mono-black hover:text-mono-white transition-colors">DOWNLOAD CSV <ArrowRight size={17} /></a>
            <Link href="/intelligence/license" className="inline-flex items-center gap-2 border border-mono-gray/40 text-mono-charcoal px-7 py-4 font-display font-bold hover:border-mono-amber transition-colors">LICENSE THE INDEX <ArrowRight size={17} /></Link>
          </div>
        </section>
      </div>
    </div>
  );
}
