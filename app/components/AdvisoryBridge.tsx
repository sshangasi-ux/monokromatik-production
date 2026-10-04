import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import CommissionForm from '../work-with-us/CommissionForm';
import { ADVISORY_SERVICES } from '../../lib/commerce';

// The product -> advisory bridge. The reports tell a buyer WHERE the value leaks;
// the advisory is where the real money is (Value-Capture Advisory + Culture Due
// Diligence). The competitive audit (docs/strategy/competitive-ui-ux-audit) found
// this product invisible on the money pages — every serious comparable (MIDiA,
// BoF Insights, Stears, RockWater) converts advisory through a short gated form
// sat beside a trust layer, never a bare mailto. This pairs the already-wired
// CommissionForm (-> /api/lead -> Supabase + Resend) with a trust strip built on
// REAL proofs only: the framework, the published body of work, the standard.
// No invented client logos or testimonials.

const PROOF = [
  'The Authorship → Ownership → Capture framework',
  '56 source-verified reports + the Ownership 100 ledger',
  'Named sources on every claim, a Bear Case on every serious piece',
  'Applied across sport, music, fashion, fintech and media',
];

export default function AdvisoryBridge({
  source,
  defaultInterest = 'value-capture-advisory',
}: {
  source: string;
  defaultInterest?: string;
}) {
  const lines = ['value-capture-advisory', 'culture-dd']
    .map((id) => ADVISORY_SERVICES.find((s) => s.id === id))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  return (
    <section id="advisory" className="scroll-mt-20 bg-mono-black text-mono-white py-20 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
        {/* Pitch + trust strip */}
        <div>
          <p className="text-xs tracking-[0.35em] font-display font-bold text-mono-amber mb-6">
            WORK WITH US · ADVISORY
          </p>
          <h2 className="text-4xl md:text-5xl font-display font-bold leading-[1.02]">
            Don&rsquo;t just read who captures the value.{' '}
            <span className="text-mono-amber">Keep more of it.</span>
          </h2>
          <p className="mt-6 max-w-xl text-lg font-body text-mono-soft-white">
            The reports show you where the value leaks. The advisory builds the apparatus to keep
            it — for the rights holders on one side of the deal and the investors on the other.
          </p>

          <ul className="mt-9 space-y-5">
            {lines.map((s) => (
              <li key={s.id} className="border-t border-mono-white/15 pt-5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="font-display text-xl font-bold">{s.name}</h3>
                  <span className="font-display text-sm font-bold text-mono-amber tabular-nums">
                    {s.priceFrom}
                  </span>
                </div>
                <p className="mt-1 font-body text-sm text-mono-soft-white/80">{s.buyer}</p>
                {s.detailHref && (
                  <Link
                    href={s.detailHref}
                    className="mt-2 inline-flex items-center gap-1.5 font-display text-[11px] font-bold tracking-[0.14em] text-mono-amber hover:text-mono-amber-hover"
                  >
                    SEE THE FULL BRIEF <ArrowRight size={13} />
                  </Link>
                )}
              </li>
            ))}
          </ul>

          <ul className="mt-9 grid sm:grid-cols-2 gap-x-6 gap-y-3">
            {PROOF.map((p) => (
              <li key={p} className="flex items-start gap-2.5 font-body text-sm text-mono-soft-white/85">
                <Check size={16} className="mt-0.5 shrink-0 text-mono-amber" aria-hidden="true" />
                {p}
              </li>
            ))}
          </ul>
        </div>

        {/* The short form */}
        <div className="bg-mono-white text-mono-black p-7 md:p-9">
          <p className="text-[11px] tracking-[0.2em] font-display font-bold text-mono-amber-strong mb-3">
            START A CONVERSATION
          </p>
          <h3 className="font-display text-2xl font-bold leading-tight">Tell us what you need.</h3>
          <p className="mt-2 mb-7 font-body text-mono-charcoal">
            A short brief — no obligation. We reply from a real inbox, usually within one working day.
          </p>
          <CommissionForm defaultInterest={defaultInterest} source={source} />
        </div>
      </div>
    </section>
  );
}
