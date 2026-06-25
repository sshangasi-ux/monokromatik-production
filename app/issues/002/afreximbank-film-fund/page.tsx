import type { Metadata } from 'next';
import IssueFeature, { FeatureSection, PullQuote } from '../../../components/IssueFeature';

const sources = [
  {
    publisher: 'Afreximbank',
    label: 'Afreximbank launches US$1 Billion Africa Film Fund to transform the continent’s creative industry',
    href: 'https://www.afreximbank.com/afreximbank-launches-us-1-billion-africa-film-fund-to-transform-the-continents-creative-industry/',
    use: 'The primary announcement: fund size up to US$1bn, launched via FEDA under the CANEX programme in Kigali, May 2025.',
  },
  {
    publisher: 'CANEX Africa',
    label: 'Africa Film Fund — Creative Africa Nexus',
    href: 'https://cms.canex.africa/africa-film-fund/',
    use: 'The fund’s remit: development, production, distribution and the supporting infrastructure and technology for long-term sustainability.',
  },
  {
    publisher: 'Screen Daily',
    label: '$1bn Africa film fund launched to support production and distribution across continent',
    href: 'https://www.screendaily.com/news/1bn-africa-film-fund-launched-to-support-film-production-and-distribution-across-continent/5204655.article',
    use: 'Independent trade-press confirmation and framing within the global film-financing landscape.',
  },
  {
    publisher: 'TechAfrica News',
    label: 'Afreximbank Launches $1 Billion Africa Film Fund to Transform African Cinema',
    href: 'https://techafricanews.com/2025/05/08/afreximbank-launches-1-billion-africa-film-fund-to-transform-african-cinema/',
    use: 'The UNESCO context: the sector generates ~US$5bn annually and employs over 5 million people, against fewer than 2,000 cinema screens continent-wide.',
  },
  {
    publisher: 'Africa.com',
    label: "Nigeria's Film Industry Pivots to Building Global Distribution",
    href: 'https://africa.com/nigerias-film-industry-pivots-to-building-global-distribution/',
    use: 'The distribution-ownership problem the fund must solve — not just making films, but owning the pipes that carry them.',
  },
];

export const metadata: Metadata = {
  title: 'Afreximbank’s US$1bn Film Fund — Issue 002 | MonoKromatik',
  description:
    'A source-led read of the continental capital now backing African film. Does African money finally own African IP, or recreate old ownership patterns at a continental scale?',
  alternates: { canonical: 'https://www.monokromatik.com/issues/002/afreximbank-film-fund' },
  openGraph: {
    title: 'Afreximbank’s US$1bn Film Fund: Financing the Story, or Owning It?',
    description: 'A billion dollars of continental capital for African film. The question is what it buys — and who keeps it.',
    url: 'https://www.monokromatik.com/issues/002/afreximbank-film-fund',
    type: 'article',
  },
};

export default function AfreximbankFilmFundPage() {
  return (
    <IssueFeature
      franchise="THE WORK"
      title="Financing the Story, or Owning It?"
      standfirst="Afreximbank has committed up to a billion dollars to African film. It is the most consequential bet yet that African capital can own African IP — and the terms are where the thesis will be won or lost."
      market="AFRICA & DIASPORA"
      readingTime="7 MIN READ"
      evidence="SOURCE-LED ANALYSIS"
      issueNumber="002"
      sources={sources}
      next={{ label: 'Will It Land? — AFCON’s Commercial Record', href: '/issues/002/afcon-commercial-record' }}
    >
      <FeatureSection title="The commitment">
        <p>
          In May 2025, in Kigali, Afreximbank launched the <strong>Africa Film Fund</strong> — a vehicle of up to
          <strong> US$1 billion</strong>, run through its development-impact investment arm FEDA and its Creative Africa
          Nexus (CANEX) programme. The remit is deliberately full-stack: not just production financing, but development,
          distribution, and the supporting infrastructure and technology meant to make the industry sustainable rather
          than project-by-project.
        </p>
        <p>
          The scale of the gap it addresses is stark. By UNESCO&rsquo;s estimate, Africa&rsquo;s film and audiovisual
          industry already generates around <strong>US$5 billion a year</strong> and employs more than five million
          people — yet the continent has fewer than 2,000 cinema screens for 1.4 billion people, limited post-production
          capacity, and thin access to the digital platforms where film economics now live. The talent and the audience
          exist. The plumbing does not.
        </p>
      </FeatureSection>

      <PullQuote>
        A billion dollars can finance a thousand stories. Whether it owns them is a different line in the term sheet.
      </PullQuote>

      <FeatureSection title="Why this is the right shape of intervention">
        <p>
          For an issue built around the question of who captures the value, this is close to the textbook good answer:
          African institutional capital, deployed by an African multilateral bank, aimed explicitly at the
          infrastructure layer — distribution and technology — rather than only the glamorous front end of production.
          The cover essay argued that revenue capture depends on unglamorous plumbing. A fund that names distribution and
          infrastructure as priorities is, on paper, aimed at exactly the right target.
        </p>
        <p>
          It also changes the negotiating posture. When the financing is continental, African producers are not pitching
          to recoup against a foreign streamer&rsquo;s licensing template; they are, in principle, dealing with a backer
          whose mandate is the long-term health of the African industry. That alignment is the entire point.
        </p>
      </FeatureSection>

      <FeatureSection title="Where the thesis can fail">
        <p>
          A fund is an instrument, not an outcome. The hard questions sit below the headline. On what terms is the
          capital deployed — equity, debt, or grant — and who holds the resulting IP? A billion dollars lent against
          finished films, with rights pledged to secure the loan, can recreate the very ownership patterns it was meant
          to break, only with a continental lender in the creditor&rsquo;s chair. The difference between
          <em> financing</em> the story and <em>owning</em> it is the difference between a term sheet that builds African
          catalogues and one that simply refinances them.
        </p>
        <p>
          Distribution is the second test. Nigeria&rsquo;s industry has spent the last few years learning that the
          leverage is in owning the pipes — the platforms, the windows, the data — not just supplying the content that
          flows through someone else&rsquo;s. If the fund finances production but leaves global distribution in foreign
          hands, it will have subsidised output while leaving the margin offshore.
        </p>
      </FeatureSection>

      <FeatureSection title="The MonoKromatik read">
        <p>
          This is the most encouraging single data point in Issue 002, and we want to be clear about that: a billion
          dollars of patient, continental capital aimed at the infrastructure layer is precisely the kind of move the
          cover essay argued for. Treated as industrial policy rather than cultural patronage, it could shift who owns the
          rails African film travels on.
        </p>
        <p>
          But the announcement is the easy part. We will judge the fund on three things the press release cannot yet
          settle: whether the deployment terms leave IP in African hands, whether the &ldquo;infrastructure&rdquo;
          spending reaches distribution and not only production, and whether a named, financed, distributed slate exists
          a year from now. The commitment is real and it is welcome. Ownership is decided in the documents, not the
          launch.
        </p>
      </FeatureSection>
    </IssueFeature>
  );
}
