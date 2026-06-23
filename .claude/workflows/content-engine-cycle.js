export const meta = {
  name: 'mk-content-engine-cycle',
  description: 'Autonomous AI-led content cycle: web-source + draft review-ready, cited content across all five sections',
  phases: [
    { title: 'Source + Draft', detail: 'one web-research+draft agent per section (Signal, Intelligence, Issues, Conversations, Culture)' },
  ],
}

const SECTION_OUTPUT = {
  type: 'object',
  additionalProperties: false,
  properties: {
    section: { type: 'string' },
    items: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          title: { type: 'string' },
          format: { type: 'string' },
          angle: { type: 'string', description: 'the strategic angle in one line' },
          draft: { type: 'string', description: 'the markdown draft body or brief' },
          sources: { type: 'array', items: { type: 'string' }, description: 'real source URLs cited' },
          confidence: { type: 'string', enum: ['verified', 'partial', 'interpretive'] },
          needsHumanApproval: { type: 'boolean' },
        },
        required: ['title', 'format', 'angle', 'draft', 'sources', 'confidence', 'needsHumanApproval'],
      },
    },
    notes: { type: 'string' },
  },
  required: ['section', 'items'],
}

const GUARDRAIL = `You are a section editor for MonoKromatik, an African & diaspora culture and brand-intelligence publication (voice: strategic, evidence-led, African-authored, no hype). USE WEB SEARCH to find CURRENT (2026) real material. NON-NEGOTIABLE INTEGRITY RULES: cite every factual claim with a real source URL; NEVER invent quotes, statistics, names, or sources; if you can't source it, don't claim it; set confidence honestly (verified/partial/interpretive); set needsHumanApproval=true for anything carrying analysis, quotes, scores or claims. These are DRAFTS for human editorial approval — not for auto-publish. `

const sections = [
  { label: 'Signal', prompt: GUARDRAIL + 'SECTION: Signal (the editorial feed). Find 2 current African/diaspora brand, campaign, creator or culture stories worth a dispatch. For each item: a tight dispatch (180–250 words) + a "Brand Read" (3–4 sentence strategic take — what moved because this existed, who shaped it, who captured value). format="dispatch + brand read".' },
  { label: 'Intelligence', prompt: GUARDRAIL + 'SECTION: Intelligence (case studies). Find 1 current campaign/brand move that merits a six-dimension decode. Draft: THE CONTEXT, THE STRATEGIC BET, THE CREATIVE MOVE, THE EVIDENCE (confirmed vs reported vs not-claimed), THE AFRICAN READ, THE LESSON — each sourced. Also give the four-axis decode levels 1–5 (IDEA, AUTHORSHIP, EXECUTION, CONSEQUENCE) with one-line notes. format="case-study decode". needsHumanApproval=true.' },
  { label: 'Issues', prompt: GUARDRAIL + 'SECTION: Issues (curated magazine editions). Propose the NEXT issue: a theme, a one-paragraph editorial argument, and a feature slate of 5–6 features mapped to the franchises (The Work, Will It Land?, Brand Weather, Culture, The Boardroom/Backroom), each with a one-line premise grounded in current real stories you find. This is a PLAN, not fabricated features. format="issue plan".' },
  { label: 'Conversations', prompt: GUARDRAIL + 'SECTION: Conversations (contributor voices). DO NOT fabricate interviews. Instead, propose 3 REAL, named, currently-active African/diaspora marketers, creators or cultural operators worth interviewing — for each: who they are (with a real source/bio URL), why now, and 4–5 sharp interview questions. format="interview brief". needsHumanApproval=true.' },
  { label: 'Culture', prompt: GUARDRAIL + 'SECTION: Culture (Roots / Arena / Waves — heritage, sport, music). Find 2 current African/diaspora culture moments (one music/Waves, one sport/Arena or heritage/Roots). For each: a short culture piece (150–220 words) with the cultural read. format="culture piece".' },
]

phase('Source + Draft')
const results = await parallel(
  sections.map((s) => () => agent(s.prompt, {
    schema: SECTION_OUTPUT,
    agentType: 'general-purpose',
    phase: 'Source + Draft',
    label: 'draft:' + s.label,
  }))
)

const ok = results.filter(Boolean)
log(`Engine cycle: ${ok.length}/${sections.length} sections drafted, ${ok.reduce((n, r) => n + (r.items?.length || 0), 0)} items total`)
return {
  generatedSections: ok.length,
  sections: ok,
}