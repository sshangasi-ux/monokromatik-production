import Link from 'next/link';
import { ArrowRight, BookOpen, Database, Download, FileText, Layers, Mic, Sparkles } from 'lucide-react';
import Navigation from './components/Navigation';
import LivingCover from './components/LivingCover';
import BreakingStrip from './components/BreakingStrip';
import { buildCoverSlides } from '../lib/cover-slides';
import NewsletterSignup from './components/NewsletterSignup';
import TrendingArticles from './components/TrendingArticles';
import MediaImage from './components/MediaImage';
import { Reveal, Stagger, StaggerItem } from './components/motion/Motion';
import { getAllArticles, getReadingTime, type Article } from '../lib/articles';
import { getPublicCaseStudies } from '../lib/case-studies';
import { rankIndex } from '../lib/signal-index';
import CTA from './components/CTA';
import type { Metadata } from 'next';

// Canonical only — title/description/OG are inherited from the root layout.
export const metadata: Metadata = {
  alternates: { canonical: 'https://www.monokromatik.com' },
};

export const revalidate = 60;

function DispatchCard({ article, feature = false }: { article: Article; feature?: boolean }) {
  return (
    <Link href={`/article/${article.slug}`} className="group block">
      <div className={`relative overflow-hidden bg-mono-charcoal ${feature ? 'aspect-[5/4]' : 'aspect-[4/3]'}`}>
        <MediaImage fill src={article.imageUrl} alt={article.title} />
        <div className="absolute inset-0 bg-gradient-to-t from-mono-black via-transparent to-transparent" />
        <div className="absolute bottom-0 p-5 md:p-6">
          <span className="text-[10px] tracking-[0.25em] font-display font-bold text-mono-amber uppercase">{article.category} / Dispatch</span>
          <h3 className={`${feature ? 'text-2xl md:text-3xl' : 'text-xl'} mt-3 font-display font-bold text-mono-white leading-tight`}>{article.title}</h3>
          <p className="mt-3 text-xs font-body text-mono-gray">{getReadingTime(article.content)} min read</p>
        </div>
      </div>
    </Link>
  );
}

const signalFranchises = [
  {
    title: 'THE WORK',
    copy: 'Creative work involving Africa and its diaspora, decoded through idea, authorship, execution and consequence.',
    label: 'Campaign Intelligence',
  },
  {
    title: 'WILL IT LAND?',
    copy: 'Global brand moves put through an African relevance test. Brilliant elsewhere does not automatically mean meaningful here.',
    label: 'Market Provocation',
  },
  {
    title: 'THE AFRICAN ADVANTAGE',
    copy: 'Essays and voices on why African markets, creativity and cultural systems matter to global growth.',
    label: 'Thought Leadership',
  },
  {
    title: 'CULTURE IS BUSINESS',
    copy: 'Where music, sport, fashion, travel and creators translate influence into value, ownership and scale.',
    label: 'Commerce',
  },
];

const intelligencePrompts = [
  'Show campaigns where African creators shaped the brand idea, not only the casting.',
  'Compare sport-culture collaborations across Lagos, Johannesburg and London.',
  'Which global brands are meaningfully investing in African relevance?',
];

// Footer site-map, grouped so the full surface reads as structure, not a wall.
const footerGroups = [
  {
    title: 'READ',
    links: [
      { href: '/culture', label: 'The Library' },
      { href: '/signal', label: 'Signal' },
      { href: '/breaking', label: 'The Wire' },
      { href: '/conversations', label: 'Conversations' },
      { href: '/weekly', label: 'The Weekly Signal' },
    ],
  },
  {
    title: 'INTELLIGENCE',
    links: [
      { href: '/reports', label: 'Reports' },
      { href: '/ownership-100', label: 'The Ownership 100' },
      { href: '/intelligence/signal-index', label: 'The Index' },
      { href: '/intelligence/case-studies', label: 'Case Studies' },
      { href: '/intelligence/source-desk', label: 'Source Desk' },
      { href: '/watch', label: 'Watch' },
    ],
  },
  {
    title: 'THE DESK',
    links: [
      { href: '/about', label: 'About' },
      { href: '/work-with-us', label: 'Work With Us' },
      { href: '/services', label: 'Services' },
      { href: '/partner', label: 'Partner' },
      { href: '/membership', label: 'Membership' },
      { href: '/editorial-standards', label: 'Editorial Standards' },
    ],
  },
];

export default function Home() {
  const articles = getAllArticles();
  const featured = articles[0];
  const dispatches = articles.slice(0, 4);
  // Latest stories, surfaced high on the page — the homepage→article hand-off
  // was the biggest on-site drop-off, and readable stories were buried below
  // the brand/marketing sections. This puts them right after the hero + Wire.
  const latest = articles.slice(0, 8);

  // Daily hero carousel: the day's leading content across articles, case studies
  // and reports — each in the article-hero format. Refreshes as new content ships.
  const coverSlides = buildCoverSlides();

  // The flagship Index — surfaced on the homepage, not just the footer.
  const ranked = rankIndex(getPublicCaseStudies());
  const indexTop = ranked[0]?.score ?? 0;
  const indexCount = ranked.length;

  return (
    <div className="min-h-screen bg-mono-white">
      <Navigation />
      <LivingCover slides={coverSlides} />

      {/* Value prop — what MonoKromatik is, in one line, on first load. */}
      <section className="bg-mono-paper border-b border-mono-gray/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-baseline gap-1.5 sm:gap-5">
          <p className="text-sm md:text-[15px] font-display font-bold text-mono-black tracking-tight shrink-0">Who owns African culture — and who keeps the money.</p>
          <p className="text-sm font-body text-mono-charcoal">Named analysis by Sibu Shangase · a free library, value-capture reports, and The Ownership 100.</p>
        </div>
      </section>

      <BreakingStrip />

      {/* LATEST — readable stories at the TOP of the funnel, right after the hero
          and Wire. Homepage→article was the biggest on-site drop-off; the brand
          sections below sell the network, this surfaces the stories to read now. */}
      <section className="bg-mono-white pt-14 pb-16 md:pt-16 md:pb-20 border-b border-mono-gray/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong mb-2">LATEST</p>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-mono-black leading-tight">The stories, now.</h2>
            </div>
            <Link href="/archive" className="hidden sm:inline-flex items-center gap-2 text-sm font-display font-bold text-mono-amber-strong hover:text-mono-amber-hover">
              All stories <ArrowRight size={16} />
            </Link>
          </div>
          <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {latest.map((a) => (
              <StaggerItem key={a.slug}><DispatchCard article={a} /></StaggerItem>
            ))}
          </Stagger>
          <div className="mt-8 sm:hidden">
            <Link href="/archive" className="inline-flex items-center gap-2 text-sm font-display font-bold text-mono-amber-strong">
              All stories <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-mono-white py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-5">
            <Link href="/signal" className="group bg-mono-black text-mono-white p-9 md:p-12 min-h-[390px] flex flex-col justify-between hover:bg-mono-charcoal transition-colors">
              <div className="flex justify-between items-start">
                <span className="text-xs tracking-[0.32em] font-display font-bold text-mono-amber">01 / SIGNAL</span>
                <Sparkles className="text-mono-amber" size={22} />
              </div>
              <div>
                <h2 className="text-4xl md:text-5xl font-display font-bold leading-tight">The ideas.<br />The work.<br />The consequence.</h2>
                <p className="mt-6 max-w-md text-mono-soft-white font-body text-lg">Our authored view on brands and influence: campaigns, commercial culture, provocation and leading African voices.</p>
                <span className="mt-8 inline-flex items-center gap-2 text-mono-amber font-display font-bold">READ SIGNAL <ArrowRight size={18} /></span>
              </div>
            </Link>
            <Link href="/intelligence" className="group bg-mono-soft-white border border-mono-gray/25 text-mono-black p-9 md:p-12 min-h-[390px] flex flex-col justify-between hover:border-mono-amber transition-colors">
              <div className="flex justify-between items-start">
                <span className="text-xs tracking-[0.32em] font-display font-bold text-mono-amber">02 / INTELLIGENCE</span>
                <Database className="text-mono-amber" size={22} />
              </div>
              <div>
                <h2 className="text-4xl md:text-5xl font-display font-bold leading-tight">Evidence with a<br />point of view.</h2>
                <p className="mt-6 max-w-md text-mono-charcoal font-body text-lg">Case studies, reporting, curated source intelligence and market insight built for decision makers.</p>
                <span className="mt-8 inline-flex items-center gap-2 text-mono-amber-strong font-display font-bold">OPEN THE DESK <ArrowRight size={18} /></span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* The shop, surfaced high — the paid library was invisible above the
          fold (buried in nav grids). One commercial band: free to read, or own
          the value-capture studies. One primary CTA + one secondary. */}
      <section className="bg-mono-white pb-20 md:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1fr_auto] gap-8 lg:gap-12 items-center border-2 border-mono-black bg-mono-soft-white p-8 md:p-11 shadow-[6px_6px_0_0_var(--mono-amber)]">
            <div className="max-w-2xl">
              <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong mb-4">THE LIBRARY · BUY THE DEEP ONES</p>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-mono-black leading-[1.02] text-balance">
                Read the briefings free. Own the value-capture studies.
              </h2>
              <p className="mt-4 font-body text-lg text-mono-charcoal leading-relaxed">
                Designed, source-verified reports on who owns African culture — and who keeps the money.
                Free to read, or bought as watermarked PDFs from R220; the institutional flagship is R3,500,
                and the Full Shelf bundles the lot.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-display font-bold text-mono-gray">
                <span className="inline-flex items-center gap-2"><FileText size={15} className="text-mono-amber-strong" /> Free briefings</span>
                <span className="inline-flex items-center gap-2"><Download size={15} className="text-mono-amber-strong" /> Studies from R220</span>
                <span className="inline-flex items-center gap-2"><Layers size={15} className="text-mono-amber-strong" /> The Full Shelf bundle</span>
              </div>
            </div>
            <div className="shrink-0 flex flex-col gap-3">
              <Link href="/reports" className="inline-flex gap-2 items-center justify-center bg-mono-black text-mono-white px-8 py-4 font-display font-bold hover:bg-mono-charcoal transition-colors whitespace-nowrap">
                BROWSE THE LIBRARY <ArrowRight size={18} />
              </Link>
              <Link href="/bundles" className="inline-flex gap-1.5 items-center justify-center text-[12px] tracking-[0.08em] font-display font-bold text-mono-amber-strong hover:text-mono-amber-hover">
                SEE THE BUNDLES <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* The flagship — the Cultural-Signal Index, promoted on the homepage. */}
      <section className="bg-mono-black text-mono-white py-16 md:py-24 border-y border-mono-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-14 items-center">
          <div>
            <p className="text-xs tracking-[0.32em] font-display font-bold text-mono-amber mb-5">THE FLAGSHIP · THE CULTURAL-SIGNAL INDEX</p>
            <h2 className="text-4xl md:text-6xl font-display font-bold leading-[0.98]">Who authored the influence. <span className="text-mono-amber">Ranked.</span></h2>
            <p className="mt-6 max-w-xl text-lg text-mono-soft-white font-body leading-relaxed">
              An authorship-weighted score across four editorial dimensions — Idea, Authorship, Execution, Consequence.
              Evidence-led, transparent methodology, free public data feed. The standard for who owns the upside of African culture.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <CTA href="/intelligence/signal-index" variant="amber">EXPLORE THE INDEX</CTA>
              <CTA href="/intelligence/signal-index/methodology" variant="text" className="text-mono-amber hover:text-mono-amber-bright">SEE THE METHODOLOGY</CTA>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-px bg-mono-white/15 border border-mono-white/15">
            {[
              { v: String(indexCount), l: 'Brands ranked' },
              { v: String(indexTop), l: 'Top score /100' },
              { v: '4', l: 'Scoring axes' },
            ].map((s) => (
              <div key={s.l} className="bg-mono-black p-6 md:p-8 text-center">
                <p className="text-4xl md:text-5xl font-display font-bold text-mono-amber tabular-nums">{s.v}</p>
                <p className="mt-2 text-[10px] tracking-[0.2em] font-display font-bold text-mono-gray-bright uppercase">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Free lead magnet — the Value-Capture Checker. A 60-second interactive
          AOC read, placed right after the Index flagship: the top-of-funnel for
          the intelligence-services offering, and a light band between two dark
          sections. */}
      <section className="bg-mono-soft-white py-16 md:py-20 border-b border-mono-gray/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 border-2 border-mono-black bg-mono-white p-8 md:p-11 shadow-[6px_6px_0_0_var(--mono-amber)]">
            <div className="max-w-2xl">
              <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong mb-4">FREE TOOL · 60 SECONDS</p>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-mono-black leading-[1.02] text-balance">
                You can own it in culture and still be owned on the balance sheet.
              </h2>
              <p className="mt-4 font-body text-lg text-mono-charcoal leading-relaxed">
                Five questions. See where your brand or property sits on the Authorship&nbsp;→&nbsp;Ownership&nbsp;→&nbsp;Capture
                framework — Retained, Exported, Hollowed or Contested — and what to do about it.
              </p>
            </div>
            <div className="shrink-0 flex flex-col gap-3">
              <Link href="/value-capture-checker" className="inline-flex gap-2 items-center justify-center bg-mono-black text-mono-white px-8 py-4 font-display font-bold hover:bg-mono-charcoal transition-colors whitespace-nowrap">
                TAKE THE CHECKER <ArrowRight size={18} />
              </Link>
              <Link href="/services" className="inline-flex gap-1.5 items-center justify-center text-[12px] tracking-[0.08em] font-display font-bold text-mono-amber-strong hover:text-mono-amber-hover">
                SEE THE SERVICES <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-mono-black text-mono-white py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-7 mb-12">
            <div className="max-w-3xl">
              <p className="text-xs tracking-[0.34em] font-display font-bold text-mono-amber mb-4">SIGNAL / SIGNATURE FRANCHISES</p>
              <h2 className="text-4xl md:text-6xl font-display font-bold leading-tight">Our voice is the product.</h2>
            </div>
            <Link href="/signal" className="font-display font-bold text-mono-amber inline-flex gap-2 items-center">EXPLORE ALL SIGNAL <ArrowRight size={18} /></Link>
          </div>
          <div className="grid md:grid-cols-2 gap-px bg-mono-white/15 border border-mono-white/15">
            {signalFranchises.map((format, index) => (
              <div key={format.title} className="bg-mono-black p-8 md:p-10 min-h-[270px] flex flex-col justify-between">
                <div className="flex justify-between text-[10px] tracking-[0.25em] font-display font-bold">
                  <span className="text-mono-amber">{format.label}</span>
                  <span className="text-mono-gray">0{index + 1}</span>
                </div>
                <div>
                  <h3 className="text-3xl font-display font-bold">{format.title}</h3>
                  <p className="mt-4 font-body text-mono-soft-white leading-relaxed">{format.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24 bg-mono-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[0.92fr_1.08fr] gap-12 items-start">
            <div className="lg:sticky lg:top-28">
              <p className="text-xs tracking-[0.34em] font-display font-bold text-mono-amber-strong mb-4">INTELLIGENCE DESK</p>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-mono-black leading-tight">Research Africa’s brand future through the work already shaping it.</h2>
              <p className="mt-7 text-lg text-mono-charcoal font-body leading-relaxed">Built from reputable marketing, advertising, creative, business and official campaign sources — sharpened through Monokromatik interpretation.</p>
              <Link href="/intelligence" className="mt-9 inline-flex gap-2 items-center bg-mono-black text-mono-white px-7 py-4 font-display font-bold">ENTER INTELLIGENCE <ArrowRight size={18} /></Link>
            </div>
            <div className="border border-mono-gray/25 bg-mono-soft-white p-6 md:p-9">
              <p className="text-[10px] tracking-[0.3em] text-mono-gray font-display font-bold mb-6">ASK MONOKROMATIK / EARLY ACCESS</p>
              {intelligencePrompts.map((prompt) => (
                <div key={prompt} className="bg-mono-white border-l-4 border-mono-amber p-5 mb-4 font-body text-mono-charcoal text-lg">{prompt}</div>
              ))}
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs tracking-[0.16em] font-display font-bold">
                <Link href="/intelligence/signal-index" className="border border-mono-amber bg-mono-amber/10 text-mono-amber-strong px-3 py-5 hover:bg-mono-amber/20 transition-colors">THE INDEX</Link>
                <Link href="/intelligence/case-studies" className="border border-mono-gray/25 px-3 py-5 hover:border-mono-amber transition-colors">CASE STUDIES</Link>
                <Link href="/reports" className="border border-mono-gray/25 px-3 py-5 hover:border-mono-amber transition-colors">REPORTS</Link>
                <Link href="/intelligence/source-desk" className="border border-mono-gray/25 px-3 py-5 hover:border-mono-amber transition-colors">SOURCE DESK</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {dispatches.length > 0 && (
        <section className="bg-mono-white py-20 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-10">
              <Reveal>
                <p className="text-xs tracking-[0.34em] font-display font-bold text-mono-amber-strong mb-4">CULTURAL DISPATCHES</p>
                <h2 className="text-4xl font-display font-bold text-mono-black">The evidence base.</h2>
              </Reveal>
              <Link href="/culture" className="inline-flex gap-2 items-center font-display font-bold text-mono-amber-strong hover:text-mono-amber-hover">EXPLORE CULTURE <ArrowRight size={18} /></Link>
            </div>
            <Stagger className="grid lg:grid-cols-[1.25fr_0.75fr_0.75fr] gap-5">
              {dispatches[0] && <StaggerItem><DispatchCard article={dispatches[0]} feature /></StaggerItem>}
              {dispatches.slice(1, 3).map((article) => <StaggerItem key={article.slug}><DispatchCard article={article} /></StaggerItem>)}
            </Stagger>
          </div>
        </section>
      )}

      {featured && (
        <section className="relative">
          <Link
            href={`/article/${featured.slug}`}
            className="group block relative h-[72vh] min-h-[460px] overflow-hidden bg-mono-ink"
          >
            <MediaImage fill src={featured.imageUrl} alt={featured.title} duotone={false} zoomOnHover />
            <div className="absolute inset-0 bg-gradient-to-t from-mono-black/85 via-mono-black/20 to-mono-black/10" />
            <div className="absolute inset-x-0 bottom-0">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 md:pb-16">
                <p className="text-xs tracking-[0.34em] font-display font-bold text-mono-amber-bright mb-5">THE COVER STORY</p>
                <h2 className="max-w-4xl text-4xl md:text-6xl font-feature font-bold text-mono-white leading-[0.98]">{featured.title}</h2>
                <p className="mt-6 inline-flex items-center gap-2 text-sm tracking-[0.18em] font-display font-bold text-mono-white group-hover:text-mono-amber-bright transition-colors">
                  READ THE STORY <ArrowRight size={16} />
                </p>
              </div>
            </div>
          </Link>
        </section>
      )}

      {articles.length > 0 && (
        <section className="bg-mono-soft-white py-20 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[0.9fr_1.1fr] gap-12 items-center">
            <div className="max-w-md w-full">
              <TrendingArticles articles={articles} limit={5} />
            </div>
            <div>
              <p className="text-xs tracking-[0.34em] font-display font-bold text-mono-amber-strong mb-4">ON THE PULSE</p>
              <h2 className="text-4xl font-display font-bold text-mono-black leading-tight">What the network is reading right now.</h2>
              <p className="mt-6 max-w-lg text-lg text-mono-charcoal font-body">
                The wider daily stream across culture, sport and sound — every story the network is tracking. For the
                major breaks alone, with the read attached, see <Link href="/breaking" className="text-mono-amber-strong font-bold hover:underline">The Wire</Link>.
              </p>
              <Link href="/pulse" className="mt-8 inline-flex items-center gap-2 font-display font-bold text-mono-amber-strong hover:text-mono-amber-hover">
                SEE THE FULL PULSE <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="bg-mono-black text-mono-white py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1fr_0.85fr] gap-12 items-center">
          <div>
            <p className="text-xs tracking-[0.34em] font-display font-bold text-mono-amber mb-4">SPECIAL ISSUES / COLLECTIBLE EDITIONS</p>
            <h2 className="text-4xl md:text-6xl font-display font-bold leading-tight">Designed to be saved.<br />Built to be printed.</h2>
            <p className="mt-7 max-w-xl text-lg text-mono-soft-white font-body">Digital issues and future physical editions devoted to the work, voices and ideas moving African brand influence forward.</p>
            <Link href="/issues" className="mt-9 inline-flex items-center gap-2 text-mono-amber font-display font-bold">VIEW THE ISSUE CONCEPT <ArrowRight size={18} /></Link>
          </div>
          <div className="relative max-w-sm mx-auto w-full aspect-[3/4] bg-mono-soft-white text-mono-black p-7 shadow-2xl">
            <div className="flex justify-between text-[10px] tracking-[0.25em] font-display font-bold text-mono-gray">
              <span>MONOKROMATIK</span><span>001</span>
            </div>
            <div className="mt-14 h-px bg-mono-black" />
            <p className="mt-8 text-xs tracking-[0.28em] font-display font-bold text-mono-amber-strong">FOUNDING ISSUE</p>
            <h3 className="mt-6 text-4xl font-display font-bold leading-[0.98]">The Intelligence<br />Behind African<br />Influence.</h3>
            <div className="absolute bottom-7 left-7 right-7 border-t border-mono-black pt-4 text-xs font-body text-mono-charcoal">Campaigns · Voices · Commerce · Diaspora · Creative Futures</div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-mono-soft-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-8">
          <Link href="/conversations" className="border border-mono-gray/25 bg-mono-white p-8 md:p-10 flex gap-6 hover:border-mono-amber transition-colors">
            <Mic className="shrink-0 text-mono-amber" />
            <div><p className="text-xs tracking-[0.25em] font-display font-bold text-mono-amber-strong">CONVERSATIONS</p><h2 className="mt-4 text-3xl font-display font-bold">The Boardroom / The Backroom</h2><p className="mt-4 text-mono-charcoal font-body">Candid thinking from marketers, creators and cultural operators behind the decisions.</p></div>
          </Link>
          <Link href="/issues" className="border border-mono-gray/25 bg-mono-white p-8 md:p-10 flex gap-6 hover:border-mono-amber transition-colors">
            <BookOpen className="shrink-0 text-mono-amber" />
            <div><p className="text-xs tracking-[0.25em] font-display font-bold text-mono-amber-strong">ISSUES</p><h2 className="mt-4 text-3xl font-display font-bold">Designed editorial collections</h2><p className="mt-4 text-mono-charcoal font-body">Curated editions intended to become the collectible expression of the platform.</p></div>
          </Link>
        </div>
      </section>

      <section className="py-20 md:py-24 bg-mono-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber mb-4">THE WEEKLY SIGNAL</p>
            <h2 className="text-3xl md:text-5xl text-mono-white font-display font-bold">The intelligence worth carrying into the room.</h2>
          </div>
          <NewsletterSignup variant="default" source="weekly-signal-homepage" />
        </div>
      </section>

      <footer className="py-16 bg-mono-black border-t border-mono-white/15 text-mono-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <h3 className="font-display font-bold text-xl">MONO<span className="text-mono-amber">KROMATIK</span></h3>
              <p className="mt-4 text-mono-gray font-body text-sm leading-relaxed">Who owns African culture — and who keeps the money. Named analysis by Sibu Shangase.</p>
            </div>
            {footerGroups.map((group) => (
              <div key={group.title}>
                <p className="text-[10px] tracking-[0.24em] font-display font-bold text-mono-amber mb-4">{group.title}</p>
                <ul className="space-y-2.5 font-body text-sm text-mono-gray">
                  {group.links.map((l) => (
                    <li key={l.href}><Link className="hover:text-mono-amber transition-colors" href={l.href}>{l.label}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 pt-6 border-t border-mono-white/10">
            <p className="text-xs text-mono-gray font-body">Named African judgment. Attributable sources on every claim. AI finds the signal — never writes the verdict.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
