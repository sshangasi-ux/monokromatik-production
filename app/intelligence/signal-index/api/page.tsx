import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, ArrowRight, Database, Code2, FileJson, Table } from 'lucide-react';
import Navigation from '../../../components/Navigation';

export const revalidate = 3600;
const SITE = 'https://www.monokromatik.com';

export const metadata: Metadata = {
  title: 'Index API & Data — The Cultural-Signal Index | MonoKromatik',
  description:
    'The Cultural-Signal Index as data: a free, documented JSON + CSV feed of the authorship-weighted ranking — endpoints, schema, versioning and terms. Licensed tiers add refresh cadence, history and team rights.',
  alternates: { canonical: `${SITE}/intelligence/signal-index/api` },
  openGraph: {
    title: 'The Cultural-Signal Index — API & Data',
    description: 'A free, documented JSON + CSV feed of the authorship-weighted ranking.',
    url: `${SITE}/intelligence/signal-index/api`,
  },
};

const FIELDS: { name: string; type: string; desc: string }[] = [
  { name: 'rank', type: 'number', desc: 'Position in the ranking (1 = highest composite).' },
  { name: 'brand', type: 'string', desc: 'The brand / work as named on the Index.' },
  { name: 'slug', type: 'string', desc: 'URL-safe id; the per-brand page is /intelligence/signal-index/{slug}.' },
  { name: 'score', type: 'number', desc: 'Cultural-Signal composite, 0–100 (authorship-weighted).' },
  { name: 'works', type: 'number', desc: 'Number of scored works behind the brand’s composite.' },
  { name: 'axes', type: 'object', desc: 'Per-axis averages (1–5): IDEA, AUTHORSHIP, EXECUTION, CONSEQUENCE.' },
  { name: 'movement', type: 'object | null', desc: '{ scoreDelta, rankDelta, since } vs the previous snapshot, or null.' },
  { name: 'newlyRanked', type: 'boolean', desc: 'True when the brand entered the Index in the latest snapshot.' },
  { name: 'url', type: 'string', desc: 'Canonical per-brand Index page.' },
];

const EXAMPLE = `{
  "name": "The Cultural-Signal Index",
  "version": "1.0",
  "documentation": "https://www.monokromatik.com/intelligence/signal-index/api",
  "methodology": {
    "scale": "0–100 composite, authorship-weighted; each axis scored 1–5",
    "axes": [
      { "label": "IDEA", "weight": 0.25 },
      { "label": "AUTHORSHIP", "weight": 0.35 },
      { "label": "EXECUTION", "weight": 0.15 },
      { "label": "CONSEQUENCE", "weight": 0.25 }
    ]
  },
  "generatedAt": "2026-06-29T12:00:00.000Z",
  "trackingSince": "2026-06-23",
  "count": 26,
  "index": [
    {
      "rank": 1,
      "brand": "Letsile Tebogo × De Beers / Botswana",
      "slug": "letsile-tebogo-de-beers-botswana",
      "score": 97,
      "works": 1,
      "axes": { "IDEA": 5, "AUTHORSHIP": 5, "EXECUTION": 4, "CONSEQUENCE": 5 },
      "movement": null,
      "newlyRanked": false,
      "url": "https://www.monokromatik.com/intelligence/signal-index/letsile-tebogo-de-beers-botswana"
    }
  ]
}`;

function Block({ children }: { children: React.ReactNode }) {
  return (
    <pre className="overflow-x-auto bg-mono-black text-mono-soft-white text-[12px] md:text-[13px] leading-relaxed font-mono p-5 border border-mono-white/10">{children}</pre>
  );
}

export default function IndexApiPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'The Cultural-Signal Index — API & Data',
    about: 'Public JSON/CSV data feed of the MonoKromatik Cultural-Signal Index',
    url: `${SITE}/intelligence/signal-index/api`,
    publisher: { '@type': 'Organization', name: 'MonoKromatik', url: SITE },
    isPartOf: { '@type': 'Dataset', name: 'The Cultural-Signal Index', url: `${SITE}/intelligence/signal-index` },
  };

  return (
    <div className="min-h-screen bg-mono-paper">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navigation />

      <header className="bg-mono-black text-mono-white py-16 md:py-24 border-b border-mono-white/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/intelligence/signal-index" className="inline-flex items-center gap-2 text-xs tracking-[0.2em] font-display font-bold text-mono-gray hover:text-mono-amber-bright transition-colors mb-12">
            <ArrowLeft size={14} /> THE CULTURAL-SIGNAL INDEX
          </Link>
          <p className="text-xs tracking-[0.35em] font-display font-bold text-mono-amber mb-6">API &amp; DATA · v1.0</p>
          <h1 className="max-w-4xl text-5xl md:text-7xl font-display font-bold leading-[0.95]">The Index, as data.</h1>
          <p className="mt-8 max-w-2xl text-lg md:text-xl text-mono-soft-white font-body leading-relaxed">
            The full ranking as a free, documented feed — JSON for applications and AI engines, CSV for analysts. Cite it,
            build on it. The licensed tiers add refresh cadence, history, segmentation and team rights.
          </p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 space-y-16">
        <section>
          <div className="flex items-center gap-3 mb-5">
            <Code2 className="text-mono-amber" size={22} />
            <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong">ENDPOINTS</p>
          </div>
          <div className="space-y-6">
            <div>
              <p className="flex items-center gap-2 font-display font-bold text-mono-black mb-2"><FileJson size={17} className="text-mono-amber-strong" /> JSON — the full ranking</p>
              <Block>{`GET ${SITE}/api/index`}</Block>
            </div>
            <div>
              <p className="flex items-center gap-2 font-display font-bold text-mono-black mb-2"><Table size={17} className="text-mono-amber-strong" /> CSV — the same ranking as a spreadsheet</p>
              <Block>{`GET ${SITE}/api/index?format=csv`}</Block>
            </div>
            <p className="text-sm font-body text-mono-charcoal">
              Both are <code className="font-mono text-[13px] bg-mono-soft-white px-1.5 py-0.5">CORS</code>-open and cached. No key required.
              Example: <code className="font-mono text-[13px] bg-mono-soft-white px-1.5 py-0.5">curl {SITE}/api/index</code>
            </p>
          </div>
        </section>

        <section>
          <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong mb-5">RESPONSE — DATA DICTIONARY</p>
          <p className="font-body text-mono-charcoal mb-6">Top-level: <code className="font-mono text-[13px] bg-mono-soft-white px-1.5 py-0.5">name, version, methodology, generatedAt, trackingSince, count, index[]</code>. Each item in <code className="font-mono text-[13px] bg-mono-soft-white px-1.5 py-0.5">index</code>:</p>
          <div className="border border-mono-gray/25 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-mono-soft-white text-left">
                  <th className="font-display font-bold text-mono-black px-4 py-3 text-[11px] tracking-[0.14em]">FIELD</th>
                  <th className="font-display font-bold text-mono-black px-4 py-3 text-[11px] tracking-[0.14em]">TYPE</th>
                  <th className="font-display font-bold text-mono-black px-4 py-3 text-[11px] tracking-[0.14em]">DESCRIPTION</th>
                </tr>
              </thead>
              <tbody>
                {FIELDS.map((f) => (
                  <tr key={f.name} className="border-t border-mono-gray/20 align-top">
                    <td className="px-4 py-3 font-mono text-[13px] text-mono-black whitespace-nowrap">{f.name}</td>
                    <td className="px-4 py-3 font-mono text-[12px] text-mono-amber-strong whitespace-nowrap">{f.type}</td>
                    <td className="px-4 py-3 font-body text-mono-charcoal">{f.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong mb-5">EXAMPLE RESPONSE</p>
          <Block>{EXAMPLE}</Block>
        </section>

        <section>
          <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong mb-5">VERSIONING &amp; TERMS</p>
          <div className="space-y-3 font-body text-mono-charcoal">
            <p><strong>Stability.</strong> The feed is versioned (<code className="font-mono text-[13px] bg-mono-soft-white px-1.5 py-0.5">version: &quot;1.0&quot;</code>). Fields are additive within a major version; breaking changes bump the major and are announced here.</p>
            <p><strong>Terms.</strong> Free to use and cite <strong>with attribution to MonoKromatik and a link to the source page</strong>. The scores are interpretive editorial judgement — see the <Link href="/intelligence/signal-index/methodology" className="text-mono-amber-strong hover:underline">methodology</Link>.</p>
            <p><strong>Cadence.</strong> The public feed reflects the current ranking. <strong>Historical snapshots, movement series, segmentation and a refresh SLA</strong> are part of the licensed tiers.</p>
          </div>
        </section>

        <section className="border-t border-mono-gray/20 pt-12">
          <div className="flex items-center gap-3 mb-5">
            <Database className="text-mono-amber" size={22} />
            <p className="text-xs tracking-[0.3em] font-display font-bold text-mono-amber-strong">BUILD ON IT</p>
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-mono-black">Need history, segmentation or a dashboard?</h2>
          <p className="mt-6 font-body text-lg text-mono-charcoal leading-relaxed">
            The free feed is the on-ramp. For authenticated access to the full dataset with movement history, custom cuts,
            a live dashboard, alerts and team rights, license the Index — from a single league table to the enterprise API.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a href="/api/index" className="inline-flex items-center gap-2 bg-mono-black text-mono-white px-7 py-4 font-display font-bold hover:bg-mono-charcoal transition-colors">TRY THE LIVE FEED <ArrowRight size={17} /></a>
            <Link href="/intelligence/license" className="inline-flex items-center gap-2 border border-mono-black text-mono-black px-7 py-4 font-display font-bold hover:bg-mono-black hover:text-mono-white transition-colors">LICENSE THE INDEX <ArrowRight size={17} /></Link>
          </div>
        </section>
      </main>
    </div>
  );
}
