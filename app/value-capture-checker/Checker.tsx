'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, RotateCcw } from 'lucide-react';

// A free, rule-based read of where a brand or property sits on MonoKromatik's
// Authorship → Ownership → Capture framework — the lead-magnet analogue of
// Analytics FC's GBE Calculator. Fully client-side: five questions score three
// axes, which map to one of the four ownership archetypes, each with a tailored
// diagnosis and the matched advisory service. The result is instant and free
// (never email-gated — that would kill its shareability); the email/service CTA
// comes after the verdict.

type Axis = 'authorship' | 'ownership' | 'capture' | 'gap' | 'cert';
interface Option { label: string; scores: Partial<Record<Axis, number>>; }
interface Question { id: string; prompt: string; options: Option[]; }

const QUESTIONS: Question[] = [
  {
    id: 'authorship',
    prompt: 'Who authored the core value — the idea, the culture, the audience, the talent?',
    options: [
      { label: 'Us / our community — it was authored here', scores: { authorship: 3 } },
      { label: 'A mix of us and outside partners', scores: { authorship: 2 } },
      { label: 'Mostly licensed or borrowed from elsewhere', scores: { authorship: 1 } },
    ],
  },
  {
    id: 'ownership',
    prompt: 'Who owns the IP, rights, catalogue, platform or entity that monetises it?',
    options: [
      { label: 'We own it outright', scores: { ownership: 3 } },
      { label: 'We share it with investors or partners', scores: { ownership: 2 } },
      { label: 'A third party owns it — a label, platform or licensor', scores: { ownership: 1 } },
      { label: 'Honestly, we’re not sure', scores: { ownership: 0 } },
    ],
  },
  {
    id: 'capture',
    prompt: 'Where does most of the money the work generates actually land?',
    options: [
      { label: 'With us — in-house / on the continent', scores: { capture: 3 } },
      { label: 'Split with partners', scores: { capture: 2 } },
      { label: 'Mostly with a foreign or third-party owner / platform', scores: { capture: 1 } },
      { label: 'Not sure', scores: { capture: 0 } },
    ],
  },
  {
    id: 'gap',
    prompt: 'Is your audience or cultural reach bigger than your revenue?',
    options: [
      { label: 'Yes — far more reach than revenue', scores: { gap: 2 } },
      { label: 'Roughly matched', scores: { gap: 1 } },
      { label: 'No — revenue is ahead of reach', scores: { gap: 0 } },
    ],
  },
  {
    id: 'cert',
    prompt: 'Do you own the thing that certifies your value — a premium platform, licensing, a direct-to-fan channel, your own IP vault?',
    options: [
      { label: 'Yes — we own that apparatus', scores: { cert: 2 } },
      { label: 'Partly', scores: { cert: 1 } },
      { label: 'No — someone else prices our value', scores: { cert: 0 } },
    ],
  },
];

type Archetype = 'RETAINED' | 'EXPORTED' | 'HOLLOWED' | 'CONTESTED';
interface Verdict {
  archetype: Archetype;
  headline: string;
  read: string;
  service: { label: string; href: string };
}

function classify(s: Record<Axis, number>): Verdict {
  const A = s.authorship ?? 0, O = s.ownership ?? 0, C = s.capture ?? 0;
  const underCertified = (s.gap ?? 0) >= 2 || (s.cert ?? 0) === 0;

  // RETAINED — you own what you author, and the margin lands home.
  if (A >= 2 && O >= 2 && C >= 2) {
    return {
      archetype: 'RETAINED',
      headline: 'You own what you author — the rare, strong position.',
      read:
        'Authorship, ownership and capture all sit with you. That is the goal state, and it is uncommon. The work now is to protect and compound it' +
        (underCertified ? ' — and your reach still runs ahead of your revenue, so there is a certification gap to close: own more of the apparatus that prices your value (licensing, premium platform, direct-to-fan).' : ': defend the IP, and build the certification apparatus before anyone else offers to.') ,
      service: { label: 'Get a full Signal Scorecard', href: '/work-with-us?interest=scorecard' },
    };
  }
  // HOLLOWED — you author it and nominally own it, but the economics leak out.
  if (A >= 2 && O >= 2 && C <= 1) {
    return {
      archetype: 'HOLLOWED',
      headline: 'The shell is yours; the substance is leaking out.',
      read:
        'You author the value and nominally own it — but most of the money lands elsewhere. That is the HOLLOWED pattern: a local licence or brand on top, the platform, the rights and the margin underneath owned by someone else. The fix is structural — re-own the layer that actually captures the value.',
      service: { label: 'Explore Value-Capture Advisory', href: '/work-with-us?interest=value-capture-advisory' },
    };
  }
  // CONTESTED — ownership is genuinely shared / in play.
  if (A >= 2 && O === 2) {
    return {
      archetype: 'CONTESTED',
      headline: 'Ownership is in play — this is the moment to decide.',
      read:
        'You author the value and ownership is genuinely shared or up for grabs. CONTESTED is the most valuable state, because the outcome is still being written — the choice is whether the upside ends up retained at home or exported. Get the read before the next deal decides it for you.',
      service: { label: 'Explore Value-Capture Advisory', href: '/work-with-us?interest=value-capture-advisory' },
    };
  }
  // EXPORTED — you author it, someone else owns and banks it. (Default leak.)
  return {
    archetype: 'EXPORTED',
    headline: 'You author the value; someone else owns and banks it.',
    read:
      'The core value is authored by you, but the rights, the ownership and most of the money sit with a third party. That is the EXPORTED pattern — the most common, and the most reversible with the right structure' +
      (underCertified ? '. Your reach also runs well ahead of your revenue, which is the tell of an under-certified, under-monetised asset.' : '. The work is to insert ownership and capture where today there is only authorship.'),
    service: { label: 'Explore Value-Capture Advisory', href: '/work-with-us?interest=value-capture-advisory' },
  };
}

const ARCHETYPE_NOTE: Record<Archetype, string> = {
  RETAINED: 'Authored, owned and captured at home.',
  EXPORTED: 'Authored here, owned and captured elsewhere.',
  HOLLOWED: 'Owned in name, hollowed in economics.',
  CONTESTED: 'Ownership genuinely still in play.',
};

export default function Checker() {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [verdict, setVerdict] = useState<Verdict | null>(null);

  const allAnswered = QUESTIONS.every((q) => answers[q.id] !== undefined);

  const compute = () => {
    const totals: Record<Axis, number> = { authorship: 0, ownership: 0, capture: 0, gap: 0, cert: 0 };
    QUESTIONS.forEach((q) => {
      const chosen = q.options[answers[q.id]];
      if (chosen) for (const [axis, val] of Object.entries(chosen.scores)) totals[axis as Axis] += val as number;
    });
    setVerdict(classify(totals));
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const reset = () => { setAnswers({}); setVerdict(null); };

  if (verdict) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="border-2 border-mono-black bg-mono-white p-7 md:p-10">
          <p className="text-[11px] tracking-[0.24em] font-display font-bold text-mono-gray mb-3">YOUR VALUE-CAPTURE READ</p>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="inline-block bg-mono-amber text-mono-black text-sm tracking-[0.18em] font-display font-bold px-4 py-2">
              {verdict.archetype}
            </span>
            <span className="text-[13px] font-body italic text-mono-charcoal">{ARCHETYPE_NOTE[verdict.archetype]}</span>
          </div>
          <h2 className="mt-6 text-2xl md:text-3xl font-display font-bold text-mono-black leading-tight">{verdict.headline}</h2>
          <p className="mt-5 font-body text-lg text-mono-charcoal leading-relaxed">{verdict.read}</p>

          <div className="mt-8 border-t border-mono-gray/20 pt-7">
            <p className="font-body text-mono-charcoal">
              This is the 60-second read. The full picture — your composite score, the four-axis breakdown,
              the named benchmarks and the roadmap — is what a <span className="font-semibold">Signal Scorecard</span> delivers.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Link href={verdict.service.href} className="inline-flex items-center gap-2 bg-mono-black text-mono-white px-7 py-3.5 font-display font-bold hover:bg-mono-charcoal transition-colors">
                {verdict.service.label.toUpperCase()} <ArrowRight size={16} />
              </Link>
              <Link href="/services" className="inline-flex items-center gap-2 border border-mono-black text-mono-black px-6 py-3.5 font-display font-bold hover:bg-mono-black hover:text-mono-white transition-colors">
                SEE ALL SERVICES
              </Link>
            </div>
          </div>
        </div>
        <button onClick={reset} className="mt-6 inline-flex items-center gap-2 text-[13px] tracking-[0.08em] font-display font-bold text-mono-charcoal hover:text-mono-amber-strong">
          <RotateCcw size={14} /> START OVER
        </button>
        <p className="mt-8 text-[12px] font-body text-mono-gray leading-relaxed">
          Indicative only — a framework read from your answers, not a verified valuation. The archetypes are
          MonoKromatik’s Authorship&nbsp;→&nbsp;Ownership&nbsp;→&nbsp;Capture model.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="space-y-8">
        {QUESTIONS.map((q, qi) => (
          <fieldset key={q.id} className="border border-mono-gray/25 bg-mono-white p-6 md:p-7">
            <legend className="px-2 -ml-2">
              <span className="text-[11px] tracking-[0.2em] font-display font-bold text-mono-amber-strong">{`Q0${qi + 1}`}</span>
            </legend>
            <p className="font-display font-bold text-lg text-mono-black leading-snug">{q.prompt}</p>
            <div className="mt-4 space-y-2.5">
              {q.options.map((opt, oi) => {
                const checked = answers[q.id] === oi;
                return (
                  <label
                    key={oi}
                    className={`flex items-start gap-3 p-3.5 border cursor-pointer transition-colors ${checked ? 'border-mono-black bg-mono-soft-white' : 'border-mono-gray/25 hover:border-mono-gray/50'}`}
                  >
                    <input
                      type="radio"
                      name={q.id}
                      checked={checked}
                      onChange={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                      className="mt-1 accent-mono-black shrink-0"
                    />
                    <span className="font-body text-[15px] text-mono-charcoal leading-snug">{opt.label}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>

      <div className="mt-9 flex flex-col items-center gap-3">
        <button
          onClick={compute}
          disabled={!allAnswered}
          className="inline-flex items-center gap-2 bg-mono-amber text-mono-black px-8 py-4 font-display font-bold hover:bg-mono-amber/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          SEE MY VALUE-CAPTURE READ <ArrowRight size={18} />
        </button>
        {!allAnswered && (
          <p className="text-[12px] font-body text-mono-gray">Answer all five to get your read — it’s free and instant.</p>
        )}
      </div>
    </div>
  );
}
