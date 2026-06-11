import Link from 'next/link';
import { ArrowRight, Layers3, MonitorPlay, ScanText } from 'lucide-react';
import Navigation from '../../../components/Navigation';
import IssueCover from '../../../components/IssueCover';

const coverPrinciples = [
  {
    title: 'INTELLIGENCE AS MOTION',
    copy: 'The signal marker travels through the field: a visual metaphor for detecting relevance before it becomes obvious.',
    icon: MonitorPlay,
  },
  {
    title: 'ISSUE AS OBJECT',
    copy: 'The oversized 001 creates a collectable editorial system that can extend from screen to print, social and report covers.',
    icon: ScanText,
  },
  {
    title: 'OWNED VISUAL LANGUAGE',
    copy: 'The founding cover is entirely Monokromatik-owned, allowing the brand to lead visually before campaign-specific media is licensed or embedded.',
    icon: Layers3,
  },
];

export default function Issue001CoverPage() {
  return (
    <div className="min-h-screen bg-mono-white">
      <Navigation />
      <section className="bg-mono-soft-white py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-5">
            <div>
              <p className="text-xs tracking-[0.32em] font-display font-bold text-mono-amber mb-4">ISSUE 001 / VISUAL COVER STUDY</p>
              <h1 className="text-4xl md:text-6xl font-display font-bold text-mono-black">An owned motion cover<br />for a living magazine.</h1>
            </div>
            <Link href="/issues/001" className="inline-flex items-center gap-2 text-mono-amber font-display font-bold">RETURN TO ISSUE <ArrowRight size={18} /></Link>
          </div>

          <div className="grid lg:grid-cols-[420px_1fr] gap-10 items-start">
            <IssueCover
              issueNumber="001"
              kicker="FOUNDING ISSUE"
              title="The Intelligence Behind African Influence."
              coverlines={[
                'The Work — Nike × Air Afrique decoded',
                'Will It Land? — global work tested in African markets',
                'Brand Weather — the forces moving culture now',
              ]}
              footer="CAMPAIGNS · VOICES · COMMERCE · DIASPORA"
            />

            <div>
              <p className="max-w-2xl text-xl text-mono-charcoal font-body leading-relaxed">The founding cover is deliberately not built from borrowed campaign imagery. It establishes Monokromatik's own visual asset first: a kinetic editorial surface that can sit above official film embeds, credited campaign stills and designed intelligence spreads.</p>
              <div className="mt-10 space-y-4">
                {coverPrinciples.map(({ title, copy, icon: Icon }) => (
                  <article key={title} className="border border-mono-gray/25 bg-mono-white p-6 flex gap-5">
                    <Icon className="text-mono-amber shrink-0" size={23} />
                    <div>
                      <h3 className="font-display font-bold text-xl text-mono-black">{title}</h3>
                      <p className="mt-3 font-body text-mono-charcoal leading-relaxed">{copy}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-mono-black text-mono-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-8 md:items-center justify-between">
          <div>
            <p className="text-xs tracking-[0.27em] font-display font-bold text-mono-amber mb-4">NEXT VISUAL INPUT</p>
            <h2 className="text-3xl md:text-4xl font-display font-bold">Add official film and credited campaign assets to the case studies.</h2>
          </div>
          <Link href="/issues/001/the-work-nike-air-afrique" className="shrink-0 inline-flex gap-2 items-center bg-mono-amber px-7 py-4 font-display font-bold">VIEW THE WORK <ArrowRight size={18} /></Link>
        </div>
      </section>
    </div>
  );
}
