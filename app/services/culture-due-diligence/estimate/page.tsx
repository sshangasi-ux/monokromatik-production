import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Navigation from '../../../components/Navigation';
import Estimator from './Estimator';

export const metadata: Metadata = {
  title: 'Culture Due Diligence — Scope & Estimate',
  description:
    'Scope a Culture Due Diligence engagement and see an indicative fixed-fee estimate before you talk to anyone. Bespoke, billed in stages, quoted after a scoping call — nothing is charged here.',
};

export default function EstimatePage() {
  return (
    <div className="min-h-screen bg-mono-paper">
      <Navigation />

      <section className="bg-mono-black text-mono-white py-14 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/services/culture-due-diligence" className="inline-flex items-center gap-2 text-xs tracking-[0.2em] font-display font-bold text-mono-gray hover:text-mono-amber-bright transition-colors mb-8">
            <ArrowLeft size={14} /> CULTURE DUE DILIGENCE
          </Link>
          <p className="text-xs tracking-[0.32em] font-display font-bold text-mono-amber mb-5">SCOPE &amp; ESTIMATE</p>
          <h1 className="max-w-3xl text-4xl md:text-6xl font-display font-bold leading-[0.97]">
            Price the engagement <span className="text-mono-amber">before the call.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-mono-soft-white font-body leading-relaxed">
            Culture Due Diligence is bespoke and billed in stages — never a self-serve charge. Choose the
            scope and see an indicative fixed-fee range; the firm quote and engagement letter follow a
            scoping call.
          </p>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Estimator />
        </div>
      </section>

      <section className="py-12 border-t border-mono-gray/15 bg-mono-soft-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[11px] tracking-[0.2em] font-display font-bold text-mono-amber-strong uppercase mb-3">How billing works</p>
          <ul className="space-y-2 font-body text-[15px] text-mono-charcoal leading-relaxed">
            <li><strong>Scoped fixed-fee</strong>, built from the modules above — not an hourly meter.</li>
            <li><strong>Billed in three stages:</strong> 40% deposit on engagement, 30% on draft, 30% on final delivery.</li>
            <li><strong>Paid</strong> by Paystack payment request (card / EFT) or bank transfer — card details never touch us.</li>
            <li><strong>NDA first</strong>, then a scoping call converts this estimate to a firm quote and engagement letter.</li>
            <li>An intelligence input to your decision — independent, counter-case carried, not investment advice.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
