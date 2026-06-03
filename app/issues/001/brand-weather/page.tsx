import IssueFeature, { FeatureSection, PullQuote } from '../../../components/IssueFeature';

const sources = [
  {
    publisher: 'Vogue Business',
    label: 'Nike bets big on Africa with Air Afrique collab',
    href: 'https://www.vogue.com/article/nike-bets-big-on-africa-with-air-afrique-collab',
    use: 'Evidence for signals on Africa-first launch geography, access, diaspora memory and African creative collaboration.',
  },
  {
    publisher: 'TIME',
    label: 'A Viral French Ad Shows How Women’s Soccer Can Be Just as Exciting as Men’s',
    href: 'https://time.com/6295047/viral-france-advertisement-soccer-gender-orange/',
    use: 'Evidence for the signal on creative work that challenges sporting audience bias.',
  },
];

const signals = [
  {
    number: '01',
    title: 'Launch geography is becoming strategy',
    watch: 'Africa-first releases and locally meaningful launch experiences',
    reading: 'Nike × Air Afrique is significant because a global sneaker story reportedly began in Abidjan before global release. When place is part of the cultural meaning, sequencing can communicate respect, access and intent before a campaign line does.',
    question: 'Which global brands will move African markets from adaptation stage to first-release stage?',
  },
  {
    number: '02',
    title: 'Access is part of the creative idea',
    watch: 'Retail partners, payment mechanics and local participation',
    reading: 'An Africa-facing campaign becomes more credible when consumers can actually participate. Reported local access through Blu Lab and locally familiar payment mechanisms makes the Nike × Air Afrique story commercially more instructive than a heritage visual alone.',
    question: 'Will brands measure local access as carefully as global conversation?',
  },
  {
    number: '03',
    title: 'Women’s sport needs brands that build visibility',
    watch: 'Creative provocation connected to sustained sporting support',
    reading: 'Orange × Marcel showed how a simple reveal can confront audience bias in football. The African relevance question is what sponsors do after attention is won: help audiences discover, watch, attend and value women’s sport repeatedly.',
    question: 'Which Africa-facing sponsors will connect inclusive storytelling to durable sporting infrastructure?',
  },
  {
    number: '04',
    title: 'Diaspora memory is a brand system, not an aesthetic',
    watch: 'Products and experiences shaped by shared routes, return and cultural ownership',
    reading: 'Air Afrique carries meaning because it evokes movement between African cities and diaspora communities. Brand work rooted in those routes has greater potential when it acknowledges who holds the memory and how value flows back into the culture.',
    question: 'Who will treat diaspora connection as product and community design rather than seasonal imagery?',
  },
];

export default function BrandWeatherPage() {
  return (
    <IssueFeature
      franchise="BRAND WEATHER / FOUNDING BRIEFING"
      title="Four Signals Shaping African Influence Now"
      standfirst="The first Monokromatik watchlist: what recent creative work suggests brand builders should track before African relevance becomes a retrospective lesson."
      market="AFRICA / DIASPORA / GLOBAL SIGNALS"
      readingTime="5 MIN READ"
      evidence="SIGNAL BRIEFING"
      sources={sources}
      next={{ label: 'The Boardroom / The Backroom: Founding Conversation Commission', href: '/issues/001/boardroom-backroom' }}
    >
      <FeatureSection title="How to read Brand Weather">
        <p>Brand Weather is not a list of announcements and not a claim that two examples represent the whole market. It is a recurring Monokromatik intelligence format: source-led observations converted into questions worth carrying into brand planning, commissioning and investment decisions.</p>
        <p>This founding edition is anchored in the first Issue 001 cases. Its job is to show what a weekly briefing can become once the Source Desk is operating continuously across approved global and African sources.</p>
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

      <FeatureSection title="Editorial status">
        <p>This is a founding-format draft based on the Issue 001 source set, not yet a live weekly-monitoring output. Before public release, Monokromatik should expand the evidence set with additional approved current sources and confirm the first publication cadence for Brand Weather and The Weekly Signal.</p>
      </FeatureSection>
    </IssueFeature>
  );
}
