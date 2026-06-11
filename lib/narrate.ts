// MonoKromatik narration — turn written articles into audio stories.
//
// Provider-agnostic + secret-gated, OpenAI-compatible speech contract
// (`POST {TTS_API_URL}` with { model, voice, input } → audio bytes), which
// OpenAI, and most TTS gateways implement. No key → null, so scheduling the
// narrator before secrets exist is a safe no-op.
//
//   TTS_API_KEY   required to enable
//   TTS_API_URL   default https://api.openai.com/v1/audio/speech
//   TTS_MODEL     default gpt-4o-mini-tts
//   TTS_VOICE     default "onyx"

// OpenAI's TTS caps input ~4096 chars; we narrate a tight "audio edition" —
// title, standfirst, and the opening movement of the piece.
const MAX_CHARS = 3800;

/** Strip markdown to clean prose for the narrator. */
function toSpokenText(title: string, excerpt: string, content: string): string {
  const body = content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_`>#]/g, '')
    .replace(/\n{2,}/g, '\n\n')
    .trim();
  const intro = `${title}. ${excerpt}\n\n`;
  const room = MAX_CHARS - intro.length;
  const trimmed = body.length > room ? body.slice(0, room).replace(/\s+\S*$/, '') + '…' : body;
  return intro + trimmed;
}

/**
 * Synthesize an article into an mp3 buffer, or null if TTS is unconfigured or
 * fails. Caller writes the bytes + records the manifest entry.
 */
export async function narrate(args: { title: string; excerpt: string; content: string }): Promise<Buffer | null> {
  const key = process.env.TTS_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(process.env.TTS_API_URL || 'https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.TTS_MODEL || 'gpt-4o-mini-tts',
        voice: process.env.TTS_VOICE || 'onyx',
        input: toSpokenText(args.title, args.excerpt, args.content),
        response_format: 'mp3',
      }),
      signal: AbortSignal.timeout(120000),
    });
    if (!res.ok) {
      console.log(`   ✗ tts: HTTP ${res.status}`);
      return null;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    return buf.length > 1024 ? buf : null;
  } catch (e) {
    console.log(`   ✗ tts: ${e instanceof Error ? e.message : 'failed'}`);
    return null;
  }
}
