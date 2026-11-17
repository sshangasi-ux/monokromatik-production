// The Ownership Ladder — an in-page value-capture exhibit reused inside Editions
// (and anywhere the "rented vs owned" framework needs a visual). Pure markup, no
// client JS: the house exhibit grammar (near-black, amber "own" zone, hairline rules).

interface Rung {
  n: string;
  name: string;
  width: string;
  bar: string;
  who: string;
  own?: boolean;
}

const RUNGS: Rung[] = [
  { n: 'Rung 1', name: 'Endorsement', width: '16%', bar: '#4a4642', who: 'Rent' },
  { n: 'Rung 2', name: 'Ambassadorship', width: '34%', bar: '#6b6763', who: 'Tyla · Tems' },
  { n: 'Rung 3', name: 'Co-created line', width: '56%', bar: '#9a4f1e', who: 'Capsules' },
  { n: 'Rung 4', name: 'Equity stake', width: '80%', bar: '#CC5500', who: 'Mbappé × On', own: true },
  { n: 'Rung 5', name: 'Owned house', width: '100%', bar: '#E8631C', who: 'emPawa · Magugu', own: true },
];

export default function OwnershipLadder() {
  return (
    <aside
      className="rounded border border-mono-gray/25 bg-mono-charcoal p-6"
      aria-label="The Ownership Ladder exhibit"
    >
      <div className="flex items-baseline justify-between border-b border-mono-gray/25 pb-3">
        <span className="font-display text-sm font-bold text-mono-white">
          MONO<span className="text-mono-amber">KROMATIK</span>
        </span>
        <span className="font-display text-[9.5px] font-medium uppercase tracking-[0.2em] text-mono-gray">
          Value-Capture Exhibit
        </span>
      </div>

      <h3 className="mt-4 font-feature text-2xl font-bold leading-none tracking-tight text-mono-white">
        The Ownership <span className="text-mono-amber">Ladder</span>
      </h3>
      <p className="mt-1 font-body text-sm text-mono-gray">Rent below, own above.</p>

      <div className="mt-4 space-y-3.5">
        {RUNGS.map((r) => (
          <div key={r.n} className="grid grid-cols-[120px_1fr] items-center gap-3 sm:grid-cols-[140px_1fr_auto]">
            <div>
              <span className="block font-display text-[10px] uppercase tracking-[0.15em] text-mono-gray">
                {r.n}
              </span>
              <span className="block font-display text-[15px] font-bold leading-tight text-mono-white">
                {r.name}
              </span>
            </div>
            <div className="h-4 overflow-hidden rounded-sm bg-[#1d1b19]">
              <span className="block h-full rounded-sm" style={{ width: r.width, background: r.bar }} />
            </div>
            <span
              className={`hidden whitespace-nowrap text-right font-display text-[11px] sm:block ${
                r.own ? 'text-mono-amber' : 'text-mono-gray'
              }`}
            >
              {r.who}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-mono-gray/25 pt-3 font-display text-[10px] uppercase tracking-[0.1em] text-mono-gray">
        <span>Exhibit: MonoKromatik</span>
        <span className="text-mono-amber">monokromatik.com</span>
      </div>
    </aside>
  );
}
