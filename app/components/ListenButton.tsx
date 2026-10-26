'use client';

import { useEffect, useRef, useState } from 'react';
import { Volume2, Pause, Play, Square } from 'lucide-react';
import { track } from '../../lib/analytics';

/**
 * "Listen to this article" — in-browser narration via the Web Speech API.
 *
 * The defining 2026 publisher play (narrated articles lift story-completion
 * sharply), shipped here at zero marginal cost: no audio files, no backend, no
 * per-play metering. It reads the headline, standfirst and body aloud in the
 * reader's own browser voice. A premium brand-voice (Braam) MP3 layer can later
 * replace this per piece by passing `audioUrl` — the surface stays identical.
 *
 * Progressive enhancement: when speechSynthesis is unavailable the control
 * renders nothing, so unsupported browsers and no-JS see the article unchanged.
 */

// Strip Markdown to clean, speakable prose. Drops code fences, images, [n]
// citation marks and table pipes; keeps link text and sentence punctuation.
function toSpeech(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\[\d+\]/g, ' ')
    .replace(/^\s{0,3}[#>|]+/gm, ' ')
    .replace(/^\s{0,3}[-*+]\s+/gm, ' ')
    .replace(/[*_`~]/g, '')
    .replace(/\|/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Browsers choke on very long utterances (some cap well under a full feature),
// so queue the text as sentence-ish chunks. Pause/resume/cancel span the queue.
function chunk(text: string, max = 220): string[] {
  const out: string[] = [];
  const sentences = text.match(/[^.!?]+[.!?]+|\S+$/g) ?? [text];
  let buf = '';
  for (const s of sentences) {
    if ((buf + s).length > max && buf) {
      out.push(buf.trim());
      buf = '';
    }
    buf += s;
  }
  if (buf.trim()) out.push(buf.trim());
  return out;
}

type State = 'idle' | 'playing' | 'paused';

export default function ListenButton({
  slug,
  title,
  standfirst,
  content,
}: {
  slug: string;
  title: string;
  standfirst?: string;
  content: string;
}) {
  const [supported, setSupported] = useState(false);
  const [state, setState] = useState<State>('idle');
  const chunksRef = useRef<string[]>([]);

  useEffect(() => {
    setSupported(typeof window !== 'undefined' && 'speechSynthesis' in window);
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!supported) return null;

  const start = () => {
    const synth = window.speechSynthesis;
    synth.cancel();
    const text = [title, standfirst, toSpeech(content)].filter(Boolean).join('. ');
    const parts = chunk(text);
    chunksRef.current = parts;
    parts.forEach((part, i) => {
      const u = new SpeechSynthesisUtterance(part);
      u.lang = 'en-ZA';
      u.rate = 1;
      u.pitch = 1;
      if (i === parts.length - 1) {
        u.onend = () => setState('idle');
      }
      synth.speak(u);
    });
    setState('playing');
    track('article_listen', { slug, action: 'play' });
  };

  const toggle = () => {
    const synth = window.speechSynthesis;
    if (state === 'idle') return start();
    if (state === 'playing') {
      synth.pause();
      setState('paused');
      track('article_listen', { slug, action: 'pause' });
    } else {
      synth.resume();
      setState('playing');
      track('article_listen', { slug, action: 'resume' });
    }
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setState('idle');
    track('article_listen', { slug, action: 'stop' });
  };

  const playing = state === 'playing';

  return (
    <div className="mb-8 flex items-center gap-2">
      <button
        type="button"
        onClick={toggle}
        aria-label={state === 'idle' ? 'Listen to this article' : playing ? 'Pause narration' : 'Resume narration'}
        className="inline-flex items-center gap-2 border-2 border-mono-charcoal px-4 py-2 font-display font-bold text-[13px] uppercase tracking-[0.1em] text-mono-black transition-colors hover:border-mono-amber hover:text-mono-amber-strong"
      >
        {state === 'idle' ? (
          <>
            <Volume2 size={16} /> Listen
          </>
        ) : playing ? (
          <>
            <Pause size={16} /> Pause
          </>
        ) : (
          <>
            <Play size={16} /> Resume
          </>
        )}
      </button>
      {state !== 'idle' && (
        <button
          type="button"
          onClick={stop}
          aria-label="Stop narration"
          className="inline-flex items-center justify-center border-2 border-mono-charcoal p-2 text-mono-charcoal transition-colors hover:border-mono-amber hover:text-mono-amber-strong"
        >
          <Square size={15} />
        </button>
      )}
      <span className="font-body text-xs text-mono-gray">
        {state === 'idle' ? 'Hear it read aloud' : playing ? 'Narrating…' : 'Paused'}
      </span>
    </div>
  );
}
