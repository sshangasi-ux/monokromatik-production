// The video's scene script: VO text (spoken) + on-screen data (captions/visuals).
// VO spells numbers phonetically so macOS `say` reads them naturally; the visual
// shows the clean figure. Data is pulled from the EPL lead article.
export const SCENES = [
  {
    id: 'intro', kind: 'title',
    vo: 'The Premier League is more African than ever. And Africa still owns none of the upside.',
    kicker: 'MONOKROMATIK · BRAND INTELLIGENCE',
    title: 'The Premier League Is More African Than Ever.',
    title2: 'Africa Still Owns None of the Upside.',
  },
  {
    id: 'hook', kind: 'statement',
    vo: 'This Friday, the league kicks off its most African season in history. Record talent on the pitch, around three hundred million African viewers off it.',
    line: 'The most African season in the league’s history — on the pitch, and in the stands.',
  },
  {
    id: 'machine', kind: 'stat',
    vo: 'It is the richest sports competition on earth. Six point seven billion pounds in U.K. television rights alone.',
    value: '£6.7bn', label: 'UK live TV rights, 2025–2029 — the biggest sports-media deal in British history', cite: 'Sky Sports',
  },
  {
    id: 'players', kind: 'stat',
    vo: 'Last season, seventy-eight African players took the field.',
    value: '78', label: 'African players in the Premier League, 2025/26', cite: 'ESPN',
  },
  {
    id: 'audience', kind: 'stat',
    vo: 'Three hundred million Africans watch. More fans than in Britain itself. In Kenya, ninety-six percent of football fans follow it.',
    value: '~300M', label: 'People in Africa who watch the Premier League — more than in the UK', cite: 'GeoPoll · Hudson Sandler',
  },
  {
    id: 'rwanda', kind: 'stat', accent: true,
    vo: 'And yet. The only prominent African name on a twenty twenty-six shirt is a government tourism board. Visit Rwanda paid twenty million pounds to rent Aston Villa’s chest.',
    value: '£20m', label: 'Visit Rwanda’s Aston Villa front-of-shirt deal — the one prominent African name', cite: 'SportsPro',
  },
  {
    id: 'tension', kind: 'statement',
    vo: 'Africa supplies the players. Africa supplies the audience. But the value flows out — talent exported, fans monetised by foreign broadcasters and foreign bookmakers.',
    line: 'Africa supplies the talent and the audience. The value flows out.',
  },
  {
    id: 'take', kind: 'pull',
    vo: 'The gambling ban that reset the shirt is the tell. Moving a logo to the sleeve is a repositioning, not a reform. Passion is not a stake. Audience is not equity.',
    line: 'Passion is not a stake. Audience is not equity.',
  },
  {
    id: 'sources', kind: 'sources',
    vo: 'Every number here is sourced. Premier League. Sky Sports. SportsPro. GeoPoll.',
    line: 'Every figure, sourced.',
    items: ['Premier League', 'Sky Sports', 'SportsPro', 'Finance Football', 'ESPN', 'GeoPoll'],
  },
  {
    id: 'cta', kind: 'cta',
    vo: 'Read the full breakdown. Who could finally own that upside. On MonoKromatik.',
    line: 'The full breakdown — and who could own the upside.',
    url: 'monokromatik.com',
  },
];

// The Short = a punchy subset (title → the twist → the take → CTA).
export const SHORT_IDS = ['intro', 'rwanda', 'take', 'cta'];
