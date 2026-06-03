import IssueFeature, { FeatureSection, PullQuote } from '../../../components/IssueFeature';

const sources = [
  {
    publisher: 'NIKE, Inc. Newsroom',
    label: 'Nike x Air Afrique Launch the Air Max RK61, a Tribute to Diasporic Heritage',
    href: 'https://about.nike.com/en/newsroom/releases/nike-air-afrique-air-max-rk61-official-images',
    use: 'Official campaign basis for Air Afrique design, cultural framing, named participants and displayed visual assets.',
  },
  {
    publisher: 'Vogue Business',
    label: 'Nike bets big on Africa with Air Afrique collab',
    href: 'https://www.vogue.com/article/nike-bets-big-on-africa-with-air-afrique-collab',
    use: 'Independent reporting on Abidjan-first launch geography and local-access context.',
  },
  {
    publisher: 'Publicis France / Marcel',
    label: 'WoMen’s Football — Orange',
    href: 'https://www.publicisgroupe.com/en/news-france/wo-mens-football-orange-marcel',
    use: 'Official campaign reference for the film and its creative rationale.',
  },
  {
    publisher: 'Reuters',
    label: 'Women’s Africa Cup of Nations finals increased to 16 teams',
    href: 'https://www.reuters.com/sports/soccer/womens-africa-cup-nations-finals-increased-16-teams-2025-11-04/',
    use: 'Independent current evidence that former champions South Africa qualified for the 2026 tournament.',
  },
];

const signals = [
  {
    number: '01',
    title: 'Launch geography is becoming strategy',
    watch: 'Africa-first releases and locally meaningful launch experiences',
    reading: 'Nike × Air Afrique is significant because an official global product story was paired with an independently reported Abidjan-first launch. When place is part of the cultural meaning, sequencing communicates respect, access and intent before a campaign line does.',
    question: 'Which global brands will move African markets from adaptation stage to first-release stage?',
  },
  {
    number: '02',
    title: 'Access is part of the creative idea',
    watch: 'Retail partners, product availability and local participation',
    reading: 'An Africa-facing campaign becomes more credible when consumers can participate in the experience. The Nike × Air Afrique case is instructive because its cultural reference and its launch geography appear to move in the same direction.',
    question: 'Will brands measure local access as carefully as global conversation?',
  },
  {
    number: '03',
    title: 'Women’s sport needs brands that build continuity',
    watch: 'Creative provocation connected to South African visibility and support',
    reading: 'Orange × Marcel demonstrated how a reveal can challenge assumptions in football. South Africa is a sharper relevance test because Banyana Banyana are former continental champions and qualified for the 2026 tournament: recognition is deserved already; the brand opportunity is helping that recognition endure.',
    question: 'Which brands will connect women’s-sport storytelling to lasting visibility and access in South Africa?',
  },
  {
    number: '04',
    title: 'Diaspora memory is a brand system, not an aesthetic',
    watch: 'Products and experiences shaped by routes, return and cultural ownership',
    reading: 'Air Afrique carries meaning because it evokes movement between African cities and diaspora communities. Work rooted in those routes has greater potential when it acknowledges who holds the memory and how value returns to the culture.',
    question: 'Who will treat diaspora connection as product and community design rather than seasonal imagery?',
  },
];

export default function BrandWeatherPage() {
  return (
    <IssueFeature
      franchise="BRAND WEATHER / FOUNDING BRIEFING"
      title="Four Signals Shaping African Influence Now"
      standfirst="The first Monokromatik watchlist: what source-verified creative work suggests brand builders should track before African relevance becomes a retrospective lesson."
      market="AFRICA / SOUTH AFRICA / DIASPORA"
      readingTime="6 MIN READ"
      evidence="SIGNAL BRIEFING"
      sources={sources}
      next={{ label: 'The Boardroom / The Backroom: Founding Conversation Commission', href: '/issues/001/boardroom-backroom' }}
    >
      <FeatureSection title="How to read Brand Weather">
        <p>Brand Weather is not a list of announcements and not a claim that a small number of examples represent a whole market. It is a recurring Monokromatik intelligence format: verified observations converted into questions worth carrying into brand planning, commissioning and investment decisions.</p>
        <p>This founding edition is anchored in the official and independent evidence supporting the first Issue 001 stories. Its job is to show what a weekly briefing becomes once the Source Desk monitors approved global and African sources continuously.</p>
      </FeatureSection>

      <PullQuote>A signal matters when it changes the question a brand leader asks next.</PullQuote>

      {signals.map((signal) => (
        <FeatureSection key={signal.number} title={`${signal.number} / ${signal.title}`}>
          <p className="text-sm tracking-[0.18em] font-display font-bold text-mono-amber">WATCH: {signal.watch.toUpperCase()}</p>
          <p>{signal.reading}</p>
          <div className="mt-6 bg-mono-soft-white border-l-4 border-mono-amber p-5">
            <p className="text-xs tracking-[0.2em] font-display font-bold text-mono-amber mb-3">THE QUESTION</p>
            <p className="font-display font-bold text-xl text-mono-black leading-snug">{signal.question}</p>
          </div>
        </FeatureSection>
      ))}

      <FeatureSection title="Publication verification status">
        <p><strong>Founding issue source basis strengthened:</strong> the briefing now separates official campaign material, independent launch reporting and verified South African tournament context.</p>
        <p><strong>Still not presented as a live feed:</strong> before recurring publication, Brand Weather requires the Track 2 source-monitoring workflow, freshness checks and a repeatable editorial approval rhythm.</p>
      </FeatureSection>
    </IssueFeature>
  );
}
