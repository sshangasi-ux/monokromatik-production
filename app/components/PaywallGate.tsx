import Link from 'next/link';
import { Lock, ArrowRight } from 'lucide-react';

// Wraps premium content. When `locked` (member-only and the viewer isn't entitled)
// it renders a teaser + an "upgrade to Intelligence" prompt instead of the body.
// Phase 1 ships the component; entitlement wiring (Supabase auth + Paystack) lands
// in Phases 2–3, and premium content is flipped to gated in Phase 4. See
// docs/SUBSCRIPTIONS.md.
export default function PaywallGate({
  locked,
  teaser,
  children,
}: {
  locked: boolean;
  /** A short, free preview shown above the gate (e.g. the standfirst). */
  teaser?: React.ReactNode;
  children: React.ReactNode;
}) {
  if (!locked) return <>{children}</>;

  return (
    <div className="not-prose">
      {teaser && <div className="relative mb-8 max-h-48 overflow-hidden">{teaser}<div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-mono-paper to-transparent" /></div>}
      <div className="border-2 border-mono-black bg-mono-white p-8 md:p-10 text-center">
        <Lock size={26} className="text-mono-amber-strong mx-auto mb-5" aria-hidden="true" />
        <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong mb-4">MEMBERS ONLY</p>
        <h3 className="text-2xl md:text-3xl font-display font-bold text-mono-black max-w-xl mx-auto leading-tight">
          This is part of the Intelligence membership.
        </h3>
        <p className="mt-4 font-body text-mono-charcoal max-w-md mx-auto">
          The full Cultural-Signal Index, every premium case study and report, and the searchable archive — under one membership.
        </p>
        <div className="mt-7 flex flex-wrap gap-4 justify-center">
          <Link href="/membership" className="inline-flex items-center gap-2 bg-mono-black text-mono-white px-7 py-4 font-display font-bold hover:bg-mono-charcoal transition-colors">
            BECOME A MEMBER <ArrowRight size={18} />
          </Link>
          <Link href="/membership" className="inline-flex items-center gap-2 border border-mono-black text-mono-black px-7 py-4 font-display font-bold hover:bg-mono-soft-white transition-colors">
            SEE THE PLANS
          </Link>
        </div>
      </div>
    </div>
  );
}
