import Link from 'next/link';
import { ArrowRight, BookOpen, CheckCircle2, Eye, Globe2, Layers3, Newspaper } from 'lucide-react';
import Navigation from '../../components/Navigation';
import { StatStrip } from '../../components/dataviz/Charts';

const sourceLayers = [
  {
    title: 'PRIMARY EVIDENCE',
    role: 'What happened',
    copy: 'Official brand, agency, creator, rights-holder and event materials: campaign films, press assets, launch statements, creative credits and stated outcomes.',
    icon: CheckCircle2,
    examples: 'Brand newsrooms · Agency case studies · Official films · Rights-holder channels',
  },
  {
    title: 'CREATIVE & EFFECTIVENESS INTELLIGENCE',
    role: 'What the industry recognises',
    copy: 'Award, effectiveness and professional-intelligence sources that establish benchmark work, recognised outcomes and strategic learning.',
    icon: BookOpen,
    examples: 'WARC · LIONS / The Work · Effie · Contagious · Campaign · The Drum',
  },
  {
    title: 'AFRICAN INDUSTRY CONTEXT',
    role: 'What the region values',
    copy: 'African and market-specific advertising, communications and business platforms that ground global observations in regional reality.',
    icon: Globe2,
    examples: 'Loeries · MarkLives · Bizcommunity · industry bodies · market publications',
  },
  {
    title: 'CULTURAL & AUDIENCE SIGNALS',
    role: 'What people are feeling',
    copy: 'Culture, sport, entertainment and public response signals used to understand reception and movement — never presented alone as proof of effectiveness.',
    icon: Eye,
    examples: 'Creator channels · Cultural publications · Public conversation · Event signals',
  },
];

const workflow = [
  ['DISCOVER', 'Surface work, signals and potential stories from approved monitoring sources.'],
  ['VERIFY', 'Capture primary evidence, source dates, credits, rights status and confidence.'],
  ['INTERPRET', 'Apply Monokromatik judgment: cultural truth, strategic bet and commercial consequence.'],
  ['PUBLISH', 'Release as Signal, Intelligence records, Reports or Issues with visible attribution.'],
];

const deskOutputs = [
  'Campaign records with source ledgers and creative credits',
  'Weekly Brand Weather signal briefings',
  'Market and diaspora-hub intelligence notes',
  'Report-ready case collections and special issues',
];

export default function SourceDeskPage() {
  return (
    <div className="min-h-screen bg-mono-white">
      <Navigation />
      <section className="bg-mono-black text-mono-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1fr_350px] gap-12 items-end">
          <div>
            <p className="text-xs tracking-[0.35em] font-display font-bold text-mono-amber mb-7">INTELLIGENCE / SOURCE DESK</p>
            <h1 className="text-5xl md:text-7xl font-display font-bold leading-[0.95]">The evidence<br />behind the <span className="text-mono-amber">argument.</span></h1>
            <p className="max-w-2xl mt-8 text-lg md:text-xl text-mono-soft-white font-body leading-relaxed">A transparent source system for finding the work, verifying the detail and building distinctly African brand intelligence.</p>
          </div>
          <div className="border border-mono-white/20 p-7">
            <Layers3 className="text-mono-amber mb-6" size={28} />
            <p className="text-xl font-display font-bold leading-snug">Sources are inputs. Monokromatik judgment is the product.</p>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber mb-4">SOURCE ARCHITECTURE</p>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-mono-black">Four layers. Different evidence jobs.</h2>
          </div>
          <div className="mb-10">
            <StatStrip
              tone="light"
              items={[
                { value: String(sourceLayers.length), label: 'Source layers' },
                { value: String(workflow.length), label: 'Workflow steps' },
                { value: String(deskOutputs.length), label: 'Desk outputs' },
              ]}
            />
          </div>
          <div className="grid lg:grid-cols-2 gap-px bg-mono-gray/25 border border-mono-gray/25">
            {sourceLayers.map(({ title, role, copy, icon: Icon, examples }) => (
              <article key={title} className="bg-mono-white p-8 md:p-10 min-h-[335px] flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <Icon className="text-mono-amber" size={25} />
                  <p className="text-[10px] tracking-[0.24em] text-mono-amber font-display font-bold">{role.toUpperCase()}</p>
                </div>
                <div>
                  <h3 className="text-2xl font-display font-bold text-mono-black">{title}</h3>
                  <p className="mt-4 text-mono-charcoal font-body leading-relaxed">{copy}</p>
                  <p className="mt-6 border-t border-mono-gray/20 pt-4 text-xs text-mono-gray font-body">{examples}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-mono-soft-white py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[0.78fr_1.22fr] gap-12">
          <div>
            <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber mb-5">METHOD</p>
            <h2 className="text-4xl font-display font-bold text-mono-black">How a signal becomes intelligence.</h2>
            <p className="mt-6 font-body text-lg text-mono-charcoal">This is the workflow the future source engine, contributors and editorial team will work against.</p>
          </div>
          <div className="space-y-3">
            {workflow.map(([title, copy], index) => (
              <div key={title} className="bg-mono-white flex gap-6 p-6 items-start">
                <span className="text-mono-amber font-display font-bold text-xl">0{index + 1}</span>
                <div><h3 className="font-display font-bold text-xl text-mono-black">{title}</h3><p className="mt-2 font-body text-mono-charcoal">{copy}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-mono-black text-mono-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <Newspaper className="text-mono-amber mb-7" size={28} />
            <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber mb-5">DESK OUTPUTS</p>
            <h2 className="text-4xl font-display font-bold">What this system will produce.</h2>
          </div>
          <div className="space-y-3">
            {deskOutputs.map((output) => <p key={output} className="border border-mono-white/15 p-5 text-mono-soft-white font-body">{output}</p>)}
          </div>
        </div>
      </section>

      <section className="py-16 bg-mono-white text-center">
        <Link href="/intelligence" className="inline-flex items-center gap-2 text-mono-amber font-display font-bold">RETURN TO INTELLIGENCE <ArrowRight size={18} /></Link>
      </section>
    </div>
  );
}
