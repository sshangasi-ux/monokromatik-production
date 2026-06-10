import Navigation from '../components/Navigation';

export default function EditorialStandardsPage() {
  return (
    <div className="min-h-screen bg-mono-white">
      <Navigation />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber">TRUST &amp; GOVERNANCE</p>
        <h1 className="mt-5 text-5xl font-display font-bold text-mono-black">Editorial Standards</h1>
        <p className="mt-8 text-xl font-body text-mono-charcoal">AI-assisted discovery. Human-directed intelligence. Verified sourcing.</p>
        <div className="mt-14 space-y-10 font-body text-mono-charcoal leading-relaxed">
          <section><h2 className="font-display font-bold text-2xl text-mono-black mb-3">What we publish</h2><p>Monokromatik covers African culture, global influence and brand intelligence through reported stories, analysis, interviews, case studies and research products.</p></section>
          <section><h2 className="font-display font-bold text-2xl text-mono-black mb-3">Facts and interpretation</h2><p>Signal case studies will clearly distinguish confirmed facts and reported results from Monokromatik analysis or strategic interpretation.</p></section>
          <section><h2 className="font-display font-bold text-2xl text-mono-black mb-3">Human approval</h2><p>Substantive campaign intelligence, premium reports, commercial-performance claims, sponsored content and sensitive reputational analysis require human review before publication.</p></section>
          <section><h2 className="font-display font-bold text-2xl text-mono-black mb-3">Corrections</h2><p>Material factual errors will be corrected transparently, with an updated date and explanation where appropriate.</p></section>
        </div>
      </main>
    </div>
  );
}
