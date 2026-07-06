import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, ArrowLeft, ShieldCheck, Scale, GitBranch, Database } from 'lucide-react';
import Navigation from '../../../components/Navigation';
import { AXIS_WEIGHTS } from '../../../../lib/signal-index';

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
          <h2 className="text-3xl md:text-4xl font-display font-bold text-mono-black">Work, to brand, to Index.</h2>
          <p className="mt-6 font-body text-lg text-mono-charcoal leading-relaxed">
            Scoring happens at the level of a single <strong>work</strong> — a specific case study, with evidence. A
            <strong> brand&rsquo;s</strong> position is the mean of its scored works, so one strong campaign doesn&rsquo;t
            permanently define a brand, and a brand earns its rank across a body of work. The <strong>Index</strong> is
            every scored brand, ranked. As new case studies are decoded, brands move — and the monthly snapshot records
            that movement so the ranking has a memory.
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
              Axis levels are <strong>set by editors</strong> today. An AI-assisted workflow — a model drafts the decode,
              an editor approves it — is planned to scale the scoring without surrendering the judgement. It will never
              be autonomous: a human signs every score.
            </p>
            <p>
              The weighting is locked and versioned in code. If it ever changes, that change is documented — a ranking
              you can&rsquo;t audit isn&rsquo;t intelligence.
            </p>
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
