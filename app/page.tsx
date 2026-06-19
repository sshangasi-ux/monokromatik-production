import Link from 'next/link';
import { ArrowRight, BookOpen, Database, FileText, Mic, PenLine, ShieldCheck, Sparkles } from 'lucide-react';
import Navigation from './components/Navigation';
import LivingCover, { CoverSlide } from './components/LivingCover';
import NewsletterSignup from './components/NewsletterSignup';
import TrendingArticles from './components/TrendingArticles';
import MediaImage from './components/MediaImage';
import { Reveal, Stagger, StaggerItem } from './components/motion/Motion';
import { getAllArticles, getReadingTime, type Article } from '../lib/articles';

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

const deskLayers = [
  {
    title: 'SOURCE DESK',
    copy: 'The evidence system: primary sources, creative intelligence, African context and audience signals.',
    href: '/intelligence/source-desk',
    icon: ShieldCheck,
  },
  {
    title: 'CASE STUDIES',
    copy: 'Structured reads of the context, strategic bet, creative move, evidence and African lesson.',
    href: '/intelligence/case-studies',
    icon: Database,
  },
  {
    title: 'REPORTS',
    copy: 'Designed intelligence briefings and special editions built to be revisited and eventually collected.',
    href: '/reports',
    icon: FileText,
  },
  {
    title: 'CONTRIBUTE',
    copy: 'A gateway for marketers, creators and thinkers bringing an argument, decision or signal worth pursuing.',
    href: '/contribute',
    icon: PenLine,
  },
];

export default function Home() {
  const articles = getAllArticles();
  const featured = articles[0];
  const dispatches = articles.slice(0, 4);

  const coverSlides: CoverSlide[] = [
    {
      kicker: 'COVER STORY / CULTURAL SIGNAL',
      title: featured?.title || 'Culture is not decoration. It is direction.',
      description: featured?.excerpt || 'A living record of the movements brands should understand before they attempt to participate.',
      href: featured ? `/article/${featured.slug}` : '/culture',
      cta: 'READ THE STORY',
      imageUrl: featured?.imageUrl,
      videoUrl: featured?.videoUrl,
      mode: 'story',
    },
    {
      kicker: 'FOUNDING EDITORIAL POSITION',
      title: 'The Intelligence Behind African Influence.',
      description: 'Monokromatik decodes the brands, campaigns, creators and cultural forces shaping how Africa moves the world.',
      href: '/signal',
      cta: 'ENTER SIGNAL',
      mode: 'signal',
    },
    {
      kicker: 'INTELLIGENCE DESK',
      title: 'Research the work shaping Africa’s brand future.',
      description: 'Case studies, reports, source-led insight and a future research assistant grounded in reviewed intelligence.',
      href: '/intelligence',
      cta: 'OPEN INTELLIGENCE',
      mode: 'intelligence',
    },
  ];

  return (
    <div className="min-h-screen bg-mono-white">
      <Navigation />
      <LivingCover slides={coverSlides} />

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
              <div className="mt-8 grid sm:grid-cols-3 gap-3 text-center text-xs tracking-[0.16em] font-display font-bold">
                <Link href="/intelligence/case-studies" className="border border-mono-gray/25 px-3 py-5 hover:border-mono-amber transition-colors">CASE STUDIES</Link>
                <Link href="/reports" className="border border-mono-gray/25 px-3 py-5 hover:border-mono-amber transition-colors">REPORTS</Link>
                <Link href="/intelligence/source-desk" className="border border-mono-gray/25 px-3 py-5 hover:border-mono-amber transition-colors">SOURCE DESK</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-mono-soft-white py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <p className="text-xs tracking-[0.34em] font-display font-bold text-mono-amber-strong mb-4">FROM THE DESK</p>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-mono-black">Four ways into the intelligence network.</h2>
            <p className="mt-6 text-lg font-body text-mono-charcoal">Evidence, structured cases, designed reports and external voices are now the practical layers through which Monokromatik grows.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-mono-gray/25 border border-mono-gray/25">
            {deskLayers.map(({ title, copy, href, icon: Icon }) => (
              <Link key={title} href={href} className="group bg-mono-white p-7 md:p-8 min-h-[280px] flex flex-col justify-between hover:bg-mono-black transition-colors">
                <Icon className="text-mono-amber" size={24} />
                <div>
                  <h3 className="text-xl font-display font-bold text-mono-black group-hover:text-mono-white transition-colors">{title}</h3>
                  <p className="mt-4 font-body text-mono-charcoal group-hover:text-mono-soft-white leading-relaxed transition-colors">{copy}</p>
                  <span className="mt-6 inline-flex gap-2 items-center text-mono-amber font-display font-bold text-sm">ENTER <ArrowRight size={16} /></span>
                </div>
              </Link>
            ))}
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
                The freshest signals across culture, sport and sound — updated continuously as our agents publish.
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

      <footer className="py-14 bg-mono-black border-t border-mono-white/15 text-mono-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-10">
          <div>
            <h3 className="font-display font-bold text-xl">MONO<span className="text-mono-amber">KROMATIK</span></h3>
            <p className="mt-4 text-mono-gray font-body text-sm">The Intelligence Behind African Influence.</p>
          </div>
          <div className="font-body text-sm text-mono-gray grid grid-cols-2 gap-y-3">
            <Link className="hover:text-mono-amber" href="/signal">Signal</Link>
            <Link className="hover:text-mono-amber" href="/intelligence">Intelligence</Link>
            <Link className="hover:text-mono-amber" href="/intelligence/source-desk">Source Desk</Link>
            <Link className="hover:text-mono-amber" href="/intelligence/case-studies">Case Studies</Link>
            <Link className="hover:text-mono-amber" href="/reports">Reports</Link>
            <Link className="hover:text-mono-amber" href="/issues">Issues</Link>
            <Link className="hover:text-mono-amber" href="/contribute">Contribute</Link>
            <Link className="hover:text-mono-amber" href="/editorial-standards">Standards</Link>
          </div>
          <div>
            <p className="text-sm text-mono-gray font-body">AI-assisted discovery. Human-directed intelligence. Attributable sources. Distinct African judgment.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
