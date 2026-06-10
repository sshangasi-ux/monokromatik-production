import IssueFeature, { FeatureSection, PullQuote } from '../../../components/IssueFeature';
import { AttributedImage, AttributedImagePair, MediaStatus } from '../../../components/AttributedMedia';
import { SignalStrength } from '../../../components/dataviz/Charts';

const decode: { label: string; level: 1 | 2 | 3 | 4 | 5; note: string }[] = [
  { label: 'IDEA', level: 5, note: 'Heritage carried as design language, not decoration.' },
  { label: 'AUTHORSHIP', level: 4, note: 'African creative collective central to the work.' },
  { label: 'EXECUTION', level: 5, note: 'Craft, narrative and product detail in lockstep.' },
  { label: 'CONSEQUENCE', level: 4, note: 'Africa-first launch signals intent beyond a drop.' },
];

const officialSource = 'https://about.nike.com/en/newsroom/releases/nike-air-afrique-air-max-rk61-official-images';
const heroImage = 'https://media.about.nike.com/img/b6930e3c-bcb3-4dca-ac92-ac3b9ea884e1/air-max-rk61-hero.jpg';
const quoteImage = 'https://media.about.nike.com/img/396d7232-73e2-4655-9c11-68a3b47c0069/air-max-rk61-ahmadou-bamba-thiam-quote-1.jpg';

const sources = [
  {
    publisher: 'NIKE, Inc. Newsroom',
    label: 'Nike x Air Afrique Launch the Air Max RK61, a Tribute to Diasporic Heritage',
    href: officialSource,
    use: 'Official source for product detail, campaign framing, cast, availability and displayed media assets.',
  },
  {
    publisher: 'Vogue Business',
    label: 'Nike bets big on Africa with Air Afrique collab',
    href: 'https://www.vogue.com/article/nike-bets-big-on-africa-with-air-afrique-collab',
    use: 'Independent reporting on the Abidjan-first launch, Blu Lab context and local access narrative.',
  },
];

const campaignHero = {
  src: heroImage,
  alt: 'Figures on aircraft stairs in the Nike and Air Afrique campaign for the Air Max RK61.',
  caption: 'The Première Classe campaign turns travel and airline memory into the visual world of the RK61 collaboration.',
  credit: 'Courtesy of NIKE, Inc. / Air Afrique',
  sourceLabel: 'Official Nike Newsroom',
  sourceHref: officialSource,
};

const campaignQuote = {
  src: quoteImage,
  alt: 'Nike and Air Afrique campaign artwork connecting flight, elevation and cultural movement.',
  caption: 'Official campaign material positions Air as a metaphor for travel, exchange and elevation beyond the footwear object.',
  credit: 'Courtesy of NIKE, Inc. / Air Afrique',
  sourceLabel: 'Official Nike Newsroom',
  sourceHref: officialSource,
};

export default function TheWorkNikeAirAfriquePage() {
  return (
    <IssueFeature
      franchise="THE WORK / CASE STUDY 001"
      title="Nike × Air Afrique: When the Launch Point Becomes the Point"
      standfirst="A sneaker collaboration rooted in Pan-African memory matters most not because Africa appears in the campaign, but because Abidjan became the first market asked to experience it."
      market="CÔTE D’IVOIRE / WEST AFRICA / DIASPORA"
      readingTime="8 MIN READ"
      evidence="SOURCE-LED ANALYSIS"
      sources={sources}
      next={{ label: 'Will It Land? Orange WoMen’s Football', href: '/issues/001/will-it-land-orange-womens-football' }}
    >
      <MediaStatus>Displayed campaign imagery is sourced from Nike’s official newsroom asset set and credited directly. Independent publishing is used for reporting context, not as visual inventory.</MediaStatus>

      <FeatureSection title="The Monokromatik decode">
        <p className="not-prose text-sm text-mono-gray font-body">Our editorial read across the four dimensions we use to assess creative work — idea, authorship, execution and consequence. Strength reflects judgement, not a measured score.</p>
        <div className="not-prose mt-6 grid sm:grid-cols-2 gap-px border border-mono-gray/25 bg-mono-gray/25">
          {decode.map((d) => (
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

      <FeatureSection title="The move">
        <p>Nike and the Paris-based creative collective Air Afrique introduced the Air Max RK61 as a dress-shoe silhouette connecting heritage, craft and Air Max innovation. Nike identifies aviation-linked details including a jet-engine-inspired Air unit, Morse code spelling “Air Afrique” on the outsole, an original-airline-logo zipper pull and an aircraft-seat-inspired sock liner.</p>
        <p>The official <em>Première Classe</em> campaign features figures spanning sport and culture, including Didier Drogba, Oumou Sangaré, Marie Josée Ta Lou-Smith and Mme Daba Traoré, a former employee of the original airline. Nike states that the silhouette became globally available on 9 October 2025 through SNKRS and selected retailers.</p>
        <p><em>Vogue Business</em> separately reported that the collaboration launched in Abidjan at Blu Lab ahead of wider global release, presenting this as Nike’s first sneaker debut in Africa before global rollout.</p>
      </FeatureSection>

      <AttributedImage asset={campaignHero} feature />

      <PullQuote>The most important creative decision was not only what the shoe referenced. It was where the story was allowed to begin.</PullQuote>

      <FeatureSection title="The strategic bet">
        <p>Consumers on the continent have often encountered coveted global products after the cultural conversation has already happened elsewhere — through resale, overseas networks, shipping premiums or imported launch culture. The reported Abidjan-first launch interrupted that sequence.</p>
        <p>It made place part of the product proposition. The market connected to the cultural memory was not only a campaign setting or later distribution destination; it was treated as part of the starting point of the story.</p>
        <p>This is more meaningful than adapting global creative into an African setting after the central decision has already been made elsewhere. It acknowledges that African memory, retail community and access can organise a global product story.</p>
      </FeatureSection>

      <FeatureSection title="The creative expression">
        <p>Air Afrique matters as a collaborator because the source material is not generic African visibility. Nike describes the contemporary Air Afrique platform as rooted in art, cinema and photography, connecting communities through shared memory and Afro-diasporic expression.</p>
        <p>The campaign and product convert that memory into a complete system: travel, dress, an intergenerational cast, airline identity and contemporary design. In Monokromatik’s reading, the work is strongest because its heritage reference appears in both product detail and launch behaviour.</p>
      </FeatureSection>

      <AttributedImagePair assets={[campaignHero, campaignQuote]} />

      <FeatureSection title="The evidence">
        <p><strong>Confirmed through Nike:</strong> the collaboration identity, RK61 design details, <em>Première Classe</em> campaign framing, named participants and global availability date.</p>
        <p><strong>Reported independently:</strong> the Abidjan Blu Lab launch, Africa-before-global sequencing and local consumer-access context.</p>
        <p><strong>Not claimed at this stage:</strong> sustained commercial impact, long-term brand-equity growth or a continuing Nike Africa-first release strategy. Those conclusions require further evidence over time.</p>
      </FeatureSection>

      <PullQuote>Africa-first storytelling becomes more credible when it is matched by Africa-first access.</PullQuote>

      <FeatureSection title="The African read">
        <p>This work offers a useful correction to the way international brands often approach African relevance. The continent does not only contribute inspiration, celebrity or social heat. It contains retail communities, payment behaviours, memory systems and consumers capable of being first — not merely eventually included.</p>
        <p>There is also a diaspora layer. Air Afrique’s memory is inherently mobile: it speaks to routes and relationships between the continent and people living beyond it. For brands working across African and diaspora audiences, that shared cultural infrastructure can be more powerful than an artificially broad “Africa” campaign.</p>
        <p>The remaining question is repetition. A single launch can signal intent. A continuing system of African access, creator authorship, distribution and investment would prove strategy.</p>
      </FeatureSection>

      <FeatureSection title="Lessons for brand builders">
        <p><strong>Start where the meaning lives.</strong> When cultural memory is central to an idea, the first experience should reflect that truth.</p>
        <p><strong>Make access part of the creative.</strong> Distribution and retail partnership become strategic when exclusion has shaped the audience experience.</p>
        <p><strong>Credit collaborators carrying context.</strong> Africa-relevant work is stronger when African and diaspora partners have visible authorship, not only casting.</p>
        <p><strong>Judge repetition, not novelty.</strong> The long-term mark of this work will be whether it opens an ongoing route for African-first product and creative participation.</p>
      </FeatureSection>

      <FeatureSection title="Publication verification status">
        <p><strong>Release-quality claim basis complete:</strong> Nike’s official source now anchors campaign facts and displayed media assets; independent reporting supports the Abidjan-first launch and access narrative.</p>
        <p><strong>Optional enhancement:</strong> an official campaign film embed can be added if Nike or Air Afrique publishes an embeddable <em>Première Classe</em> film asset.</p>
      </FeatureSection>
    </IssueFeature>
  );
}
