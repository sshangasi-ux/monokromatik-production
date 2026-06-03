import IssueFeature, { FeatureSection, PullQuote } from '../../../components/IssueFeature';
import { MediaStatus } from '../../../components/AttributedMedia';

const sources = [
  {
    publisher: 'Publicis France / Marcel',
    label: 'WoMen’s Football — Orange',
    href: 'https://www.publicisgroupe.com/en/news-france/wo-mens-football-orange-marcel',
    use: 'Official campaign rationale and production-credit source.',
  },
  {
    publisher: 'TIME',
    label: 'A Viral French Ad Shows How Women’s Soccer Can Be Just as Exciting as Men’s',
    href: 'https://time.com/6295047/viral-france-advertisement-soccer-gender-orange/',
    use: 'Independent reporting on the campaign idea and public response.',
  },
  {
    publisher: 'The Guardian / Moving the Goalposts',
    label: 'South Africa and the 2026 continental championship storylines',
    href: 'https://www.theguardian.com/football/2025/oct/30/cape-verde-double-celebration-and-coaching-turmoil-for-south-africa-wafcon-storylines-moving-the-goalposts',
    use: 'Current South African women’s-football context and reported preparation pressures.',
  },
];

export default function WillItLandSouthAfricaPage() {
  return (
    <IssueFeature
      franchise="WILL IT LAND? / SOUTH AFRICA TEST 001"
      title="Orange WoMen’s Football: Would the Reveal Be Enough in South Africa?"
      standfirst="A brilliant creative idea can challenge assumptions in minutes. In South Africa, where Banyana Banyana have already proved their standing, the harder question is whether attention becomes lasting visibility and support."
      market="GLOBAL IDEA / SOUTH AFRICA"
      readingTime="8 MIN READ"
      evidence="SOURCE-LED ANALYSIS"
      sources={sources}
      next={{ label: 'Brand Weather: Four Signals Shaping African Influence Now', href: '/issues/001/brand-weather' }}
    >
      <MediaStatus>The original Orange and Marcel work is treated as an official global reference. The South African application is Monokromatik analysis, not a claim that the campaign ran locally.</MediaStatus>

      <FeatureSection title="The global work">
        <p>Orange and agency Marcel released a film ahead of the 2023 FIFA Women’s World Cup that initially appeared to celebrate highlights from the French men’s national team. The reveal showed that the sporting performances belonged to the French women’s team, using the audience’s own reaction to expose an assumption about value and excitement in football.</p>
        <p>The closing message linked the idea to Orange’s support for both national teams. Contemporary reporting identified the film as a widely discussed example of creative work using surprise to confront bias rather than merely announcing an inclusive position.</p>
      </FeatureSection>

      <PullQuote>The creative idea is powerful because the audience supplies the assumption before the brand supplies the correction.</PullQuote>

      <FeatureSection title="Why South Africa is the right first test">
        <p>South African women’s football combines sporting proof with clear need for sustained attention. Banyana Banyana won the continental title in 2022 and qualified for the 2026 competition. That achievement means a South African version should never begin from the idea that women’s football needs to be rescued by a brand narrative.</p>
        <p>Recent reporting has also pointed to pressures surrounding preparation and the wider support environment. This creates the right strategic tension: excellence is already present, while the conditions that keep it visible and growing remain an important part of the story.</p>
        <p>A South African relevance test must therefore ask more than whether the reveal would attract views. It must ask what a brand does after the audience has recognised its own bias.</p>
      </FeatureSection>

      <PullQuote>In South Africa, the players have already proved that the game deserves attention. The brand role is to help that attention last.</PullQuote>

      <FeatureSection title="What would need adapting">
        <p><strong>Build from local voices.</strong> The story should be shaped with South African players, supporters and practitioners rather than simply reproducing the original creative technique.</p>
        <p><strong>Connect message to participation.</strong> Meaningful brand involvement would require a real relationship to the women’s football ecosystem, viewing access, development or audience-building.</p>
        <p><strong>Treat visibility as a system.</strong> Match discovery, viewing opportunities, attendance, athlete profiles and creator storytelling must sit alongside the hero film.</p>
        <p><strong>Measure what changes.</strong> A serious programme should look beyond impressions to changes in discovery, attendance, participation and profile, wherever those outcomes can be responsibly verified.</p>
      </FeatureSection>

      <FeatureSection title="The Monokromatik verdict">
        <p><strong>Would the insight land?</strong> Yes. The idea that audience assumptions shape how sporting excellence is recognised is relevant in South Africa.</p>
        <p><strong>Would the same execution be enough?</strong> No. A South African expression would need to honour the local athletes, local game and existing achievement behind the issue.</p>
        <p><strong>Would the film alone earn lasting credibility?</strong> No. The communication should sit inside visible, useful and sustained participation in women’s football.</p>
        <p>The opportunity is not simply to reproduce a highly praised international campaign. It is to translate its strategic intelligence into a South African commitment: recognise the audience assumption, then help build what comes after recognition.</p>
      </FeatureSection>

      <FeatureSection title="Publication verification status">
        <p><strong>Global campaign basis established:</strong> official and independent sources support the original creative premise and response.</p>
        <p><strong>South African lens established:</strong> the analysis is grounded in Banyana Banyana’s achievement and current reported support pressures.</p>
        <p><strong>Required before public release:</strong> confirm one informed South African contributor able to challenge or strengthen this analysis in their own words.</p>
      </FeatureSection>
    </IssueFeature>
  );
}
