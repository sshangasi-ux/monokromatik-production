import { notFound } from 'next/navigation';
import IssueFeature, { FeatureSection, PullQuote } from '../../../components/IssueFeature';
import CoverArt from '../../../components/CoverArt';
import MediaImage from '../../../components/MediaImage';
import { SignalStrength } from '../../../components/dataviz/Charts';
import { getAllCaseStudySlugs, getCaseStudyBySlug } from '../../../../lib/case-studies';
import type { CaseStudy } from '../../../../lib/case-study';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllCaseStudySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const study = getCaseStudyBySlug(slug);
  if (!study) return { title: 'Case study — MonoKromatik' };
  return { title: `${study.title} — MonoKromatik`, description: study.standfirst };
}

function VerificationLedger({ study }: { study: CaseStudy }) {
  const groups: { label: string; items: string[] }[] = [
    { label: 'CONFIRMED', items: study.verification.confirmed },
    { label: 'REPORTED', items: study.verification.reported },
    { label: 'NOT CLAIMED', items: study.verification.notClaimed },
  ];
  return (
    <div className="not-prose mt-6 grid sm:grid-cols-3 gap-px border border-mono-gray/25 bg-mono-gray/25">
      {groups.map((g) => (
        <div key={g.label} className="bg-mono-white p-5">
          <p className="text-[10px] tracking-[0.22em] font-display font-bold text-mono-amber-strong mb-4">{g.label}</p>
          <ul className="space-y-3">
            {g.items.length === 0 && <li className="text-sm text-mono-gray font-body">—</li>}
            {g.items.map((item) => (
              <li key={item} className="text-sm text-mono-charcoal font-body leading-relaxed">{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug } = await params;
  const study = getCaseStudyBySlug(slug);
  if (!study) notFound();

  return (
    <IssueFeature
      franchise={study.franchise}
      title={study.title}
      standfirst={study.standfirst}
      market={study.market}
      readingTime={study.readingTime}
      evidence={study.evidence}
      sources={study.sources}
    >
      {/* Hero: self-hosted photo if supplied, else owned cover art — never a broken remote. */}
      <div className="not-prose mb-10 relative aspect-[16/9] overflow-hidden bg-mono-charcoal">
        {study.heroImage ? (
          <MediaImage fill priority duotone={false} zoomOnHover={false} src={study.heroImage} alt={study.title} />
        ) : (
          <CoverArt seed={study.slug} numeral={study.competency.slice(0, 2)} motion />
        )}
      </div>

      <FeatureSection title="The MonoKromatik decode">
        <p className="not-prose text-sm text-mono-gray font-body">
          Our read across the four dimensions we use to assess work — idea, authorship, execution and consequence.
          Strength reflects judgement, not a measured score.
        </p>
        <div className="not-prose mt-6 grid sm:grid-cols-2 gap-px border border-mono-gray/25 bg-mono-gray/25">
          {study.decode.map((d) => (
            <div key={d.label} className="bg-mono-white p-5">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[11px] tracking-[0.22em] font-display font-bold text-mono-amber-strong">{d.label}</span>
                <SignalStrength level={d.level} tone="light" />
              </div>
              <p className="mt-3 text-sm font-body text-mono-charcoal leading-relaxed">{d.note}</p>
            </div>
          ))}
        </div>
      </FeatureSection>

      {study.sections.map((section, i) => (
        <FeatureSection key={section.title} title={section.title}>
          {section.paragraphs.map((p, j) => (
            <p key={j}>{p}</p>
          ))}
          {/* Intersperse pull quotes between sections for rhythm. */}
          {study.pullQuotes[i] && <PullQuote>{study.pullQuotes[i]}</PullQuote>}
        </FeatureSection>
      ))}

      <FeatureSection title="Verification status">
        <p className="not-prose text-sm text-mono-gray font-body">
          What is confirmed by a primary source, what is reported independently, and what we deliberately do not yet claim.
        </p>
        <VerificationLedger study={study} />
      </FeatureSection>
    </IssueFeature>
  );
}
