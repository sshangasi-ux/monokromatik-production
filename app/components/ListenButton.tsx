'use client';

import { useEffect, useRef, useState } from 'react';
import { Volume2, Pause, Play, Square } from 'lucide-react';
import { track } from '../../lib/analytics';

/**
 * "Listen to this article" — two tiers behind one control:
 *
 *  1. PREMIUM (audioUrl set): plays a Braam brand-voice MP3 of the full piece
 *     (the cloned Higgsfield voice element — see braam-brand-voice). A real
 *     narrated player with a scrub bar, labelled with the brand voice. Reserved
 *     for flagship pieces.
 *  2. FREE fallback (no audioUrl): in-browser narration via the Web Speech API —
 *     the defining 2026 publisher play, shipped at zero marginal cost across all
 *     199 articles. Progressive enhancement: renders nothing when speechSynthesis
 *     is unavailable, so unsupported browsers see the article unchanged.
 *
 * ListenButton just picks the tier; each is its own component so hooks stay
 * unconditional.
 */

export default function ListenButton(props: {
  slug: string;
  title: string;
  standfirst?: string;
  content: string;
  /** When present, play this Braam-voice MP3 instead of the free Web Speech. */
  audioUrl?: string;
}) {
  if (props.audioUrl) {
    return <BraamPlayer slug={props.slug} audioUrl={props.audioUrl} />;
  }
  return (
    <WebSpeechButton slug={props.slug} title={props.title} standfirst={props.standfirst} content={props.content} />
  );
}

function fmt(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

// ── Premium tier: Braam MP3 player ──────────────────────────────────────────
function BraamPlayer({ slug, audioUrl }: { slug: string; audioUrl: string }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);

  const toggle = () => {
    const el = ref.current;
    if (!el) return;
    if (el.paused) {
      el.play().catch(() => { /* autoplay/network guard */ });
      track('article_listen', { slug, action: 'play', mode: 'braam' });
    } else {
      el.pause();
      track('article_listen', { slug, action: 'pause', mode: 'braam' });
    }
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || !dur) return;
    const rect = e.currentTarget.getBoundingClientRect();
    el.currentTime = ((e.clientX - rect.left) / rect.width) * dur;
  };

  const pct = dur ? (cur / dur) * 100 : 0;

  return (
    <div className="mb-8 border-2 border-mono-charcoal bg-mono-soft-white p-3">
      <audio
        ref={ref}
        src={audioUrl}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => { setPlaying(false); track('article_listen', { slug, action: 'ended', mode: 'braam' }); }}
        onTimeUpdate={(e) => setCur(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDur(e.currentTarget.duration)}
      />
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? 'Pause narration' : 'Play narration'}
          className="inline-flex shrink-0 items-center justify-center bg-mono-black p-2.5 text-mono-amber transition-colors hover:bg-mono-charcoal"
        >
          {playing ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <span className="font-display text-[11px] font-bold uppercase tracking-[0.14em] text-mono-black">
              Listen · narrated by Braam
            </span>
            <span className="shrink-0 font-body text-[11px] tabular-nums text-mono-gray">
              {fmt(cur)} / {fmt(dur)}
            </span>
          </div>
          <div
            onClick={seek}
            role="slider"
            aria-label="Seek"
            aria-valuemin={0}
            aria-valuemax={Math.round(dur)}
            aria-valuenow={Math.round(cur)}
            tabIndex={0}
            className="h-1.5 cursor-pointer bg-mono-charcoal/20"
          >
            <div className="h-full bg-mono-amber" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Free tier: Web Speech narration ─────────────────────────────────────────
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

function WebSpeechButton({
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
    parts.forEach((part, i) => {
      const u = new SpeechSynthesisUtterance(part);
      u.lang = 'en-ZA';
      u.rate = 1;
      u.pitch = 1;
      if (i === parts.length - 1) u.onend = () => setState('idle');
      synth.speak(u);
    });
    setState('playing');
    track('article_listen', { slug, action: 'play', mode: 'tts' });
  };

  const toggle = () => {
    const synth = window.speechSynthesis;
    if (state === 'idle') return start();
    if (state === 'playing') {
      synth.pause();
      setState('paused');
      track('article_listen', { slug, action: 'pause', mode: 'tts' });
    } else {
      synth.resume();
      setState('playing');
      track('article_listen', { slug, action: 'resume', mode: 'tts' });
    }
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setState('idle');
    track('article_listen', { slug, action: 'stop', mode: 'tts' });
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
          <><Volume2 size={16} /> Listen</>
        ) : playing ? (
          <><Pause size={16} /> Pause</>
        ) : (
          <><Play size={16} /> Resume</>
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
