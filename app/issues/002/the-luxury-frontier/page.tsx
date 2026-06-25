import type { Metadata } from 'next';
import IssueFeature, { FeatureSection, PullQuote } from '../../../components/IssueFeature';

const sources = [
  {
    publisher: 'Business of Fashion',
    label: 'The Retailers Unlocking Africa’s Luxury Market',
    href: 'https://www.businessoffashion.com/articles/global-markets/the-retailers-unlocking-africas-luxury-market/',
    use: 'The distributor-and-multi-brand model: how global houses reach African consumers without operating their own stores, and the move beyond South Africa, Nigeria and Morocco.',
  },
  {
    publisher: 'Statista',
    label: 'Luxury Goods — Africa: market forecast',
    href: 'https://www.statista.com/outlook/cmo/luxury-goods/africa',
    use: 'Africa’s luxury-goods revenue (~US$7.84bn in 2025) and projected growth, sizing the demand the distributor model intermediates.',
  },
  {
    publisher: 'Bloomberg',
    label: 'Africa luxury goods market: Full of untapped promise',
    href: 'https://bloomberg.com/professional/insights/uncategorized/africa-luxury-goods-market-full-of-untapped-promise',
    use: 'The structural framing of Africa as an under-penetrated luxury frontier driven by a rising high-net-worth population.',
  },
  {
    publisher: 'Mordor Intelligence',
    label: 'Middle East & Africa Luxury Goods Market — trends and concentration',
    href: 'https://www.mordorintelligence.com/industry-reports/middle-east-and-africa-luxury-goods-market',
    use: 'The monobrand-store concentration: roughly 50 directly operated single-brand stores continent-wide, ~80% in Morocco and South Africa, LVMH and Richemont accounting for most.',
  },
];

export const metadata: Metadata = {
  title: 'The Luxury Frontier — Issue 002 | MonoKromatik',
  description:
    'Rising affluence, almost no monobrand stores, and access intermediated by distributors and homegrown retail. In African luxury, whoever controls the shelf controls the margin.',
  alternates: { canonical: 'https://www.monokromatik.com/issues/002/the-luxury-frontier' },
  openGraph: {
    title: 'The Luxury Frontier: Lagos, Nairobi, Johannesburg and the Distributor Workaround',
    description: 'Global houses want the African consumer but won’t yet own the African store. Who controls the shelf controls the margin.',
    url: 'https://www.monokromatik.com/issues/002/the-luxury-frontier',
    type: 'article',
  },
};

export default function TheLuxuryFrontierPage() {
  return (
    <IssueFeature
      franchise="BRAND WEATHER"
      title="The Luxury Frontier"
      standfirst="Global houses want the African luxury consumer. They do not yet want to own the African store. The gap between those two facts — bridged by distributors and homegrown retail — is where the margin is decided."
      market="LAGOS · NAIROBI · JOHANNESBURG"
      readingTime="6 MIN READ"
      evidence="SIGNAL BRIEFING"
      issueNumber="002"
      sources={sources}
      next={{ label: 'Culture — The Endorsement Economy', href: '/issues/002/the-endorsement-economy' }}
    >
      <FeatureSection title="The signal">
        <p>
          Africa&rsquo;s luxury-goods market generated roughly <strong>US$7.84 billion in 2025</strong> and is growing,
          powered by a rising high-net-worth population and increasingly visible aspirational consumption. The demand is
          not in question. What is striking is the retail footprint behind it: the continent has only about
          <strong> 50 directly operated single-brand luxury stores</strong>, with LVMH and Richemont accounting for the
          majority — and roughly 80% of them sit in just two markets, Morocco and South Africa.
        </p>
        <p>
          So in the cities where the new money increasingly is — Lagos, Nairobi, and beyond Johannesburg&rsquo;s
          established base — global houses largely do not operate their own stores. They reach the consumer through
          multi-brand retailers and local distributors, with some now eyeing boutiques in Kenya, Angola and Egypt. The
          brand wants the customer. It is outsourcing the shelf.
        </p>
      </FeatureSection>

      <PullQuote>
        Whoever owns the point of sale owns the customer relationship, the data, and the margin. In African luxury, that
        owner is often not the brand.
      </PullQuote>

      <FeatureSection title="Why the workaround exists — and what it cedes">
        <p>
          The distributor model is a rational response to real friction: import duties, currency volatility, thin
          prime-retail supply, and the cost of operating a flagship in a market a house is still learning. Outsourcing
          the shelf lets a brand test demand without committing capital to it. For now, the workaround is the sensible
          play.
        </p>
        <p>
          But it cedes the three things that compound. The distributor — not the house — owns the direct customer
          relationship, the first-party data on who is buying what, and a share of the margin that, in a directly
          operated market, the brand would keep. Read through the Issue 002 lens, the houses have made the same trade the
          rest of the issue keeps surfacing: they have taken the visible revenue and let someone else own the
          infrastructure that captures the long-term value.
        </p>
      </FeatureSection>

      <FeatureSection title="The opening for African operators">
        <p>
          That trade is an opportunity for the intermediaries. The distributors and homegrown luxury retailers building
          the shelf today are accumulating exactly the assets the global houses are deferring: customer data, locational
          real estate, and the trusted relationship with the African luxury consumer. If the market grows as forecast,
          those operators sit on an appreciating position — one the houses may eventually have to buy back at a premium
          when they decide the market is ready for directly operated flagships.
        </p>
        <p>
          The risk for those same operators is the inverse: that they are building demand a house will simply absorb once
          it matures, leaving them as a stepping-stone rather than a durable principal. Whether the intermediary becomes
          an owner or an exit depends on how much defensible infrastructure — data, real estate, relationships — they
          lock in before the houses arrive in force.
        </p>
      </FeatureSection>

      <FeatureSection title="The MonoKromatik read">
        <p>
          The luxury frontier is the cleanest expression of the issue&rsquo;s thesis applied to retail: demand is
          established, infrastructure is contested, and the value will accrue to whoever owns the point of sale. The
          global houses are, for now, choosing reach over control — and in doing so handing the most valuable assets to
          the intermediaries who build the shelf.
        </p>
        <p>
          We read this as a live, winnable contest rather than a settled outcome. The African distributors and retailers
          who treat this window as a chance to own data, real estate and the customer relationship — not merely to
          stock product — are positioning to keep the margin. The ones who only move boxes are building someone
          else&rsquo;s market entry. The shelf is the battleground. The question, as ever, is who owns it when the
          frontier closes.
        </p>
      </FeatureSection>
    </IssueFeature>
  );
}
