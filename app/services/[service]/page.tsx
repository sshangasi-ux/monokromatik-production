import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowRight, ArrowUpRight, Check } from 'lucide-react';
import Navigation from '../../components/Navigation';
import CTA from '../../components/CTA';
import { ADVISORY_SERVICES, getAdvisoryService, CONTACT_EMAIL } from '../../../lib/commerce';

const SITE = 'https://www.monokromatik.com';

interface PageProps {
  params: Promise<{ service: string }>;
}

// Only the SKUs whose landing page is this dynamic route (Culture DD keeps its
// own bespoke page at /services/culture-due-diligence).
const DYNAMIC_SERVICES = ADVISORY_SERVICES.filter((s) => s.detailHref === `/services/${s.id}`);

export function generateStaticParams() {
  return DYNAMIC_SERVICES.map((s) => ({ service: s.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { service } = await params;
  const s = getAdvisoryService(service);
  if (!s || s.detailHref !== `/services/${s.id}`) return { title: 'Service Not Found | MonoKromatik' };
  const url = `${SITE}/services/${s.id}`;
  const title = `${s.name} — ${s.priceFrom} | MonoKromatik Intelligence`;
  const desc = `${s.name}: ${s.decision} For ${s.buyer.toLowerCase()}. ${s.priceFrom}, open pricing — the cultural read delivered as a number and a move.`;
  return {
    title,
    description: desc,
    keywords: ['african brand advisory', 'value capture consulting', s.name.toLowerCase(), 'cultural signal index'],
    alternates: { canonical: url },
    openGraph: { title: `${s.name} — MonoKromatik Intelligence`, description: desc, url, type: 'website' },
    twitter: { card: 'summary_large_image', title: `${s.name} — MonoKromatik Intelligence`, description: desc },
  };
}

export default async function ServicePage({ params }: PageProps) {
  const { service } = await params;
  const s = getAdvisoryService(service);
  if (!s || s.detailHref !== `/services/${s.id}`) notFound();

  const url = `${SITE}/services/${s.id}`;
  const others = ADVISORY_SERVICES.filter((o) => o.id !== s.id);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: s.name,
    serviceType: 'Brand & culture value-capture advisory',
    description: s.decision,
    provider: { '@type': 'Organization', name: 'MonoKromatik', url: SITE },
    areaServed: 'Africa & diaspora',
    audience: { '@type': 'Audience', audienceType: s.buyer },
    url,
    offers: { '@type': 'Offer', priceCurrency: 'USD', description: s.priceFrom, url: `${SITE}/work-with-us?interest=${s.id}` },
  };

  return (
    <div className="min-h-screen bg-mono-paper">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navigation />

      {/* Hero */}
      <header className="bg-mono-black text-mono-white py-16 md:py-24 border-b border-mono-white/15">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/intelligence"
            className="inline-flex items-center gap-2 text-xs tracking-[0.2em] font-display font-bold text-mono-gray hover:text-mono-amber-bright transition-colors mb-10"
          >
            MONOKROMATIK INTELLIGENCE · THE DESK
          </Link>
          <p className="font-display text-[11px] font-bold tracking-[0.28em] uppercase text-mono-amber-bright">
            For {s.buyer}
          </p>
          <h1 className="mt-5 font-feature text-5xl md:text-7xl font-bold leading-[0.97]">{s.name}</h1>
          <p className="mt-7 max-w-2xl text-2xl md:text-3xl text-mono-soft-white font-feature italic leading-snug">
            {s.decision}
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
            <span className="font-display font-bold text-3xl text-mono-amber">{s.priceFrom}</span>
            <span className="text-[12px] tracking-[0.1em] uppercase font-display font-bold text-mono-gray">Open pricing · scoped on a brief</span>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <CTA href={`/work-with-us?interest=${s.id}`} variant="amber">Start a brief</CTA>
            <CTA href="/intelligence/value" variant="outline" className="border-mono-white/40 text-mono-white hover:bg-mono-white/10 hover:text-mono-white">
              Try the free read first
            </CTA>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 space-y-16">
        {/* Deliverables */}
        <section>
          <p className="font-display text-[11px] font-bold tracking-[0.28em] uppercase text-mono-amber-strong mb-6">What you get</p>
          <ul className="grid gap-4">
            {s.deliverables.map((d) => (
              <li key={d} className="flex gap-4 items-start border-b border-mono-gray/20 pb-4">
                <Check size={20} className="shrink-0 mt-1 text-mono-amber-strong" aria-hidden="true" />
                <span className="font-body text-lg text-mono-charcoal leading-relaxed">{d}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Why priced, not guessed */}
        <section className="border-l-4 border-mono-amber bg-mono-black text-mono-white p-8 md:p-10">
          <p className="font-display text-[11px] font-bold tracking-[0.28em] uppercase text-mono-amber-bright mb-4">Priced, not guessed</p>
          <h2 className="font-feature text-3xl md:text-4xl font-bold leading-[1.05] text-balance">
            The cultural read, delivered as a number and a move.
          </h2>
          <p className="mt-5 max-w-2xl font-body text-lg text-mono-soft-white leading-relaxed">
            Global consultancies don&rsquo;t cover African value-capture; culture agencies don&rsquo;t price it; data
            vendors sell the data but not the decision. The Desk does all three — every read is built on the{' '}
            <Link href="/intelligence/signal-index/methodology" className="text-mono-amber hover:text-mono-amber-bright underline underline-offset-2">
              Cultural-Signal Index
            </Link>
            , named-sourced, and delivered as a decision you can act on and defend.
          </p>
        </section>

        {/* The rest of the ladder */}
        <section>
          <p className="font-display text-[11px] font-bold tracking-[0.28em] uppercase text-mono-amber-strong mb-6">The rest of the desk</p>
          <div className="grid gap-px bg-mono-gray/20 border border-mono-gray/20">
            {others.map((o) => (
              <Link
                key={o.id}
                href={o.detailHref ?? `/work-with-us?interest=${o.id}`}
                className="group bg-mono-white p-6 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 hover:bg-mono-soft-white transition-colors"
              >
                <div>
                  <h3 className="font-display font-bold text-xl text-mono-black group-hover:text-mono-amber-strong transition-colors">{o.name}</h3>
                  <p className="mt-0.5 text-[12px] tracking-[0.08em] uppercase font-display font-semibold text-mono-gray">{o.buyer}</p>
                </div>
                <span className="font-display font-bold text-mono-amber-strong inline-flex items-center gap-1.5">
                  {o.priceFrom} <ArrowUpRight size={15} />
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="border-t border-mono-gray/20 pt-10">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <h2 className="font-display font-bold text-2xl md:text-3xl text-mono-black leading-tight">Start a brief, or just ask.</h2>
              <p className="mt-2 font-body text-mono-charcoal">A short brief, no obligation — we reply from a real inbox.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <CTA href={`/work-with-us?interest=${s.id}`} variant="primary">Start a brief</CTA>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="inline-flex items-center gap-2 border border-mono-black text-mono-black px-6 py-4 font-display font-bold hover:bg-mono-black hover:text-mono-amber transition-colors"
              >
                {CONTACT_EMAIL} <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
