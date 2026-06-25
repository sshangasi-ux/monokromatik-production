import type { Metadata } from 'next';
import IssueFeature, { FeatureSection, PullQuote } from '../../../components/IssueFeature';

const sources = [
  {
    publisher: 'CAF',
    label: 'AFCON 2025 commercial success in Morocco leads to over 90% surge in revenues and 23 sponsors',
    href: 'https://www.cafonline.com/news/totalenergies-caf-africa-cup-of-nations-2025-commercial-success-in-morocco-leads-to-over-90-surge-in-competition-revenues-and-a-total-of-23-sponsors/',
    use: 'The primary figures: a 90%+ revenue surge and 23 sponsors — the most commercially successful AFCON on record.',
  },
  {
    publisher: 'Sport News Africa',
    label: 'AFCON 2025: A historic commercial success with revenues up by 90%',
    href: 'https://sportnewsafrica.com/en/posts/afcon-2025-a-historic-commercial-success-with-revenues-up-by-90',
    use: 'Independent confirmation and the sponsor-growth trajectory (9 in 2021, 17 in 2023, 23 in 2025).',
  },
  {
    publisher: 'Morocco World News',
    label: 'AFCON 2025 in Morocco Sets New Commercial Benchmark for African Football',
    href: 'https://www.moroccoworldnews.com/2026/01/275291/afcon-2025-in-morocco-sets-new-commercial-benchmark-for-african-football/',
    use: 'The data-led strategy behind the surge and the move into new media markets (China, Japan, the Far East).',
  },
  {
    publisher: 'Punch',
    label: 'AFCON 2025 records highest revenues in history – CAF',
    href: 'https://punchng.com/afcon-2025-records-highest-revenues-in-history-caf/',
    use: 'A Nigerian-market read of the record, and the question of where the money lands beyond the rights-holder.',
  },
];

export const metadata: Metadata = {
  title: 'AFCON’s Commercial Record — Issue 002 | MonoKromatik',
  description:
    'AFCON Morocco drove a record revenue surge and sponsor roster. The relevance test: a durable African sports-marketing economy, or a host-and-rights-holder windfall that never reaches the clubs and players?',
  alternates: { canonical: 'https://www.monokromatik.com/issues/002/afcon-commercial-record' },
  openGraph: {
    title: 'AFCON’s Commercial Record: Can the Football Economy Travel?',
    description: 'A 90% revenue surge and 23 sponsors. The question is whether the money reaches anyone but the rights-holder.',
    url: 'https://www.monokromatik.com/issues/002/afcon-commercial-record',
    type: 'article',
  },
};

export default function AfconCommercialRecordPage() {
  return (
    <IssueFeature
      franchise="WILL IT LAND?"
      title="Can the Football Economy Travel?"
      standfirst="AFCON Morocco was the most commercially successful edition in the tournament’s history. The relevance test is whether that record is a structural African sports economy — or a windfall that stops at the rights-holder."
      market="MOROCCO × CONTINENTAL"
      readingTime="6 MIN READ"
      evidence="SOURCE-LED ANALYSIS"
      issueNumber="002"
      sources={sources}
      next={{ label: 'Brand Weather — The Luxury Frontier', href: '/issues/002/the-luxury-frontier' }}
    >
      <FeatureSection title="The record">
        <p>
          The TotalEnergies CAF Africa Cup of Nations Morocco 2025 produced what CAF calls the most commercially
          successful story in the history of African football: a <strong>revenue surge of over 90%</strong> and a roster
          of <strong>23 sponsors</strong> — up from nine at Cameroon 2021 and seventeen at Côte d&rsquo;Ivoire 2023. The
          sponsor base now spans the US, China, Germany, Japan, Morocco, Côte d&rsquo;Ivoire, the UK and, for the first
          time, Turkey.
        </p>
        <p>
          The growth was not luck. CAF describes a deliberate, data-led strategy built after 2023: analysing audience
          demand by region, identifying under-exploited interest in markets like China and Japan, and selling into them
          while consolidating traditional partners. There is even an eAFCON, via a Konami eFootball partnership — a first
          push into eGaming. This is a rights-holder behaving like a modern sports-marketing business.
        </p>
      </FeatureSection>

      <PullQuote>
        A record at the top of the pyramid is only an economy if the value reaches the base that produces it.
      </PullQuote>

      <FeatureSection title="What the record proves">
        <p>
          The headline finding is genuinely important for the Issue 002 thesis: global commercial demand for African
          football is real, growing fast, and now travelling into markets that had no historic relationship with the
          tournament. The proposition that African sport is a serious, monetisable global property is no longer
          speculative. CAF demonstrated it can command sponsorship and media interest at a scale the continent&rsquo;s
          football had not previously captured.
        </p>
        <p>
          That is the &ldquo;does it travel&rdquo; question answered at the level of the tournament. The audience is
          there; the sponsors followed; the rights sold into new geographies. As a relevance test of African football as
          a global commercial product, the verdict is: it lands.
        </p>
      </FeatureSection>

      <FeatureSection title="Where it might not land">
        <p>
          But a tournament is not an economy. The revenue surge accrued to the rights-holder and, through hosting, to
          Morocco. The harder question — the one this franchise exists to ask — is whether any of it reaches the layer
          that actually produces the football: the domestic leagues, the clubs that develop the players, the players
          themselves. A 90% surge in CAF revenue is compatible with a domestic club game that remains
          chronically under-capitalised.
        </p>
        <p>
          The durability question follows. A record built partly on a single well-run host edition in Morocco — a market
          with unusual infrastructure and state backing — is not automatically a template the next host can repeat. The
          windfall is real. Whether it is a recurring, distributable economy or a peak tied to one host is precisely what
          the next two editions will reveal.
        </p>
      </FeatureSection>

      <FeatureSection title="The MonoKromatik read">
        <p>
          We score this as a partial land — strong on the surface it was designed to test, unproven on the one that
          matters most. CAF has shown that African football can command global commercial demand and sell into new
          markets; that is a real, measurable shift and it deserves the headline. The data-led sponsorship strategy is
          exactly the kind of infrastructure the cover essay called for.
        </p>
        <p>
          But the upside, for now, is concentrated where the rights and the hosting sit. The test we will keep watching
          is distribution: whether the record at the top measurably re-capitalises the clubs, leagues and players at the
          base, and whether the economics survive a less-resourced host. A windfall captured at the apex is an
          achievement. An economy is only proven when the value travels down.
        </p>
      </FeatureSection>
    </IssueFeature>
  );
}
