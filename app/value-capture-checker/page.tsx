import type { Metadata } from 'next';
import Link from 'next/link';
import Navigation from '../components/Navigation';
import Checker from './Checker';

export const metadata: Metadata = {
  title: 'The Value-Capture Checker — MonoKromatik',
  description:
    'A free 60-second read on where your brand or property sits on MonoKromatik’s Authorship → Ownership → Capture framework. Answer five questions and see whether your value is Retained, Exported, Hollowed or Contested — and what to do about it.',
};

export default function ValueCaptureCheckerPage() {
  return (
    <div className="min-h-screen bg-mono-paper">
      <Navigation />

      <section className="bg-mono-black text-mono-white py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.35em] font-display font-bold text-mono-amber mb-6">FREE TOOL</p>
          <h1 className="text-4xl md:text-6xl font-display font-bold leading-[0.97]">
            Who captures <span className="text-mono-amber">your</span> value?
          </h1>
          <p className="mt-7 max-w-2xl text-lg md:text-xl text-mono-soft-white font-body leading-relaxed">
            You can be the author of something in culture and still be owned by someone else on the balance
            sheet. Five questions, sixty seconds — see where your brand or property sits on the
            Authorship&nbsp;→&nbsp;Ownership&nbsp;→&nbsp;Capture framework, and what the read says to do next.
          </p>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="px-4 sm:px-6 lg:px-8">
          <Checker />
        </div>
      </section>

      <section className="py-12 border-t border-mono-gray/15 bg-mono-soft-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="font-body text-mono-charcoal">
            Want the framework in full?{' '}
            <Link href="/services" className="text-mono-amber-strong hover:text-mono-amber-hover font-display font-bold">
              See the intelligence services →
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
