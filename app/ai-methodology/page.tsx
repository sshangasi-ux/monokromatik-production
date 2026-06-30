import Navigation from '../components/Navigation';

export default function AIMethodologyPage() {
  return (
    <div className="min-h-screen bg-mono-black text-mono-white">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber">METHODOLOGY</p>
        <h1 className="mt-5 text-5xl font-display font-bold">How Monokromatik uses AI</h1>
        <p className="mt-8 text-xl font-body text-mono-soft-white">AI helps us discover, structure and interrogate signals. Editorial accountability remains human.</p>
        <div className="mt-14 space-y-10 text-mono-soft-white font-body leading-relaxed">
          <section><h2 className="font-display font-bold text-2xl text-mono-white mb-3">Discovery and organisation</h2><p>AI can monitor approved sources, classify stories, detect duplication, extract metadata and support search across approved intelligence records.</p></section>
          <section><h2 className="font-display font-bold text-2xl text-mono-white mb-3">Dual-provider resilience</h2><p>Monokromatik is designed for Claude and OpenAI to operate through a shared routing layer. When a Claude task fails operationally, OpenAI is attempted automatically, subject to the same quality and governance checks.</p></section>
          <section><h2 className="font-display font-bold text-2xl text-mono-white mb-3">What remains human</h2><p>AI does not independently approve sensitive brand analysis, disputed claims, commercial-performance conclusions, rights decisions or premium intelligence publication.</p></section>
          <section><h2 className="font-display font-bold text-2xl text-mono-white mb-3">Learning responsibly</h2><p>The system improves through verified source outcomes, editorial feedback, model performance and reader behaviour, without autonomously rewriting its core standards or production code.</p></section>
        </div>
      </div>
    </div>
  );
}
