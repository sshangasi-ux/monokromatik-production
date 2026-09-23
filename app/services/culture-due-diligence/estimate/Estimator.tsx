'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Lock } from 'lucide-react';

// UX-led scope & estimate builder for Culture Due Diligence. Bespoke engagements
// are scoped fixed-fee, billed in stages — never a self-serve card charge — so this
// tool makes a bespoke engagement legible and priceable BEFORE the scoping call,
// then routes to the commissioning enquiry (not a checkout). Bands mirror
// docs/BILLING-CULTURE-DD.md. All figures are indicative; the firm quote follows
// the call.

interface Module { id: string; name: string; note: string; low: number; high: number; core?: boolean; partner?: boolean; }
const MODULES: Module[] = [
  { id: 'core', name: 'Value-Capture & Authorship Read', note: 'The core read — always included.', low: 9000, high: 14000, core: true },
  { id: 'reputational', name: 'Reputational & Integrity Read', note: 'The risks outside the data room.', low: 5000, high: 8000 },
  { id: 'financial', name: 'Financial & Valuation Read', note: 'The value-capture → valuation bridge.', low: 8000, high: 16000 },
  { id: 'legal', name: 'Legal & Transaction Read', note: 'Ownership of the certification apparatus. Partner-delivered.', low: 7000, high: 14000, partner: true },
  { id: 'retention', name: 'Post-Deal Retention & Value-Creation Plan', note: 'The plan to keep what the asset authors.', low: 6000, high: 10000 },
];

const DEAL_SIZES = [
  { id: 'u5', label: 'Under $5m', mult: 0.85 },
  { id: '5-25', label: '$5m – $25m', mult: 1.0 },
  { id: '25-100', label: '$25m – $100m', mult: 1.35 },
  { id: '100+', label: '$100m+', mult: 1.8 },
];
const VERTICALS = [
  { id: '1', label: 'One category', mult: 1.0 },
  { id: '2', label: 'Two categories', mult: 1.2 },
  { id: '3', label: 'Three or more', mult: 1.4 },
];
const TURNAROUND = [
  { id: 'std', label: 'Standard · 3–4 weeks', mult: 1.0 },
  { id: 'exp', label: 'Expedited · ≤2 weeks', mult: 1.3 },
];

const fmt = (n: number) => '$' + (Math.round(n / 500) * 500).toLocaleString('en-US');

export default function Estimator() {
  const [selected, setSelected] = useState<Record<string, boolean>>({ core: true, reputational: true, financial: true, retention: true, legal: false });
  const [deal, setDeal] = useState('5-25');
  const [verticals, setVerticals] = useState('1');
  const [turn, setTurn] = useState('std');

  const mult = useMemo(() => {
    const d = DEAL_SIZES.find((x) => x.id === deal)!.mult;
    const v = VERTICALS.find((x) => x.id === verticals)!.mult;
    const t = TURNAROUND.find((x) => x.id === turn)!.mult;
    return d * v * t;
  }, [deal, verticals, turn]);

  const chosen = MODULES.filter((m) => m.core || selected[m.id]);
  const baseLow = chosen.reduce((a, m) => a + m.low, 0);
  const baseHigh = chosen.reduce((a, m) => a + m.high, 0);
  const low = baseLow * mult;
  const high = baseHigh * mult;
  const hasPartner = chosen.some((m) => m.partner);

  const toggle = (m: Module) => {
    if (m.core) return;
    setSelected((s) => ({ ...s, [m.id]: !s[m.id] }));
  };

  const radio = (
    label: string,
    opts: { id: string; label: string }[],
    val: string,
    set: (v: string) => void,
  ) => (
    <div>
      <p className="text-[11px] tracking-[0.16em] font-display font-bold text-mono-gray uppercase mb-2.5">{label}</p>
      <div className="flex flex-wrap gap-2">
        {opts.map((o) => {
          const on = val === o.id;
          return (
            <button
              key={o.id}
              type="button"
              aria-pressed={on}
              onClick={() => set(o.id)}
              className={`text-[13px] font-display font-bold px-3.5 py-2.5 border transition-colors ${on ? 'border-mono-black bg-mono-black text-mono-white' : 'border-mono-gray/30 text-mono-charcoal hover:border-mono-gray/60'}`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-12 items-start">
      {/* Configurator */}
      <div className="space-y-9">
        <div>
          <p className="text-[11px] tracking-[0.16em] font-display font-bold text-mono-gray uppercase mb-3.5">Scope — choose the modules</p>
          <div className="space-y-2.5">
            {MODULES.map((m) => {
              const on = m.core || selected[m.id];
              return (
                <label
                  key={m.id}
                  className={`flex items-start gap-3 p-4 border transition-colors ${m.core ? 'border-mono-black bg-mono-soft-white cursor-default' : `cursor-pointer ${on ? 'border-mono-black bg-mono-soft-white' : 'border-mono-gray/25 hover:border-mono-gray/50'}`}`}
                >
                  <input
                    type="checkbox"
                    checked={on}
                    disabled={m.core}
                    onChange={() => toggle(m)}
                    className="mt-1 accent-mono-black shrink-0"
                  />
                  <span className="flex-1">
                    <span className="flex items-center flex-wrap gap-x-2 gap-y-1">
                      <span className="font-display font-bold text-[15px] text-mono-black">{m.name}</span>
                      {m.core && <span className="inline-flex items-center gap-1 text-[10px] tracking-[0.1em] font-display font-bold text-mono-amber-strong"><Lock size={11} /> CORE</span>}
                      {m.partner && <span className="text-[10px] tracking-[0.1em] font-display font-bold text-mono-gray uppercase">Partner</span>}
                    </span>
                    <span className="block mt-1 font-body text-[13px] text-mono-charcoal leading-snug">{m.note}</span>
                  </span>
                  <span className="font-display font-bold text-[13px] text-mono-charcoal whitespace-nowrap tabular-nums pt-0.5">
                    {m.core ? `${fmt(m.low)}–${fmt(m.high)}` : `+${fmt(m.low)}`}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {radio('Deal size', DEAL_SIZES, deal, setDeal)}
        {radio('Categories in scope', VERTICALS, verticals, setVerticals)}
        {radio('Turnaround', TURNAROUND, turn, setTurn)}
      </div>

      {/* Estimate summary */}
      <div className="lg:sticky lg:top-24">
        <div className="border-2 border-mono-black bg-mono-white p-7">
          <p className="text-[11px] tracking-[0.2em] font-display font-bold text-mono-amber-strong uppercase mb-2">Indicative estimate</p>
          <p className="text-4xl md:text-[42px] font-display font-bold text-mono-black leading-none tabular-nums">
            {fmt(low)}<span className="text-mono-gray"> – </span>{fmt(high)}
          </p>
          <p className="mt-2 text-[12px] font-body text-mono-gray">USD · fixed-fee · before partner pass-through</p>

          <div className="mt-6 border-t border-mono-gray/20 pt-5">
            <p className="text-[10px] tracking-[0.16em] font-display font-bold text-mono-gray uppercase mb-3">In scope</p>
            <ul className="space-y-1.5">
              {chosen.map((m) => (
                <li key={m.id} className="flex items-start gap-2 font-body text-[13.5px] text-mono-charcoal">
                  <Check size={15} className="text-mono-amber-strong shrink-0 mt-0.5" aria-hidden="true" />
                  {m.name}{m.partner && <span className="text-mono-gray"> (partner)</span>}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[12px] font-body text-mono-gray">
              Scope multiplier applied: ×{mult.toFixed(2)} (deal size · categories · turnaround).
            </p>
          </div>

          <div className="mt-5 border-t border-mono-gray/20 pt-5">
            <p className="text-[10px] tracking-[0.16em] font-display font-bold text-mono-gray uppercase mb-3">Billed in stages</p>
            <div className="space-y-1.5 font-body text-[13.5px] text-mono-charcoal">
              <div className="flex justify-between"><span>40% deposit · on engagement</span><span className="tabular-nums text-mono-gray">{fmt(low * 0.4)}–{fmt(high * 0.4)}</span></div>
              <div className="flex justify-between"><span>30% · on draft delivery</span><span className="tabular-nums text-mono-gray">{fmt(low * 0.3)}–{fmt(high * 0.3)}</span></div>
              <div className="flex justify-between"><span>30% · on final delivery</span><span className="tabular-nums text-mono-gray">{fmt(low * 0.3)}–{fmt(high * 0.3)}</span></div>
            </div>
          </div>

          {hasPartner && (
            <p className="mt-5 text-[12px] font-body text-mono-charcoal border-l-2 border-mono-amber pl-3">
              The Legal module is partner-delivered and, until our partner is engaged, is confirmed on quote — its fee is billed at cost, separately.
            </p>
          )}

          <div className="mt-6 flex flex-col gap-3">
            <Link href="/work-with-us?interest=culture-dd" className="inline-flex items-center justify-center gap-2 bg-mono-black text-mono-white px-6 py-3.5 font-display font-bold hover:bg-mono-charcoal transition-colors">
              BOOK A SCOPING CALL <ArrowRight size={16} />
            </Link>
            <p className="text-[11.5px] font-body text-mono-gray leading-relaxed text-center">
              Indicative only. Nothing is charged here — the firm quote and engagement letter follow a scoping call (NDA first).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
