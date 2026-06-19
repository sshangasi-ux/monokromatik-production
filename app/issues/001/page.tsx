import Link from 'next/link';
import { ArrowRight, BookOpen, FileText, Mic, Radar, Sparkles, type LucideIcon } from 'lucide-react';
import Navigation from '../../components/Navigation';
import Issue001KineticArtwork from '../../components/Issue001KineticArtwork';
import { getIssueByNumber } from '../../../lib/issues';

// Map the manifest's icon names (strings in JSON) back to components.
const ICONS: Record<string, LucideIcon> = { Sparkles, BookOpen, Radar, FileText, Mic };

export default function FoundingIssuePage() {
  const features = getIssueByNumber('001')?.features ?? [];
  return (
    <div className="min-h-screen bg-mono-white">
      <Navigation />
      <section className="relative overflow-hidden bg-mono-black text-mono-white py-16 md:py-24">
        <Issue001KineticArtwork />
        <div className="absolute inset-0 bg-gradient-to-r from-mono-black via-mono-black/78 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[620px] flex flex-col justify-between">
          <div className="flex justify-between border-b border-mono-white/20 pb-5 text-[10px] md:text-xs tracking-[0.3em] font-display font-bold">
            <span className="text-mono-amber">MONOKROMATIK / ISSUE 001</span>
            <span className="text-mono-gray">FOUNDING EDITION</span>
          </div>
          <div className="max-w-5xl py-16">
            <p className="text-xs tracking-[0.36em] font-display font-bold text-mono-amber mb-7">THE LIVING MAGAZINE</p>
            <h1 className="text-5xl md:text-8xl font-display font-bold leading-[0.92]">The Intelligence<br />Behind African<br /><span className="text-mono-amber">Influence.</span></h1>
            <p className="mt-8 max-w-2xl text-xl text-mono-soft-white font-body">A founding collection on authorship, relevance, creative commerce and the brands learning how Africa moves the world.</p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/issues/001/the-intelligence-behind-african-influence" className="inline-flex items-center gap-2 bg-mono-amber text-mono-black px-7 py-4 font-display font-bold">READ COVER ESSAY <ArrowRight size={18} /></Link>
              <Link href="/issues/001/cover" className="inline-flex items-center gap-2 border border-mono-white/70 text-mono-white px-7 py-4 font-display font-bold">VIEW COVER STUDY <ArrowRight size={18} /></Link>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-3 border-t border-mono-white/20 pt-5 text-[11px] tracking-[0.2em] font-display font-bold text-mono-gray">
            <span className="text-mono-amber">COVER ESSAY</span><span>THE WORK</span><span>WILL IT LAND? / SA</span><span>BRAND WEATHER</span><span>CONVERSATIONS</span>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24 bg-mono-soft-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mb-12">
            <p className="text-xs tracking-[0.32em] font-display font-bold text-mono-amber mb-5">THE RELEASE PACKAGE</p>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-mono-black">The first body of work behind the promise.</h2>
            <p className="mt-6 text-lg font-body text-mono-charcoal">The founding body of editorial work — each piece source-verified, media-credited and contributor-reviewed.</p>
          </div>
          <div className="space-y-px border border-mono-gray/25 bg-mono-gray/25">
            {features.map(({ franchise, title, description, href, status, icon }, index) => {
              const Icon = ICONS[icon ?? ''] ?? FileText;
              return (
              <Link key={href} href={href} className="group grid md:grid-cols-[78px_1fr_190px] gap-6 bg-mono-white p-7 md:p-9 hover:bg-mono-black transition-colors">
                <div className="flex md:block items-center gap-4">
                  <p className="text-2xl font-display font-bold text-mono-amber">0{index + 1}</p>
                  <Icon className="mt-0 md:mt-8 text-mono-amber" size={22} />
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.28em] font-display font-bold text-mono-amber mb-4">{franchise}</p>
                  <h3 className="text-2xl md:text-3xl font-display font-bold text-mono-black group-hover:text-mono-white">{title}</h3>
                  <p className="mt-4 font-body text-mono-charcoal group-hover:text-mono-soft-white leading-relaxed max-w-3xl">{description}</p>
                </div>
                <div className="flex md:flex-col justify-between items-start md:items-end">
                  <span className="text-[10px] tracking-[0.18em] font-display font-bold border border-mono-gray/30 text-mono-gray group-hover:text-mono-soft-white px-3 py-2">{status}</span>
                  <span className="inline-flex items-center gap-2 mt-0 md:mt-8 text-mono-amber font-display font-bold text-sm">OPEN <ArrowRight size={16} /></span>
                </div>
              </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-mono-black text-mono-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1fr_320px] gap-12 items-center">
          <div>
            <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber mb-5">PUBLICATION STANDARD</p>
            <h2 className="text-4xl md:text-5xl font-display font-bold">Strong enough to publish. Careful enough to trust.</h2>
            <p className="mt-6 text-lg text-mono-soft-white font-body">Every story in Issue 001 is cleared for its claims, sources, visual attribution and contributor approvals before it runs.</p>
          </div>
          <Link href="/intelligence/source-desk" className="border border-mono-white/20 p-7 hover:border-mono-amber transition-colors">
            <p className="text-xs tracking-[0.25em] font-display font-bold text-mono-amber">SOURCE DESK</p>
            <p className="mt-6 text-2xl font-display font-bold">See the evidence method.</p>
            <p className="mt-6 inline-flex gap-2 items-center text-mono-amber font-display font-bold">EXPLORE <ArrowRight size={18} /></p>
          </Link>
        </div>
      </section>
    </div>
  );
}
