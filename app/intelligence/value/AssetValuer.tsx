'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, ArrowRight, ArrowUpRight, X, Lock } from 'lucide-react';
import { track } from '../../../lib/analytics';
import { ARCHETYPE_NOTE, normName, type AssetRead, type Archetype } from '../../../lib/asset-read';

// The self-serve "value an asset" tool. Type an asset -> match it against the
// prebuilt, corpus-backed index (passed from the server) -> show the read we
// actually hold. No match -> route to a commissioned valuation. Nothing is
// generated: every verdict/score/owner is a real stored record.

const VERDICT_STYLE: Record<Archetype, { text: string; ring: string; chip: string }> = {
  RETAINED: { text: 'text-emerald-400', ring: 'border-emerald-400/60', chip: 'bg-emerald-400/15 text-emerald-300' },
  EXPORTED: { text: 'text-red-400', ring: 'border-red-400/60', chip: 'bg-red-400/15 text-red-300' },
  CONTESTED: { text: 'text-mono-amber', ring: 'border-mono-amber/60', chip: 'bg-mono-amber/15 text-mono-amber' },
  HOLLOWED: { text: 'text-mono-gray-bright', ring: 'border-mono-white/30', chip: 'bg-mono-white/10 text-mono-gray-bright' },
};
const OWNERSHIP_LABEL: Record<NonNullable<AssetRead['ownership']>, string> = {
  african: 'African-owned',
  foreign: 'Foreign-controlled',
  mixed: 'Mixed ownership',
};
const EXAMPLES = ['Tecno', 'Jumia', 'Flutterwave', 'Fenty Beauty', 'MTN'];

function rank(index: AssetRead[], q: string): AssetRead[] {
  const nq = normName(q);
  if (nq.length < 2) return [];
  const out: { r: AssetRead; s: number }[] = [];
  for (const r of index) {
    let s = 0;
    if (r.norm === nq) s = 100;
    else if (r.norm.startsWith(nq)) s = 80;
    else if (r.norm.includes(nq)) s = 62;
    else if (nq.includes(r.norm) && r.norm.length >= 3) s = 50;
    else {
      const qt = nq.split(' ');
      const rt = new Set(r.norm.split(' '));
      const overlap = qt.filter((t) => t.length >= 3 && rt.has(t)).length;
      if (overlap > 0) s = 20 + overlap * 6;
    }
    if (s > 0) out.push({ r, s });
  }
  out.sort((a, b) => b.s - a.s || a.r.display.length - b.r.display.length);
  return out.slice(0, 6).map((x) => x.r);
}

export default function AssetValuer({ index }: { index: AssetRead[] }) {
  const [query, setQuery] = useState('');
  const [chosen, setChosen] = useState<AssetRead | null>(null);
  const [committed, setCommitted] = useState(false);
  const matches = useMemo(() => (chosen ? [] : rank(index, query)), [index, query, chosen]);

  const pick = (r: AssetRead) => {
    setChosen(r);
    setCommitted(false);
    setQuery(r.display);
    track('valuation_lookup', { query: r.display, matched: true });
  };
  const reset = () => {
    setChosen(null);
    setCommitted(false);
    setQuery('');
  };
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (matches.length) pick(matches[0]);
    else if (normName(query).length >= 2) {
      setCommitted(true);
      track('valuation_lookup', { query, matched: false });
    }
  };

  return (
    <div>
      {/* search box */}
      <form onSubmit={onSubmit} className="relative">
        <Search size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-mono-gray-bright" aria-hidden="true" />
        <input
          id="asset-input"
          type="text"
          autoComplete="off"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setChosen(null); setCommitted(false); }}
          placeholder="Type an asset — a brand, team, artist or company"
          aria-label="Value an asset"
          className="w-full bg-mono-charcoal border border-mono-white/20 text-mono-white text-lg md:text-xl font-body pl-12 pr-28 py-5 focus:outline-none focus:border-mono-amber placeholder:text-mono-gray-bright"
        />
        {query && (
          <button type="button" onClick={reset} aria-label="Clear" className="absolute right-[88px] top-1/2 -translate-y-1/2 text-mono-gray-bright hover:text-mono-white">
            <X size={18} />
          </button>
        )}
        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-mono-amber text-mono-black px-5 py-3 font-display font-bold hover:bg-mono-amber-bright transition-colors">
          Read
        </button>
      </form>

      {/* suggestions */}
      {!chosen && !committed && matches.length > 0 && (
        <ul className="mt-2 border border-mono-white/15 divide-y divide-mono-white/10 bg-mono-charcoal">
          {matches.map((m) => (
            <li key={m.key}>
              <button type="button" onClick={() => pick(m)} className="w-full text-left px-4 py-3 hover:bg-mono-white/5 flex items-center justify-between gap-3">
                <span className="font-display font-bold text-mono-white">{m.display}</span>
                <span className="text-xs font-body text-mono-gray-bright">{m.verdict ? m.verdict : m.sector || 'On the Index'}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* examples (empty state) */}
      {!chosen && !committed && normName(query).length < 2 && (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-mono-gray-bright font-body">Try:</span>
          {EXAMPLES.map((ex) => (
            <button key={ex} type="button" onClick={() => { setQuery(ex); const m = rank(index, ex); if (m.length) pick(m[0]); }} className="font-display font-bold text-[13px] tracking-[0.04em] border border-mono-white/20 text-mono-soft-white px-3 py-1.5 hover:border-mono-amber hover:text-mono-amber transition-colors">
              {ex}
            </button>
          ))}
        </div>
      )}

      {/* the read */}
      {chosen && <ReadCard r={chosen} onReset={reset} />}

      {/* no match -> commission */}
      {committed && !chosen && (
        <div className="mt-6 border border-mono-white/15 bg-mono-charcoal p-7 md:p-9">
          <p className="font-display font-bold text-2xl text-mono-white">We don&rsquo;t hold a scored read on &ldquo;{query.trim()}&rdquo; yet.</p>
          <p className="mt-3 font-body text-mono-soft-white/80 max-w-[60ch]">That&rsquo;s exactly what a commissioned valuation is for — the same framework and data, run on your asset. Or search a brand, team or company already in our coverage.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/work-with-us?interest=scorecard" onClick={() => track('valuation_cta_click', { asset: query.trim(), interest: 'scorecard', matched: false })} className="inline-flex items-center gap-2 bg-mono-amber text-mono-black px-6 py-3.5 font-display font-bold hover:bg-mono-amber-bright transition-colors">Request a valuation <ArrowRight size={18} /></Link>
            <button type="button" onClick={reset} className="inline-flex items-center gap-2 border border-mono-white/25 text-mono-white px-6 py-3.5 font-display font-bold hover:border-mono-amber hover:text-mono-amber transition-colors">New search</button>
          </div>
        </div>
      )}
    </div>
  );
}

function ReadCard({ r, onReset }: { r: AssetRead; onReset: () => void }) {
  const v = r.verdict ? VERDICT_STYLE[r.verdict] : null;
  return (
    <div className={`mt-6 border bg-mono-black p-7 md:p-9 ${v ? v.ring : 'border-mono-white/20'}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display font-bold text-3xl md:text-4xl text-mono-white leading-tight">{r.display}</h3>
          {r.sector && <p className="mt-1 font-body text-sm text-mono-gray-bright">{r.sector}{typeof r.rank === 'number' ? ` · Ownership 100 · #${r.rank}` : ''}</p>}
        </div>
        <button type="button" onClick={onReset} aria-label="New search" className="shrink-0 text-mono-gray-bright hover:text-mono-white"><X size={20} /></button>
      </div>

      {/* verdict */}
      {r.verdict ? (
        <div className="mt-6">
          <p className="text-xs tracking-[0.2em] font-display font-bold text-mono-gray-bright uppercase mb-2">Value-capture verdict</p>
          <p className={`font-display font-bold text-4xl md:text-5xl ${v!.text}`}>{r.verdict}</p>
          <p className="mt-2 font-body text-mono-soft-white">{ARCHETYPE_NOTE[r.verdict]}</p>
        </div>
      ) : r.score != null ? (
        <div className="mt-6">
          <p className="text-xs tracking-[0.2em] font-display font-bold text-mono-gray-bright uppercase mb-2">On the Cultural-Signal Index</p>
          <p className="font-body text-mono-soft-white">An authorship-weighted score — see the composite below and the full breakdown.</p>
        </div>
      ) : (
        <div className="mt-6">
          <p className="text-xs tracking-[0.2em] font-display font-bold text-mono-gray-bright uppercase mb-2">In our coverage</p>
          <p className="font-body text-mono-soft-white">We&rsquo;ve decoded this — open the full breakdown below.</p>
        </div>
      )}

      {/* facts row */}
      <div className="mt-7 grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-px bg-mono-white/15 border border-mono-white/15">
        {(r.owner || r.ownerCountry) && (
          <div className="bg-mono-black p-5">
            <p className="text-[11px] tracking-[0.16em] uppercase font-display font-bold text-mono-gray-bright">Owned by</p>
            <p className="mt-1.5 font-display font-bold text-mono-white">{r.owner}{r.ownerCountry ? ` · ${r.ownerCountry}` : ''}</p>
            {r.ownership && <span className="mt-2 inline-block text-[11px] font-display font-bold px-2 py-0.5 rounded-full bg-mono-white/10 text-mono-soft-white">{OWNERSHIP_LABEL[r.ownership]}</span>}
          </div>
        )}
        {typeof r.score === 'number' && (
          <div className="bg-mono-black p-5">
            <p className="text-[11px] tracking-[0.16em] uppercase font-display font-bold text-mono-gray-bright">Signal score</p>
            <p className="mt-1.5 font-display font-bold text-mono-white text-2xl tabular-nums">{r.score}<span className="text-mono-gray-bright text-base">/100</span>{r.band ? <span className="ml-2 text-mono-amber text-lg">{r.band}</span> : null}</p>
            <Link href="/intelligence/signal-index/methodology" className="mt-2 inline-flex items-center gap-1 text-[11px] font-display font-bold tracking-[0.08em] text-mono-gray-bright hover:text-mono-amber">How it&rsquo;s scored <ArrowUpRight size={12} /></Link>
          </div>
        )}
      </div>

      {r.take && <p className="mt-6 font-body text-mono-soft-white/90 leading-relaxed max-w-[68ch]">{r.take}</p>}

      <div className="mt-5 flex flex-wrap gap-2">
        {r.sources.map((s) => (
          <span key={s} className="text-[11px] font-body text-mono-gray-bright border border-mono-white/15 px-2 py-1">{s}</span>
        ))}
      </div>

      {r.href && (
        <Link href={r.href} className="mt-5 inline-flex items-center gap-1.5 font-display text-[13px] font-bold tracking-[0.1em] text-mono-amber hover:text-mono-amber-bright">READ THE FULL BREAKDOWN <ArrowRight size={14} /></Link>
      )}

      {/* The depth-gate. The read above is the shape of the answer — free. The
          decision-grade depth is the paid Scorecard; show exactly what it adds
          as a visible locked panel, so the paid step is tangible, not a generic
          ask. Every result ends here (it renders for any matched read). */}
      <div className="mt-8 pt-7 border-t border-mono-white/15">
        <div className="flex items-center gap-2">
          <Lock size={13} className="text-mono-amber" aria-hidden="true" />
          <p className="font-display text-[11px] font-bold tracking-[0.24em] uppercase text-mono-amber">The full Scorecard unlocks</p>
        </div>
        <ul className="mt-4 grid sm:grid-cols-2 gap-x-7 gap-y-2.5">
          {[
            'The four-axis decode — idea, authorship, execution, consequence',
            'Named-rival benchmarks in the category',
            'A roadmap to move the number',
            'The full value-capture breakdown, sourced',
          ].map((item) => (
            <li key={item} className="flex gap-2.5 text-[15px] font-body text-mono-soft-white/90 leading-snug">
              <span className="text-mono-gray-bright shrink-0" aria-hidden="true">—</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/work-with-us?interest=scorecard" onClick={() => track('valuation_cta_click', { asset: r.display, interest: 'scorecard', matched: true })} className="inline-flex items-center gap-2 bg-mono-amber text-mono-black px-6 py-3.5 font-display font-bold hover:bg-mono-amber-bright transition-colors">Unlock the Scorecard — from $900 <ArrowUpRight size={18} /></Link>
          <Link href="/work-with-us?interest=value-capture-advisory" onClick={() => track('valuation_cta_click', { asset: r.display, interest: 'value-capture-advisory', matched: true })} className="inline-flex items-center gap-2 border border-mono-white/25 text-mono-white px-6 py-3.5 font-display font-bold hover:border-mono-amber hover:text-mono-amber transition-colors">Commission the desk <ArrowRight size={18} /></Link>
        </div>
        <p className="mt-3 text-[12px] text-mono-gray font-body">The free read is the start; the Scorecard is the decision.</p>
      </div>
    </div>
  );
}
