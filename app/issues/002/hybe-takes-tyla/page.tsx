import type { Metadata } from 'next';
import IssueFeature, { FeatureSection, PullQuote } from '../../../components/IssueFeature';

const sources = [
  {
    publisher: 'Variety',
    label: 'Hybe Partners With Tyla’s Managers in Global Joint Venture',
    href: 'https://variety.com/2025/music/news/hybe-partners-with-tyla-managers-brandon-hixon-colin-gayle-1236609065/',
    use: 'The deal structure: a joint venture, NFO LLC, co-founded with Tyla’s existing managers — not an outright acquisition of management.',
  },
  {
    publisher: 'The Korea Herald',
    label: 'Hybe partners with Grammy-winning pop star Tyla in global management push',
    href: 'https://www.koreaherald.com/article/10637605',
    use: 'Hybe’s strategic framing: expansion beyond K-pop, integrated support across touring, marketing and promotion, and a stated intent to nurture emerging African artists.',
  },
  {
    publisher: 'allkpop',
    label: 'HYBE launches joint venture to manage pop star Tyla globally',
    href: 'https://www.allkpop.com/article/2025/12/hybe-launches-joint-venture-to-manage-pop-star-tyla-globally',
    use: 'Confirmation of the NFO LLC vehicle and the December 16, 2025 announcement.',
  },
  {
    publisher: 'Malay Mail',
    label: 'Hybe goes global with Tyla: New African venture signals expansion beyond K-pop',
    href: 'https://www.malaymail.com/news/showbiz/2025/12/17/hybe-goes-global-with-tyla-new-african-venture-signals-expansion-beyond-k-pop/202228',
    use: 'The World Bank figure — African-music streaming revenue in the US projected near US$500m in 2025, roughly five times the 2017 level.',
  },
  {
    publisher: 'Social Life Magazine',
    label: 'Tyla Brand Deals: Inside Her Partnership Empire',
    href: 'https://sociallifemagazine.com/the-archive/tyla-brand-deals-net-worth/',
    use: 'The pre-existing endorsement portfolio (Nike, Pandora, H&M) that establishes Tyla as a commercial asset before the Hybe deal.',
  },
];

export const metadata: Metadata = {
  title: 'Hybe Takes Tyla — Issue 002 | MonoKromatik',
  description:
    'The company behind BTS formed a global-management joint venture with Grammy-winner Tyla — its first African artist. Who gains scale, who keeps creative control, and what it signals about who manages African stardom.',
  alternates: { canonical: 'https://www.monokromatik.com/issues/002/hybe-takes-tyla' },
  openGraph: {
    title: 'Hybe Takes Tyla: A Global Machine Meets an African Career',
    description: 'The company behind BTS built a joint venture around a South African pop star. The structure is the story.',
    url: 'https://www.monokromatik.com/issues/002/hybe-takes-tyla',
    type: 'article',
  },
};

export default function HybeTakesTylaPage() {
  return (
    <IssueFeature
      franchise="THE BOARDROOM / THE BACKROOM"
      title="Hybe Takes Tyla"
      standfirst="The company that industrialised K-pop built a joint venture around a South African pop star. The structure of the deal — not the headline — is where the ownership question lives."
      market="SOUTH AFRICA × GLOBAL"
      readingTime="7 MIN READ"
      evidence="SOURCE-LED ANALYSIS"
      issueNumber="002"
      sources={sources}
      next={{ label: 'The Work — Afreximbank’s US$1bn Film Fund', href: '/issues/002/afreximbank-film-fund' }}
    >
      <FeatureSection title="What actually happened">
        <p>
          On 16 December 2025, Hybe — the South Korean company behind BTS and the most consequential pop-music
          operator of the last decade — announced a new joint venture, <strong>NFO LLC</strong>, and a global-management
          partnership with the South African singer Tyla. It is Hybe&rsquo;s first move into an African career, and a
          clear signal of intent to expand beyond the K-pop system it perfected.
        </p>
        <p>
          The detail that matters: this is not an acquisition. NFO LLC was co-founded with Brandon Hixon and Colin
          Gayle — Tyla&rsquo;s existing managers, both veterans of the African music industry — who are set to work
          alongside Hybe America&rsquo;s president of management. Hybe brings the machine: integrated touring,
          marketing, promotion, and the publishing, recording and merchandising apparatus that turned a Seoul boy band
          into a global franchise. Tyla brings a Grammy, a pre-built endorsement portfolio (Nike, Pandora, H&amp;M) and
          a sound that is unmistakably hers.
        </p>
      </FeatureSection>

      <PullQuote>
        A joint venture is not a signing. It is a question about who owns the upside, asked in the language of equity.
      </PullQuote>

      <FeatureSection title="Why the timing is not a coincidence">
        <p>
          Hybe did not arrive early. According to a World Bank figure cited around the announcement, streaming revenue
          for African music in the US is projected to reach roughly <strong>US$500 million in 2025</strong> — about five
          times the 2017 level. The growth curve is the reason the machine showed up. When a market compounds at that
          rate, the global operators stop treating it as a discovery and start treating it as a position to take.
        </p>
        <p>
          That is the Issue 002 fault line in miniature. The cultural value is established — a South African artist won
          a Grammy and built a partnership portfolio without anyone&rsquo;s permission. The open question is the
          infrastructure that captures the next decade of it: management, publishing, the data on who is listening and
          where. Hybe is buying a seat at exactly that table.
        </p>
      </FeatureSection>

      <FeatureSection title="The case for the deal">
        <p>
          Read generously, this is the good version of global capital arriving. The managers who built Tyla&rsquo;s
          career are inside the venture, not displaced by it — they hold equity in the vehicle that now manages her,
          rather than a fee for handing her over. Hybe has also stated an intent to discover and develop emerging
          African artists and contribute to local music ecosystems. If that holds, the deal seeds infrastructure on the
          African side rather than simply extracting a star from it.
        </p>
        <p>
          And scale is not nothing. The machine that took BTS worldwide is genuinely hard to replicate; access to it can
          compress years of a career into months. For an artist already operating globally, the partnership is less
          about visibility — Tyla has that — than about the unglamorous logistics of sustaining it.
        </p>
      </FeatureSection>

      <FeatureSection title="The case for caution">
        <p>
          Read sceptically, the questions are the ones this issue exists to ask. Who controls the master recordings and
          the publishing? Where does the data on Tyla&rsquo;s global audience sit, and who can use it to develop the
          &ldquo;emerging African artists&rdquo; the announcement promises? A joint venture distributes upside by its
          cap table, and the cap table is the part of any deal that is never in the press release. The promise to nurture
          local ecosystems is a stated intent, not yet a measurable commitment.
        </p>
        <p>
          The structural risk is subtle: a global machine optimised for a Korean export model now shapes how the most
          visible African pop career is run — and, potentially, the template for the next ones. The worry is not that
          Tyla loses; she has clearly negotiated from strength. It is that the architecture built around her becomes the
          default, and the default is owned offshore.
        </p>
      </FeatureSection>

      <FeatureSection title="The MonoKromatik read">
        <p>
          This is the most sophisticated version of the Issue 002 story, which is precisely why it deserves the most
          scrutiny. The joint-venture structure — managers retained as principals, equity rather than a buyout — is
          materially better than the old model of signing the talent and keeping the rights. It suggests African
          operators negotiating as owners, not suppliers.
        </p>
        <p>
          But &ldquo;better than extraction&rdquo; is not the same as &ldquo;ownership.&rdquo; The deal will be judged on
          two things the announcement cannot yet answer: who holds the catalogue and the data, and whether the pledge to
          build African artist pipelines produces a single named, funded act on the continent. We will score it on
          exactly that axis. The headline is a global machine meeting an African career. The story is whose balance sheet
          the career compounds on.
        </p>
      </FeatureSection>
    </IssueFeature>
  );
}
