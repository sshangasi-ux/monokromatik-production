import Link from 'next/link';
import { ArrowRight, Mic, PenLine, Video } from 'lucide-react';
import Navigation from '../components/Navigation';
import { StatStrip } from '../components/dataviz/Charts';
import { getAllConversations } from '../../lib/conversations';

const conversationFormats = [
  {
    name: 'THE BOARDROOM / THE BACKROOM',
    thesis: 'What the case study usually leaves out.',
    copy: 'Direct conversations with CMOs, strategists, creative directors, founders and cultural operators about the decision behind the work, the tension behind the result and the lesson behind the compromise.',
  },
  {
    name: 'ONE ARGUMENT',
    thesis: 'A point of view worth debating.',
    copy: 'An invited African or diaspora thinker makes one clear case about brands, culture, creativity, commerce or influence — without corporate filler.',
  },
  {
    name: 'THE CREATIVE CONSEQUENCE',
    thesis: 'What changed because this work existed?',
    copy: 'Creators and collaborators speak to authorship, ownership, opportunity and what meaningful participation by global brands actually looks like.',
  },
  {
    name: 'AFTER THE PITCH',
    thesis: 'The strategic choices no deck fully explains.',
    copy: 'Marketing and agency leaders unpack the ideas they sold, the work that survived, the work that failed and how African context altered the answer.',
  },
];

const questions = [
  'What business problem did the work really need to solve?',
  'What did local audiences understand that global leadership did not?',
  'What would you refuse to repeat?',
  'Where is African influence still being undervalued?',
];

export default function ConversationsPage() {
  const slate = getAllConversations();
  return (
    <div className="min-h-screen bg-mono-white">
      <Navigation />
      <section className="bg-mono-black text-mono-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1fr_360px] gap-12 items-end">
          <div>
            <p className="text-xs tracking-[0.35em] font-display font-bold text-mono-amber mb-7">MONOKROMATIK CONVERSATIONS</p>
            <h1 className="text-5xl md:text-7xl font-display font-bold leading-[0.95]">The minds behind<br /><span className="text-mono-amber">the movement.</span></h1>
            <p className="mt-8 max-w-2xl text-lg md:text-xl text-mono-soft-white font-body">African marketers, creators, founders and strategic operators speaking candidly about brands, relevance and commercial culture.</p>
          </div>
          <div className="border border-mono-white/20 p-7">
            <Mic className="text-mono-amber mb-6" size={26} />
            <p className="font-display font-bold text-2xl leading-tight">Not personality profiles. Useful thinking from people who shape decisions.</p>
          </div>
        </div>
      </section>

      {/* THE SLATE — the named conversations we're pursuing (sourced briefs). */}
      {slate.length > 0 && (
        <section className="py-20 md:py-24 bg-mono-soft-white border-b border-mono-gray/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-12">
              <div className="max-w-2xl">
                <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong mb-4">THE SLATE · IN THE WORKS</p>
                <h2 className="text-4xl md:text-5xl font-display font-bold text-mono-black">Who we&rsquo;re sitting down with.</h2>
              </div>
              <p className="font-body text-mono-charcoal max-w-sm">The named conversations on the desk — the brief and the questions, openly. Each one a builder working the gap between African cultural production and captured value.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-px bg-mono-gray/25 border border-mono-gray/25">
              {slate.map((c) => (
                <Link key={c.slug} href={`/conversations/${c.slug}`} className="group bg-mono-white p-7 flex flex-col hover:bg-mono-black transition-colors">
                  <p className="text-[10px] tracking-[0.24em] font-display font-bold text-mono-amber-strong mb-4">{c.franchise}</p>
                  <h3 className="text-2xl font-display font-bold text-mono-black group-hover:text-mono-white transition-colors">{c.name}</h3>
                  <p className="mt-2 text-sm font-display font-bold text-mono-gray group-hover:text-mono-soft-white">{c.role}</p>
                  <p className="mt-4 font-body text-sm text-mono-charcoal group-hover:text-mono-soft-white/90 leading-relaxed line-clamp-4 flex-1">{c.angle}</p>
                  <span className="mt-6 inline-flex items-center gap-2 text-xs tracking-[0.18em] font-display font-bold text-mono-amber-strong group-hover:text-mono-amber">
                    {c.questions.length} QUESTIONS <ArrowRight size={14} />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-12">
            <div>
              <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber mb-4">SERIES FORMATS</p>
              <h2 className="max-w-4xl text-4xl md:text-5xl font-display font-bold text-mono-black">Invitations to contribute, challenge and lead.</h2>
            </div>
            <Link href="/contribute" className="inline-flex items-center gap-2 text-mono-amber font-display font-bold shrink-0">PITCH A VOICE OR SIGNAL <ArrowRight size={18} /></Link>
          </div>
          <div className="mb-10">
            <StatStrip
              tone="light"
              items={[
                { value: String(conversationFormats.length), label: 'Conversation formats' },
                { value: String(questions.length), label: 'Founding prompts' },
              ]}
            />
          </div>
          <div className="grid lg:grid-cols-2 gap-px bg-mono-gray/25 border border-mono-gray/25">
            {conversationFormats.map((format) => (
              <article key={format.name} className="bg-mono-white p-8 md:p-10 min-h-[300px]">
                <h3 className="text-2xl md:text-3xl font-display font-bold text-mono-black">{format.name}</h3>
                <p className="mt-5 text-lg font-display font-bold text-mono-amber">{format.thesis}</p>
                <p className="mt-5 font-body text-mono-charcoal leading-relaxed">{format.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-mono-soft-white py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[0.8fr_1.2fr] gap-12 items-center">
          <div>
            <p className="text-xs tracking-[0.3em] text-mono-amber font-display font-bold mb-5">THE QUESTIONS</p>
            <h2 className="text-4xl font-display font-bold text-mono-black">The prompts that create something worth publishing.</h2>
          </div>
          <div className="space-y-3">
            {questions.map((question) => (
              <div key={question} className="bg-mono-white border-l-4 border-mono-amber p-5 text-lg font-display font-bold text-mono-black">{question}</div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-mono-black text-mono-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Video className="mx-auto text-mono-amber mb-7" size={30} />
          <h2 className="text-4xl md:text-5xl font-display font-bold">Built for film, audio, essays and live rooms.</h2>
          <p className="mt-6 text-lg text-mono-soft-white font-body">The strongest conversations can move across Signal, The Weekly Signal and future collectible issues.</p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/contribute" className="inline-flex items-center gap-2 bg-mono-amber text-mono-black px-7 py-4 font-display font-bold"><PenLine size={18} /> CONTRIBUTE</Link>
            <Link href="/signal" className="inline-flex items-center gap-2 border border-mono-white text-mono-white px-7 py-4 font-display font-bold">RETURN TO SIGNAL <ArrowRight size={18} /></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
