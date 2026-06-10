import IssueFeature, { FeatureSection, PullQuote } from '../../../components/IssueFeature';

const sources = [
  {
    publisher: 'TIME',
    label: 'A Viral French Ad Shows How Women’s Soccer Can Be Just as Exciting as Men’s',
    href: 'https://time.com/6295047/viral-france-advertisement-soccer-gender-orange/',
    use: 'Referenced account of the Orange and Marcel film, its reveal and its stated sponsorship message.',
  },
];

export default function WillItLandOrangePage() {
  return (
    <IssueFeature
      franchise="WILL IT LAND? / RELEVANCE TEST 001"
      title="Orange WoMen’s Football: Would the Reveal Be Enough Here?"
      standfirst="A strong creative idea can expose audience bias in minutes. In African women’s football, the harder brand test is what happens after people have been persuaded to watch."
      market="GLOBAL IDEA / AFRICAN MARKET TEST"
      readingTime="7 MIN READ"
      evidence="SOURCE-LED ANALYSIS"
      sources={sources}
      next={{ label: 'Brand Weather: Four Signals Shaping African Influence Now', href: '/issues/001/brand-weather' }}
    >
      <FeatureSection title="The global work">
        <p>Orange and agency Marcel released a film ahead of the 2023 FIFA Women’s World Cup that initially appeared to celebrate the brilliance of the French men’s national team. The sporting moments shown were then revealed to be performances from the French women’s team, digitally presented in a way that allowed viewers to confront their own assumptions.</p>
        <p>The closing point connected the creative reveal to Orange’s support for both the French men’s and women’s national teams. As reported by <em>TIME</em>, the film drew widespread attention because it let audiences experience excitement first, then question why they had attributed that quality to male football.</p>
      </FeatureSection>

      <PullQuote>The creative idea is elegant because the audience supplies the assumption before the brand supplies the correction.</PullQuote>

      <FeatureSection title="Why this is powerful">
        <p>Much sponsorship communication treats equality as a declared value: the brand says it supports women’s sport and presents an inclusive statement at the close. Orange’s work was sharper because the message was built into the viewing experience.</p>
        <p>It recognised a behavioural truth: sporting performance is often evaluated through assumptions about who is performing. The reveal was therefore not simply an executional flourish; it was the strategic mechanism.</p>
        <p>That is why the idea is worth testing rather than only admiring. The stronger a piece of global creative work is, the more useful it becomes to ask whether the same problem, execution and sponsor role would carry meaning in another market.</p>
      </FeatureSection>

      <FeatureSection title="The African relevance test">
        <p>The core human truth—women athletes being undervalued because of gendered assumptions—can resonate far beyond France. African women’s football also operates within questions of visibility, access, investment and recognition. But local relevance would not come from repeating the reveal and treating adaptation as strategy.</p>
        <p>An African-market version would need to answer more demanding questions. Which women’s team or competition is the brand demonstrably supporting? Can audiences consistently discover and view the games? Are participants gaining opportunities connected to the sponsor’s claim? Are athletes receiving the profile, resources and commercial regard consistent with the campaign message?</p>
        <p>This is where global creative admiration and African brand accountability separate. A perception-changing film may open attention; it cannot substitute for conditions that allow the sport to grow.</p>
      </FeatureSection>

      <PullQuote>In an African market, a brand cannot only say women’s football deserves attention. It has to help make attention possible.</PullQuote>

      <FeatureSection title="What would need adapting">
        <p><strong>The cultural tension:</strong> the local story should begin with real barriers and perceptions experienced by athletes and audiences in the selected market, rather than assuming the French insight transfers unchanged.</p>
        <p><strong>The property:</strong> the brand must establish a genuine connection to a women’s national team, league, club, tournament or development system. Without that, advocacy risks becoming temporary attention.</p>
        <p><strong>The distribution reality:</strong> a film about visibility needs a visibility plan. Broadcast, streaming, match attendance, creator storytelling and community access would matter as much as the hero film.</p>
        <p><strong>The measure of success:</strong> the test cannot be views alone. Relevant measures may include match discovery, attendance, participation, content completion, sponsor recognition, athlete profile and sustained investment, subject to verified data.</p>
      </FeatureSection>

      <FeatureSection title="The Monokromatik verdict">
        <p><strong>Would the insight land?</strong> Yes. Bias in how sporting quality is valued is not confined to France.</p>
        <p><strong>Would the execution travel unchanged?</strong> No. A local version would need to be built with athletes, competitions and audience realities from the market in question, not merely re-cast around a borrowed device.</p>
        <p><strong>Would a sponsor earn credibility through the film alone?</strong> No. In African women’s football, the strongest brand position would connect provocation to practical visibility and sustained support.</p>
        <p>Orange and Marcel created a useful global reference because the film converted assumption into self-recognition. The opportunity for an Africa-facing sponsor is to go further: use creative intelligence not only to expose what audiences overlook, but to support what they can keep watching.</p>
      </FeatureSection>

      <FeatureSection title="Confidence and next research required">
        <p>This feature is an editorial relevance-test draft, not a claim that Orange has proposed or implemented this campaign in an African market. The original campaign mechanics and response are based on the cited contemporary reporting.</p>
        <p>Before publication, Monokromatik should select one launch market for the local test, confirm official women’s football property and sponsor context in that market, and commission at least one informed local voice to strengthen the analysis.</p>
      </FeatureSection>
    </IssueFeature>
  );
}
