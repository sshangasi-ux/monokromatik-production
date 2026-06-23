import Anthropic from '@anthropic-ai/sdk';
import { MODELS } from '../../../lib/ai-models';
import { buildCorpus, retrieve } from '../../../lib/corpus';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Lazy client (same reason as the agent pipeline: env must resolve first).
let _client: Anthropic | null = null;
function client(): Anthropic {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _client;
}

const SYSTEM = `You are "Ask MonoKromatik", the grounded research assistant for MonoKromatik Network — an African & diaspora culture and brand-intelligence publication.

ABSOLUTE RULES:
- Answer ONLY from the SOURCES given in the user message. They are MonoKromatik's own published case studies, reports and Brand Reads.
- Do NOT use outside knowledge. Do NOT add facts, figures, names or quotes the sources don't contain. Never invent a source.
- If the sources don't answer the question, say plainly that MonoKromatik hasn't covered it yet, and point to the nearest relevant source if there is one. Do not guess or generalise from training data.
- Cite the sources you used by their exact title. Keep it tight and analytical, in MonoKromatik's Brand-Read voice: strategic, evidence-led, African-authored. No hype.`;

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { question?: unknown };
    const question = typeof body.question === 'string' ? body.question.trim() : '';
    if (!question) {
      return Response.json({ error: 'Ask a question.' }, { status: 400 });
    }
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY.startsWith('your_')) {
      return Response.json({ error: 'Ask MonoKromatik is not configured (no API key).' }, { status: 503 });
    }

    const top = retrieve(question, buildCorpus(), 8);
    if (top.length === 0) {
      return Response.json({
        answer:
          "I couldn't find anything in MonoKromatik's published work that speaks to that. Ask me about a brand, campaign, artist, market or case study we've covered.",
        sources: [],
      });
    }

    const context = top
      .map((d, i) => `SOURCE ${i + 1} — "${d.title}" (${d.type}, ${d.url})\n${d.text}`)
      .join('\n\n---\n\n');

    const msg = await client().messages.create({
      model: MODELS.flagship,
      max_tokens: 1024,
      system: SYSTEM,
      messages: [
        {
          role: 'user',
          content: `SOURCES:\n\n${context}\n\n---\n\nQUESTION: ${question}`,
        },
      ],
    });

    const answer = msg.content[0]?.type === 'text' ? msg.content[0].text : '';
    return Response.json({
      answer,
      sources: top.map((d) => ({ title: d.title, url: d.url, type: d.type })),
    });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Ask MonoKromatik failed.' },
      { status: 500 }
    );
  }
}
