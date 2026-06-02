import IssueFeature, { FeatureSection, PullQuote } from '../../../components/IssueFeature';

const sources = [
  {
    publisher: 'Vogue Business',
    label: 'Nike bets big on Africa with Air Afrique collab',
    href: 'https://www.vogue.com/article/nike-bets-big-on-africa-with-air-afrique-collab',
    use: 'Referenced example of an Africa-first product launch and diaspora-linked creative collaboration.',
  },
  {
    publisher: 'TIME',
    label: 'A Viral French Ad Shows How Women’s Soccer Can Be Just as Exciting as Men’s',
    href: 'https://time.com/6295047/viral-france-advertisement-soccer-gender-orange/',
    use: 'Referenced example of brand creativity confronting audience bias in sport.',
  },
];

export default function FoundingEssayPage() {
  return (
    <IssueFeature
      franchise="THE AFRICAN ADVANTAGE / COVER ESSAY"
      title="The Intelligence Behind African Influence"
      standfirst="Africa is not waiting to be discovered by brands. It is already shaping what the world wears, watches, listens to and wants. The question is whether brand building is intelligent enough to recognise where value is really being created."
      market="AFRICA / DIASPORA / GLOBAL BRANDS"
      readingTime="8 MIN READ"
      evidence="EDITORIAL ESSAY"
      sources={sources}
      next={{ label: 'The Work: Nike × Air Afrique', href: '/issues/001/the-work-nike-air-afrique' }}
    >
      <FeatureSection title="The opening tension">
        <p>Africa has spent too long appearing in global brand strategy as a future tense. A growth market. An emerging audience. A cultural reference bank. A place brands will eventually learn to address properly, once the distribution, data or internal confidence catches up.</p>
        <p>That language is increasingly detached from reality. African influence is not patiently waiting for a business case. It is already moving through global sport, music, fashion, design, hospitality, nightlife, digital communities and diaspora identity. It is shaping taste before many companies have worked out how to measure it.</p>
        <p>The intelligence gap is no longer whether Africa matters. It is whether brands can recognise the difference between borrowing from African visibility and investing in African authorship, access and value creation.</p>
      </FeatureSection>

      <PullQuote>Representation asks who is visible. Influence asks who shaped the idea, who gets access, and who captures value.</PullQuote>

      <FeatureSection title="The brand problem">
        <p>Brands are trained to find culture once it is already legible: once the artist is globally famous, the athlete has crossed markets, the aesthetic has been adopted internationally, or the community can be translated into a campaign deck. By that point, the most valuable insight has often already travelled.</p>
        <p>Africa-relevant brand building cannot be reduced to selecting African faces for global creative. The sharper questions are more demanding. Did the market change the idea? Did local consumers gain meaningful access? Did African creative voices shape the work? Did the brand create participation, infrastructure or commercial opportunity—or only imagery?</p>
        <p>This is why Monokromatik exists. Not to grade campaigns from a distance, nor to turn culture into a decorative language for marketers. The platform is built to examine the work at the point where influence becomes strategy and strategy creates consequence.</p>
      </FeatureSection>

      <FeatureSection title="A different kind of evidence">
        <p>The collaborations worth reading closely are not simply the loudest. They are the ones that reveal a shift in where brands believe stories should begin. Nike’s collaboration with Air Afrique offers one useful signal: according to reporting by <em>Vogue Business</em>, the Air Max RK61 first launched in Abidjan before wider global rollout, with the history and memory of the former Pan-African airline embedded into the product and campaign narrative.</p>
        <p>The important point is not that a global company used African heritage as inspiration. The important point is that the starting point of the global story moved: product, place, creative collective and consumer access were brought closer together on the continent itself.</p>
        <p>Orange and Marcel’s women’s football film offers a different kind of signal. Its reveal forced viewers to confront the assumptions they carried into watching elite football. The creative device mattered because it exposed the bias inside the audience response. But for African markets, an idea like this also creates a harder question: can brands challenge perception without investing in the systems that allow women’s sport to be seen, attended, supported and commercially valued?</p>
      </FeatureSection>

      <PullQuote>The next generation of African brand intelligence will not ask only whether a campaign travelled. It will ask what moved because the campaign existed.</PullQuote>

      <FeatureSection title="The Monokromatik read">
        <p>Africa’s global influence is not a single trend, style or category. It is a connected commercial and cultural system. Athletes create fashion and tourism interest. Music creates language, movement and hospitality economies. Diaspora communities create demand, memory and return journeys. Designers and creators turn inherited reference points into global objects of desire. Sport and entertainment create spaces where belonging becomes purchase, participation and loyalty.</p>
        <p>Brands that understand this will behave differently. They will not begin with an activation and look for a cultural wrapper. They will identify where relevance is being built, who already has trust, which frictions prevent access and what form of participation is legitimate. They will recognise that local distribution, creative credit, investment and ownership can be as meaningful as campaign reach.</p>
        <p>That does not mean every brand must pretend to be a cultural institution. It means brands should stop acting as though relevance can be extracted without responsibility to the people, markets and systems producing it.</p>
      </FeatureSection>

      <FeatureSection title="What we will measure">
        <p>Monokromatik will treat great creative work seriously, but not sentimentally. We will ask whether the idea is grounded in a human or cultural truth; whether African and diaspora voices shaped the work; whether the brand created real access or merely visual recognition; whether claimed outcomes can be verified; and whether another brand builder can learn something useful from the move.</p>
        <p>Signal is where we make the argument. Intelligence is where we store the evidence, compare the cases and build the tools professionals can use. Issues are where the strongest thinking is shaped into an object people want to return to, share and eventually hold.</p>
      </FeatureSection>

      <FeatureSection title="The founding position">
        <p>Africa does not need a platform to tell it that it is influential. It needs sharper platforms capable of recognising the business implications of that influence without flattening the culture that created it.</p>
        <p>Monokromatik begins from that conviction: African influence is not the garnish on the global brand economy. Increasingly, it is one of the engines. The work now is to read it early, credit it properly, challenge it fairly and turn it into intelligence worthy of the people building the future.</p>
      </FeatureSection>
    </IssueFeature>
  );
}
