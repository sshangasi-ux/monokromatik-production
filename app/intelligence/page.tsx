import Navigation from '../components/Navigation';

const assets = [
  ['Campaign Library', 'Structured campaign records with market, category, cultural territory, evidence and strategic lessons.'],
  ['Brand Profiles', 'Activity histories for brands shaping relevance across Africa and diaspora audiences.'],
  ['Market Lens', 'Country and diaspora-hub views linking culture, media, creators and brand opportunity.'],
  ['Research Assistant', 'A cited AI interface grounded only in verified Monokromatik records.'],
  ['Reports', 'Premium briefings on brand building, sport commerce, creators and diaspora demand.'],
  ['Source Ledger', 'Transparent evidence and rights records supporting published intelligence.'],
];

export default function IntelligencePage() {
  return (
    <div className="min-h-screen bg-mono-white">
      <Navigation />
      <section className="bg-mono-black text-mono-white py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber mb-6">MONOKROMATIK INTELLIGENCE</p>
          <h1 className="max-w-5xl text-5xl md:text-7xl font-display font-bold">Search what Africa&apos;s brands and culture are building.</h1>
          <p className="max-w-2xl mt-8 text-lg text-mono-soft-white font-body">A verified, searchable intelligence product for brand leaders, creators, agencies, investors and cultural operators.</p>
        </div>
      </section>
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <p className="text-xs tracking-wider text-mono-amber font-display font-bold">PRODUCT FOUNDATION</p>
            <h2 className="mt-4 text-4xl font-display font-bold text-mono-black">An intelligence layer, not just an article archive.</h2>
            <p className="mt-6 font-body text-mono-charcoal leading-relaxed">Monokromatik Intelligence will transform verified editorial work into a structured research resource: searchable by brand, market, category, cultural territory, creator and campaign mechanic.</p>
          </div>
          <div className="lg:col-span-3 grid md:grid-cols-2 gap-5">
            {assets.map(([title, body]) => (
              <div key={title} className="border border-mono-gray/25 p-6">
                <h3 className="font-display text-xl font-bold text-mono-black">{title}</h3>
                <p className="mt-3 text-sm font-body text-mono-charcoal leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
