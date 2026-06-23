'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Send, Sparkles } from 'lucide-react';
import Navigation from '../components/Navigation';

interface Source {
  title: string;
  url: string;
  type: string;
}

const EXAMPLES = [
  'What does MonoKromatik say about African authorship in global brand work?',
  'How did the 2026 World Cup sponsors treat African markets?',
  'Which moves show African ownership of value at the source?',
  'What is the Brand Read on Afrobeats going global?',
];

const TYPE_LABEL: Record<string, string> = {
  'case-study': 'CASE STUDY',
  report: 'REPORT',
  'brand-read': 'BRAND READ',
};

export default function AskPage() {
  const [question, setQuestion] = useState('');
  const [asked, setAsked] = useState('');
  const [answer, setAnswer] = useState('');
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function ask(q: string) {
    const query = q.trim();
    if (!query || loading) return;
    setLoading(true);
    setError('');
    setAnswer('');
    setSources([]);
    setAsked(query);
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong.');
      setAnswer(data.answer || '');
      setSources(data.sources || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ask failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-mono-paper">
      <Navigation />

      <section className="bg-mono-black text-mono-white py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.34em] font-display font-bold text-mono-amber-bright mb-6 inline-flex items-center gap-2">
            <Sparkles size={14} /> ASK MONOKROMATIK
          </p>
          <h1 className="text-4xl md:text-6xl font-feature font-bold leading-[0.97]">
            Ask the intelligence, not the internet.
          </h1>
          <p className="mt-6 text-lg md:text-xl font-feature italic text-mono-soft-white leading-snug">
            Answers drawn only from MonoKromatik’s own reviewed case studies, reports and Brand Reads — cited, and
            honest when we haven’t covered something.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(question);
            }}
            className="mt-9"
          >
            <div className="flex items-center gap-2 bg-mono-white border border-mono-white/20 focus-within:border-mono-amber-bright">
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask about a brand, campaign, artist, market…"
                aria-label="Ask MonoKromatik a question"
                className="flex-1 bg-transparent text-mono-black placeholder:text-mono-gray font-body px-5 py-4 focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading || !question.trim()}
                className="m-1.5 inline-flex items-center gap-2 bg-mono-amber text-mono-black px-5 py-3 font-display font-bold disabled:opacity-50"
              >
                {loading ? 'THINKING…' : 'ASK'} <Send size={15} />
              </button>
            </div>
          </form>

          <div className="mt-6 flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => {
                  setQuestion(ex);
                  ask(ex);
                }}
                className="text-left text-xs font-body text-mono-soft-white border border-mono-white/20 px-3 py-2 hover:border-mono-amber-bright transition-colors"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {!asked && !loading && (
            <p className="font-body text-mono-charcoal">
              Grounded in {''}
              <Link href="/intelligence/case-studies" className="text-mono-amber-strong hover:text-mono-amber-hover font-display font-bold">
                the case-study library
              </Link>
              , the reports and every published Brand Read. It will not answer from outside that work.
            </p>
          )}

          {asked && (
            <div>
              <p className="text-[11px] tracking-[0.2em] font-display font-bold text-mono-gray mb-3">YOUR QUESTION</p>
              <p className="text-2xl md:text-3xl font-feature font-bold text-mono-black leading-tight mb-8">{asked}</p>
            </div>
          )}

          {loading && (
            <div className="space-y-3" aria-live="polite">
              <div className="h-3 w-3/4 img-shimmer" />
              <div className="h-3 w-full img-shimmer" />
              <div className="h-3 w-5/6 img-shimmer" />
            </div>
          )}

          {error && (
            <div className="border-l-4 border-mono-amber bg-mono-soft-white p-5 font-body text-mono-charcoal">{error}</div>
          )}

          {answer && !loading && (
            <div>
              <div className="space-y-4 text-lg text-mono-charcoal font-body leading-relaxed whitespace-pre-wrap">
                {answer}
              </div>

              {sources.length > 0 && (
                <div className="mt-10 border-t border-mono-gray/20 pt-6">
                  <p className="text-[11px] tracking-[0.2em] font-display font-bold text-mono-amber-strong mb-4">
                    SOURCES — FROM MONOKROMATIK
                  </p>
                  <div className="space-y-2">
                    {sources.map((s) => (
                      <Link
                        key={s.url}
                        href={s.url}
                        className="group flex items-center justify-between gap-3 border border-mono-gray/20 px-4 py-3 hover:border-mono-amber transition-colors"
                      >
                        <span className="flex items-center gap-3">
                          <span className="text-[9px] tracking-[0.16em] font-display font-bold text-mono-amber-strong">
                            {TYPE_LABEL[s.type] ?? s.type.toUpperCase()}
                          </span>
                          <span className="font-body text-sm text-mono-black group-hover:text-mono-amber transition-colors">
                            {s.title}
                          </span>
                        </span>
                        <ArrowRight size={15} className="text-mono-gray group-hover:text-mono-amber shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <p className="mt-8 text-xs text-mono-gray font-body">
                Ask MonoKromatik answers only from MonoKromatik’s reviewed work and cites it. Always verify against the
                linked sources.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
