import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Quote } from 'lucide-react';
import Navigation from '../../components/Navigation';
import { getAllConversations, getConversationBySlug } from '../../../lib/conversations';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 300;

export async function generateStaticParams() {
  return getAllConversations().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const c = getConversationBySlug(slug);
  if (!c) return { title: 'Conversation not found | MonoKromatik' };
  const url = `https://www.monokromatik.com/conversations/${c.slug}`;
  return {
    title: `${c.name} — Conversations | MonoKromatik`,
    description: `${c.role}. ${c.angle.slice(0, 150)}`,
    alternates: { canonical: url },
    openGraph: { title: `${c.name} — MonoKromatik Conversations`, description: c.role, url, type: 'article' },
  };
}

export default async function ConversationPage({ params }: PageProps) {
  const { slug } = await params;
  const c = getConversationBySlug(slug);
  if (!c) notFound();

  return (
    <div className="min-h-screen bg-mono-paper">
      <Navigation />

      <header className="bg-mono-black text-mono-white py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/conversations" className="inline-flex items-center gap-2 text-xs tracking-[0.2em] font-display font-bold text-mono-gray hover:text-mono-amber-bright transition-colors mb-12">
            <ArrowLeft size={14} /> CONVERSATIONS
          </Link>
          <p className="text-xs tracking-[0.32em] font-display font-bold text-mono-amber-bright mb-6">
            {c.franchise} · {c.status === 'pursuing' ? 'IN THE WORKS' : c.status.toUpperCase()}
          </p>
          <h1 className="text-4xl md:text-6xl font-display font-bold leading-[0.98]">{c.name}</h1>
          <p className="mt-5 text-lg md:text-xl text-mono-soft-white font-body">{c.role}</p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <h2 className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong mb-5">WHY THIS, WHY NOW</h2>
        <p className="font-feature text-xl md:text-2xl text-mono-black leading-relaxed">{c.angle}</p>

        <h2 className="mt-16 text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong mb-6">THE QUESTIONS WE&rsquo;D PUT</h2>
        <ol className="space-y-px border border-mono-gray/25 bg-mono-gray/25">
          {c.questions.map((q, i) => (
            <li key={i} className="bg-mono-white p-6 flex gap-5">
              <span className="font-display font-bold text-mono-amber text-2xl tabular-nums shrink-0">{String(i + 1).padStart(2, '0')}</span>
              <p className="font-body text-mono-charcoal leading-relaxed">{q}</p>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex items-start gap-3 text-sm font-body text-mono-gray">
          <Quote size={16} className="text-mono-amber-strong shrink-0 mt-0.5" />
          <p>
            A conversation we&rsquo;re pursuing — the brief and questions, openly. {c.confidence === 'partial' ? 'Some operational specifics are not publicly disclosed; the questions probe rather than assume. ' : ''}
            Sourced, never fabricated.
          </p>
        </div>

        <h2 className="mt-14 text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong mb-5">THE BASIS</h2>
        <ul className="space-y-2">
          {c.sources.map((s) => (
            <li key={s.href}>
              <a href={s.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-display font-bold text-mono-amber-strong hover:underline">
                {s.publisher} <ArrowRight size={13} />
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-14 bg-mono-black text-mono-white p-7 md:p-9">
          <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber mb-3">SHOULD WE BE TALKING?</p>
          <h2 className="text-2xl md:text-3xl font-display font-bold leading-tight max-w-2xl">Suggest a subject, an angle, or put yourself forward.</h2>
          <Link href="/contribute" className="mt-6 inline-flex items-center gap-2 bg-mono-amber text-mono-black px-7 py-4 font-display font-bold hover:bg-mono-amber-hover transition-colors">
            CONTRIBUTE <ArrowRight size={18} />
          </Link>
        </div>

        <div className="mt-12">
          <Link href="/conversations" className="inline-flex items-center gap-2 text-mono-amber-strong hover:text-mono-amber-hover font-display font-bold">
            BACK TO CONVERSATIONS <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
