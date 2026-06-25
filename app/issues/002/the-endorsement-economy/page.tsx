import type { Metadata } from 'next';
import IssueFeature, { FeatureSection, PullQuote } from '../../../components/IssueFeature';

const sources = [
  {
    publisher: 'OkayAfrica',
    label: 'Burna Boy, Tyla and Other African Artists With Fashion Collaborations',
    href: 'https://www.okayafrica.com/burna-boy-tyla-and-seven-other-african-artists-with-fashion-collaborations/214036',
    use: 'The scope of the endorsement wave — the roster of African artists fronting global fashion and lifestyle campaigns.',
  },
  {
    publisher: 'Social Life Magazine',
    label: 'Tyla Brand Deals: Inside Her Partnership Empire',
    href: 'https://sociallifemagazine.com/the-archive/tyla-brand-deals-net-worth/',
    use: 'Tyla’s specific deals — Nike (Super Bowl 2025), Pandora ambassadorship, H&M collaboration — as the model of a portfolio built fast.',
  },
  {
    publisher: 'Notjustok',
    label: 'Burna Boy’s most valuable endorsement deals',
    href: 'https://notjustok.com/article/burna-boys-most-valuable-endorsement-deals/',
    use: 'Burna Boy’s ambassador relationships (BOSS, Martell, Oraimo) as the template of the recurring campaign face.',
  },
  {
    publisher: 'OkayAfrica',
    label: 'What Tyla, Burna Boy and Other African Stars Got up to at Paris Fashion Week',
    href: 'https://www.okayafrica.com/tyla-burna-boy-paris-fashion-week/',
    use: 'Evidence that African artists are now fixtures of the global luxury-fashion calendar, not occasional guests.',
  },
];

export const metadata: Metadata = {
  title: 'The Endorsement Economy — Issue 002 | MonoKromatik',
  description:
    'African artists as global campaign faces — Tyla, Burna Boy and the brands courting them. Is ambassadorship building artist-owned equity, or renting African cool by the campaign?',
  alternates: { canonical: 'https://www.monokromatik.com/issues/002/the-endorsement-economy' },
  openGraph: {
    title: 'Faces of the House: The Endorsement Economy',
    description: 'African artists are the campaign faces global brands want. The question is whether they own anything when the campaign ends.',
    url: 'https://www.monokromatik.com/issues/002/the-endorsement-economy',
    type: 'article',
  },
};

export default function TheEndorsementEconomyPage() {
  return (
    <IssueFeature
      franchise="CULTURE"
      title="Faces of the House"
      standfirst="African artists are now the campaign faces global brands compete for. The fee is real and rising. The open question is whether ambassadorship builds equity the artist keeps — or rents African cool by the season."
      market="AFRICA & DIASPORA"
      readingTime="6 MIN READ"
      evidence="EDITORIAL ESSAY"
      issueNumber="002"
      sources={sources}
      next={{ label: 'Back to the full slate — Issue 002', href: '/issues/002' }}
    >
      <FeatureSection title="The scene is set">
        <p>
          The roll-call is now routine. Tyla fronted Nike at the 2025 Super Bowl, became a Pandora ambassador, and built
          an H&amp;M collaboration — a full endorsement portfolio assembled in barely a year. Burna Boy has fronted BOSS
          alongside David Beckham, signed luxury spirits and consumer-tech deals, and become a fixture of the campaign
          circuit. Across the continent and diaspora, African artists are fixtures of Paris Fashion Week and the faces
          global houses court rather than discover.
        </p>
        <p>
          This is the cultural confirmation of the whole issue: African creative influence is now a premium global input,
          priced accordingly. Brands are not doing African artists a favour by casting them. They are paying for access to
          a cultural authority they cannot manufacture. The fee proves the value.
        </p>
      </FeatureSection>

      <PullQuote>
        A campaign fee is income. Equity is ownership. The endorsement economy pays the first and rarely grants the
        second.
      </PullQuote>

      <FeatureSection title="The two readings">
        <p>
          The optimistic reading is that visibility compounds. Each global campaign raises an artist&rsquo;s rate,
          broadens their audience, and builds the personal brand they can later monetise on their own terms — touring,
          catalogue, their own product lines. Endorsement, on this view, is the on-ramp to durable artist-owned equity:
          you rent your face now to own a business later.
        </p>
        <p>
          The sceptical reading is the one this issue keeps returning to. An ambassadorship is, structurally, a rental.
          The brand keeps the equity — the campaign IP, the customer relationship, the long-term lift to its own
          valuation — while the artist takes a fee and moves on. African cool flows into the brand&rsquo;s balance sheet;
          a cheque flows back. Visibility without ownership is exactly the pattern the cover essay named: the value is
          real, and it is captured elsewhere.
        </p>
      </FeatureSection>

      <FeatureSection title="What separates the two outcomes">
        <p>
          The deciding variable is structure, not stardom. A flat campaign fee is rental. Equity participation,
          co-created product lines the artist owns, licensing of their own IP, or a stake in the venture — those are
          ownership. The same Tyla deal can be either, depending on the terms; and the Hybe joint venture elsewhere in
          this issue is, read this way, an attempt to convert exactly that rented visibility into an owned position.
        </p>
        <p>
          This is also where the endorsement economy connects to the rest of Issue 002. The artist fronting the luxury
          house, the player in the AFCON sponsor&rsquo;s ad, the actor in the studio&rsquo;s campaign — each is a face
          generating value that mostly accrues to a balance sheet they do not control, unless the deal was deliberately
          built to share it.
        </p>
      </FeatureSection>

      <FeatureSection title="The MonoKromatik read">
        <p>
          The endorsement boom is unambiguously good news on one axis: the market has priced African cultural authority
          as a premium global asset, and the artists commanding those fees earned them. We will not pretend a Super Bowl
          campaign or a BOSS contract is anything other than a real win.
        </p>
        <p>
          But a win on income is not the same as a win on ownership, and conflating the two is how a renaissance gets
          quietly extracted. The artists who will still hold value in a decade are the ones converting today&rsquo;s
          campaign fees into owned assets — equity, IP, their own brands — rather than re-renting their face each season.
          We will read these deals on that axis, and name the difference. The faces are African. The question, every
          time, is whose house they are building.
        </p>
      </FeatureSection>
    </IssueFeature>
  );
}
