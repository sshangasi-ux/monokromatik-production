import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpen, FileText, Mic, Radar, Sparkles, type LucideIcon } from 'lucide-react';
import Navigation from '../../components/Navigation';
import IssueCover from '../../components/IssueCover';
import { getIssueByNumber } from '../../../lib/issues';

const ICONS: Record<string, LucideIcon> = { Sparkles, BookOpen, Radar, FileText, Mic };

// The reporting this edition's thesis is built on — provenance before publication.
const SOURCE_BASIS = [
  { claim: 'Hybe’s global-management JV with Tyla', publisher: 'Variety', href: 'https://variety.com/2025/music/news/hybe-partners-with-tyla-managers-brandon-hixon-colin-gayle-1236609065/' },
  { claim: 'Afreximbank’s US$1bn Africa Film Fund', publisher: 'Screen Daily', href: 'https://www.screendaily.com/news/1bn-africa-film-fund-launched-to-support-film-production-and-distribution-across-continent/5204655.article' },
  { claim: 'AFCON Morocco’s 90%+ revenue surge, 23 sponsors', publisher: 'CAF', href: 'https://www.cafonline.com/news/totalenergies-caf-africa-cup-of-nations-2025-commercial-success-in-morocco-leads-to-over-90-surge-in-competition-revenues-and-a-total-of-23-sponsors/' },
  { claim: 'Africa’s luxury market and the distributor workaround', publisher: 'Business of Fashion', href: 'https://www.businessoffashion.com/articles/global-markets/the-retailers-unlocking-africas-luxury-market/' },
];

export const metadata: Metadata = {
  title: 'Issue 002 — Culture Is Business: Who Owns the Upside | MonoKromatik',
  description:
    'A preview of Issue 002. Global capital and global structures moved into African culture in force — the question is who captures the value. The planned slate, grounded in current reporting.',
  alternates: { canonical: 'https://www.monokromatik.com/issues/002' },
  openGraph: {
    title: 'Issue 002 — Culture Is Business: Who Owns the Upside',
    description: 'Preview the edition: Hybe × Tyla, Afreximbank’s $1bn film fund, AFCON’s commercial record, the luxury frontier.',
    url: 'https://www.monokromatik.com/issues/002',
  },
};

export default function IssueTwoPreviewPage() {
  const issue = getIssueByNumber('002');
  const features = issue?.features ?? [];

  return (
    <div className="min-h-screen bg-mono-paper">
      <Navigation />
      {issue && (
        <IssueCover issue={issue} primaryCta={{ label: 'READ THE COVER ESSAY', href: '/issues/002/who-owns-the-upside' }} />
      )}

      <section className="py-20 md:py-24 bg-mono-soft-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mb-12">
            <p className="text-xs tracking-[0.32em] font-display font-bold text-mono-amber mb-5">INSIDE THE EDITION</p>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-mono-black">Who owns the upside.</h2>
            <p className="mt-6 text-lg font-body text-mono-charcoal">
              Issue 001 argued the world keeps discovering African value late and converting it into someone
              else&rsquo;s case study. Issue 002 reports what happened next — the management companies, development
              banks, sports-rights machines and luxury distributors that moved in, and the contest over who
              keeps the value. <strong>The cover essay is live now; the rest of the slate is rolling out.</strong>
            </p>
          </div>

          <div className="space-y-px border border-mono-gray/25 bg-mono-gray/25">
            {features.map(({ franchise, title, description, status, icon, href }, index) => {
              const Icon = ICONS[icon ?? ''] ?? FileText;
              const live = Boolean(href);
              const inner = (
                <>
                  <div className="flex md:block items-center gap-4">
                    <p className="text-2xl font-display font-bold text-mono-amber">0{index + 1}</p>
                    <Icon className="mt-0 md:mt-8 text-mono-amber" size={22} />
                  </div>
                  <div>
                    <p className="text-[10px] tracking-[0.28em] font-display font-bold text-mono-amber mb-4">{franchise}</p>
                    <h3 className={`text-2xl md:text-3xl font-display font-bold text-mono-black ${live ? 'group-hover:text-mono-amber transition-colors' : ''}`}>{title}</h3>
                    <p className="mt-4 font-body text-mono-charcoal leading-relaxed max-w-3xl">{description}</p>
                  </div>
                  <div className="flex md:flex-col justify-between items-start md:items-end gap-3">
                    <span className={`text-[10px] tracking-[0.18em] font-display font-bold border px-3 py-2 ${live ? 'border-mono-amber bg-mono-amber text-mono-black' : 'border-mono-gray/30 text-mono-gray'}`}>{live ? 'READ NOW' : status}</span>
                    {live && <span className="hidden md:inline-flex items-center gap-2 text-mono-amber font-display font-bold text-sm">OPEN <ArrowRight size={16} /></span>}
                  </div>
                </>
              );
              const cls = 'grid md:grid-cols-[78px_1fr_190px] gap-6 bg-mono-white p-7 md:p-9';
              return live ? (
                <Link key={title} href={href} className={`group ${cls} hover:bg-mono-soft-white transition-colors`}>
                  {inner}
                </Link>
              ) : (
                <article key={title} className={cls}>{inner}</article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Provenance before publication — the reporting the thesis is built on. */}
      <section className="py-20 bg-mono-white border-t border-mono-gray/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber mb-5">GROUNDED IN CURRENT REPORTING</p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-mono-black max-w-3xl">
            A plan, not a guess. Every angle traces to a real, current source.
          </h2>
          <ul className="mt-10 space-y-px border border-mono-gray/25 bg-mono-gray/25">
            {SOURCE_BASIS.map((s) => (
              <li key={s.href} className="bg-mono-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="font-body text-mono-charcoal">{s.claim}</span>
                <a href={s.href} target="_blank" rel="noopener noreferrer" className="shrink-0 inline-flex items-center gap-2 text-xs tracking-[0.16em] font-display font-bold text-mono-amber-strong hover:underline">
                  {s.publisher.toUpperCase()} <ArrowRight size={14} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-mono-black text-mono-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1fr_320px] gap-12 items-center">
          <div>
            <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber mb-5">BE PART OF IT</p>
            <h2 className="text-4xl md:text-5xl font-display font-bold">Read it first — or help shape it.</h2>
            <p className="mt-6 text-lg text-mono-soft-white font-body">
              Subscribe to The Weekly Signal to get Issue 002 the day it ships, or talk to us about
              sponsoring a franchise within the edition.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link href="/weekly" className="inline-flex items-center gap-2 bg-mono-amber px-7 py-4 font-display font-bold text-mono-black">THE WEEKLY SIGNAL <ArrowRight size={18} /></Link>
              <Link href="/work-with-us?interest=sponsor" className="inline-flex items-center gap-2 border border-mono-white px-7 py-4 font-display font-bold text-mono-white">SPONSOR A FRANCHISE <ArrowRight size={18} /></Link>
            </div>
          </div>
          <Link href="/issues/001" className="border border-mono-white/20 p-7 hover:border-mono-amber transition-colors">
            <p className="text-xs tracking-[0.25em] font-display font-bold text-mono-amber">WHILE YOU WAIT</p>
            <p className="mt-6 text-2xl font-display font-bold">Read Issue 001 — the founding edition.</p>
            <p className="mt-6 inline-flex gap-2 items-center text-mono-amber font-display font-bold">OPEN ISSUE 001 <ArrowRight size={18} /></p>
          </Link>
        </div>
      </section>
    </div>
  );
}
