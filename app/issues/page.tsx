import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Navigation from '../components/Navigation';

const proposedIssues = [
  {
    number: '001',
    title: 'The Intelligence Behind African Influence',
    focus: 'Founding Issue',
    contents: 'Brand authorship · cultural commerce · diaspora demand · creative futures',
  },
  {
    number: '002',
    title: 'Culture Is Business',
    focus: 'Special Edition',
    contents: 'Sport · music · hospitality · creators · experience economy',
  },
  {
    number: '003',
    title: 'Will It Land?',
    focus: 'Market Edition',
    contents: 'Global work tested across African markets and diaspora hubs',
  },
];

export default function IssuesPage() {
  return (
    <div className="min-h-screen bg-mono-white">
      <Navigation />
      <section className="bg-mono-black text-mono-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.35em] font-display font-bold text-mono-amber mb-7">MONOKROMATIK ISSUES</p>
          <h1 className="max-w-5xl text-5xl md:text-7xl font-display font-bold leading-[0.95]">Designed to be saved.<br /><span className="text-mono-amber">Built to be collected.</span></h1>
          <p className="mt-8 max-w-2xl text-lg md:text-xl text-mono-soft-white font-body">Curated editions bringing together the strongest work, thinking, research and African creative intelligence in a format worthy of the shelf.</p>
        </div>
      </section>

      <section className="py-20 md:py-24 bg-mono-soft-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-3 gap-7">
          {proposedIssues.map((issue) => (
            <article key={issue.number} className="min-h-[570px] bg-mono-white border border-mono-gray/25 p-7 flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
              <div>
                <div className="flex justify-between text-[10px] tracking-[0.28em] text-mono-gray font-display font-bold">
                  <span>MONOKROMATIK</span><span>{issue.number}</span>
                </div>
                <div className="h-px bg-mono-black mt-8" />
                <p className="mt-10 text-xs tracking-[0.28em] text-mono-amber font-display font-bold">{issue.focus}</p>
                <h2 className="mt-8 text-4xl font-display font-bold text-mono-black leading-[0.98]">{issue.title}</h2>
              </div>
              <div>
                <div className="h-px bg-mono-black mb-5" />
                <p className="text-sm font-body text-mono-charcoal leading-relaxed">{issue.contents}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="py-20 bg-mono-black text-mono-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs tracking-[0.3em] text-mono-amber font-display font-bold">THE AMBITION</p>
          <h2 className="mt-6 text-4xl md:text-5xl font-display font-bold">A digital intelligence product people ask to hold in their hands.</h2>
          <p className="mt-7 text-lg font-body text-mono-soft-white">The issue system will inform future downloadable reports, limited print editions and partner-quality research books.</p>
          <Link href="/intelligence" className="mt-10 inline-flex items-center gap-2 bg-mono-amber px-7 py-4 font-display font-bold text-mono-white">EXPLORE INTELLIGENCE <ArrowRight size={18} /></Link>
        </div>
      </section>
    </div>
  );
}
