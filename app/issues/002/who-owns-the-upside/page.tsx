import type { Metadata } from 'next';
import IssueFeature, { FeatureSection, PullQuote } from '../../../components/IssueFeature';

const sources = [
  {
    publisher: 'Brookings',
    label: 'The rise of Africa’s creative economy',
    href: 'https://www.brookings.edu/articles/the-rise-of-africas-creative-economy/',
    use: 'The structural case for the creative economy as IP-generating, capital-light industrial policy.',
  },
  {
    publisher: 'CNBC Africa',
    label: 'Africa’s creative economy to reach $200bn by 2030',
    href: 'https://www.cnbcafrica.com/media/7765533811350/africas-creative-economy-to-reach-200bn-by-2030',
    use: 'The headline trajectory figure used in the thesis.',
  },
  {
    publisher: 'Semafor',
    label: 'Africa’s creative economy offers new investment opportunities',
    href: 'https://www.semafor.com/article/02/18/2026/africas-creative-economy-offers-new-investment-opportunities',
    use: 'Current sector value (~$59bn, BCG) and the local-vs-international capital distinction.',
  },
  {
    publisher: 'Ecofin Agency',
    label: 'Morocco Leads Africa in 2026 Intellectual Property Index',
    href: 'https://www.ecofinagency.com/news/1703-53839-morocco-leads-africa-in-2026-intellectual-property-index',
    use: 'Evidence of the IP-protection gap — only seven African countries appear in the index.',
  },
  {
    publisher: 'Africa.com',
    label: "Nigeria's Film Industry Pivots to Building Global Distribution",
    href: 'https://africa.com/nigerias-film-industry-pivots-to-building-global-distribution/',
    use: 'The distribution-infrastructure problem and the move to own the pipes.',
  },
  {
    publisher: 'Techpoint Africa',
    label: 'Diaspora dollars: How Africa’s diaspora can fuel startup growth',
    href: 'https://techpoint.africa/insight/africas-diaspora-can-fuel-startup-growth/',
    use: 'The diaspora-capital question — sent vs invested.',
  },
];

export const metadata: Metadata = {
  title: 'Who Owns the Upside — Issue 002 Cover Essay | MonoKromatik',
  description:
    'Africa’s creative economy has gone global. The question now is who keeps the returns. The cover essay of Issue 002: Culture Is Business.',
  alternates: { canonical: 'https://www.monokromatik.com/issues/002/who-owns-the-upside' },
  openGraph: {
    title: 'Who Owns the Upside',
    description: 'Africa’s creative economy has gone global. The question now is who keeps the returns.',
    url: 'https://www.monokromatik.com/issues/002/who-owns-the-upside',
    type: 'article',
  },
};

export default function WhoOwnsTheUpsidePage() {
  return (
    <IssueFeature
      franchise="ISSUE 002 · COVER ESSAY"
      title="Who Owns the Upside"
      standfirst="Africa’s creative economy has gone global. The question now is no longer whether the value exists — it is who keeps the returns."
      market="AFRICA & DIASPORA"
      readingTime="8 MIN READ"
      evidence="EDITORIAL ESSAY"
      issueNumber="002"
      sources={sources}
      next={{ label: 'See the full slate — Issue 002', href: '/issues/002' }}
    >
      <FeatureSection title="The numbers are no longer in dispute">
        <p>
          A 2026 BCG report puts Africa’s creative economy at roughly <strong>$59 billion</strong> today — one of the
          clearest snapshots yet of a sector expanding in both cultural influence and economic value. Brookings
          projects it could reach <strong>$200 billion in annual revenue by 2030</strong>. The argument for it is
          structural, not sentimental: creative industries generate intellectual property rather than extractive
          commodities; they need less capital than mining or hydrocarbons, yet they produce foreign exchange,
          employment and domestic value retention. For economies seeking diversification, that combination is
          strategically attractive.
        </p>
        <p>
          Issue 001 argued that the world keeps discovering African value late and converting it into someone else’s
          case study. Issue 002 reports what happened next — global capital and global structures arriving in force —
          and asks the only question that now matters.
        </p>
      </FeatureSection>

      <PullQuote>
        The debate has moved from <em>does Africa have value</em> to <em>who owns the infrastructure that captures it</em>.
      </PullQuote>

      <FeatureSection title="The fault line">
        <p>
          A structural fault line runs through the boom. Revenue capture depends on unglamorous infrastructure —
          intellectual-property enforcement, reliable broadband, efficient digital payments, regulatory clarity.
          Without those foundations, value leaks outward through informal distribution and weak contracts. Only seven
          African countries appear in the 2026 International IP Index at all; the continent has roughly 1,700 cinemas
          for 1.4 billion people. The renaissance is real. The plumbing is not yet built.
        </p>
        <p>
          International investment can bring scale, but local investment matters more for ownership and control. The
          countries — and companies, and creators — that treat the creative economy as <em>industrial policy</em>
          rather than <em>cultural policy</em> will move first, and keep more.
        </p>
      </FeatureSection>

      <FeatureSection title="What this issue maps">
        <p>
          Across the edition we read the same fault line through six specific stories: the management machines now
          signing African stars (<em>The Boardroom</em>); the continental capital backing African film
          (<em>The Work</em>); whether a record-breaking African sports economy travels beyond the tournament
          (<em>Will It Land?</em>); the luxury frontier and the distributor workaround (<em>Brand Weather</em>); and
          the endorsement economy that puts African faces on global campaigns (<em>Culture</em>). Each is a different
          register of one question: who builds the systems, who holds the data, who keeps the money.
        </p>
      </FeatureSection>

      <FeatureSection title="The MonoKromatik read">
        <p>
          The honest position holds two truths at once, refusing both boosterism and despair. The cultural power is
          genuine and compounding — African and diaspora creativity is now a global input, not a regional niche. And
          the value capture is still mostly happening elsewhere, because ownership infrastructure lags the output it is
          meant to protect.
        </p>
        <p>
          That gap is not a reason for cynicism; it is the work. The next decade on the continent will be decided less
          by who makes the culture — that question is settled — than by who owns the rails it travels on: the catalogues,
          the funds’ cap tables, the broadcast rights, the retail licences, the IP. This issue names that fault line,
          maps the players on both sides of it, and scores the work on exactly that axis. Authorship is the question
          MonoKromatik exists to ask. The upside is the answer we intend to keep watching.
        </p>
      </FeatureSection>
    </IssueFeature>
  );
}
