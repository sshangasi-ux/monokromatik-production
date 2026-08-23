// Scene script for the render (mirrors build/scenes.mjs, which drives the VO).
export type Scene = {
  id: string;
  kind: 'title' | 'statement' | 'stat' | 'pull' | 'sources' | 'cta';
  accent?: boolean;
  kicker?: string;
  title?: string;
  title2?: string;
  line?: string;
  value?: string;
  label?: string;
  cite?: string;
  items?: string[];
  url?: string;
};

export const SCENES: Scene[] = [
  { id: 'intro', kind: 'title', kicker: 'MONOKROMATIK · BRAND INTELLIGENCE', title: 'The Premier League Is More African Than Ever.', title2: 'Africa Still Owns None of the Upside.' },
  { id: 'hook', kind: 'statement', line: 'The most African season in the league’s history — on the pitch, and in the stands.' },
  { id: 'machine', kind: 'stat', value: '£6.7bn', label: 'UK live TV rights, 2025–2029 — the biggest sports-media deal in British history', cite: 'Sky Sports' },
  { id: 'players', kind: 'stat', value: '78', label: 'African players in the Premier League, 2025/26', cite: 'ESPN' },
  { id: 'audience', kind: 'stat', value: '~300M', label: 'People in Africa who watch the Premier League — more than in the UK', cite: 'GeoPoll · Hudson Sandler' },
  { id: 'rwanda', kind: 'stat', accent: true, value: '£20m', label: 'Visit Rwanda’s Aston Villa front-of-shirt deal — the one prominent African name', cite: 'SportsPro' },
  { id: 'tension', kind: 'statement', line: 'Africa supplies the talent and the audience. The value flows out.' },
  { id: 'take', kind: 'pull', line: 'Passion is not a stake. Audience is not equity.' },
  { id: 'sources', kind: 'sources', line: 'Every figure, sourced.', items: ['Premier League', 'Sky Sports', 'SportsPro', 'Finance Football', 'ESPN', 'GeoPoll'] },
  { id: 'cta', kind: 'cta', line: 'The full breakdown — and who could own the upside.', url: 'monokromatik.com' },
];

export const SHORT_IDS = ['intro', 'rwanda', 'take', 'cta'];
