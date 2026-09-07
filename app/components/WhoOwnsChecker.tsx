'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, ArrowUpRight } from 'lucide-react';
import NewsletterSignup from './NewsletterSignup';

export interface OwnEntry {
  brand: string;
  owner: string;
  verdict: 'african' | 'foreign' | null;
  slug: string;
}

/** The interactive ownership checker: type any African brand, get the sourced
 *  answer + a value-capture verdict, or a capture when we don't have it yet. */
export default function WhoOwnsChecker({ entries }: { entries: OwnEntry[] }) {
  const [q, setQ] = useState('');
  const query = q.trim().toLowerCase();

  const results = useMemo(() => {
    if (query.length < 2) return [];
    const scored = entries
      .map((e) => {
        const b = e.brand.toLowerCase();
        let score = 0;
        if (b === query) score = 100;
        else if (b.startsWith(query)) score = 60;
        else if (b.includes(query)) score = 40;
        else if (e.owner.toLowerCase().includes(query)) score = 20;
        return { e, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((x) => x.e);
    return scored;
  }, [query, entries]);

  const asked = query.length >= 2;

  const chip = (v: OwnEntry['verdict']) =>
    v === 'african' ? (
      <span className="text-[10px] tracking-[0.16em] font-display font-bold uppercase px-2.5 py-1 bg-mono-amber/15 text-mono-amber-strong">Stayed African-owned</span>
    ) : v === 'foreign' ? (
      <span className="text-[10px] tracking-[0.16em] font-display font-bold uppercase px-2.5 py-1 bg-mono-black/[0.06] text-mono-charcoal">Owned abroad now</span>
    ) : null;

  return (
    <div className="max-w-2xl">
      <div className="relative">
        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-mono-gray" aria-hidden="true" />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Type an African brand — Paystack, MTN, Amarula, DStv…"
          aria-label="Search a brand to see who owns it"
          className="w-full bg-mono-white border-2 border-mono-black pl-12 pr-4 py-4 font-body text-lg text-mono-black placeholder:text-mono-gray focus:outline-none focus:border-mono-amber-strong"
        />
      </div>

      {asked && results.length > 0 && (
        <div className="mt-4 grid gap-px bg-mono-gray/20 border border-mono-gray/20">
          {results.map((e) => (
            <Link key={e.slug} href={`/article/${e.slug}`} className="group bg-mono-white p-5 flex items-start justify-between gap-4 hover:bg-mono-soft-white transition-colors">
              <div>
                <h3 className="text-lg font-display font-bold text-mono-black leading-tight">{e.brand}</h3>
                <p className="mt-1 font-body text-sm text-mono-charcoal leading-snug">{e.owner}</p>
                <div className="mt-3">{chip(e.verdict)}</div>
              </div>
              <ArrowUpRight size={18} className="text-mono-gray group-hover:text-mono-amber-strong shrink-0 transition-colors" aria-hidden="true" />
            </Link>
          ))}
        </div>
      )}

      {asked && results.length === 0 && (
        <div className="mt-4 border border-mono-amber bg-mono-soft-white p-6">
          <p className="font-body text-mono-charcoal">
            We don&rsquo;t have <span className="font-display font-bold text-mono-black">&ldquo;{q.trim()}&rdquo;</span> on the desk yet — we add African brands every week, and the ownership answer to every one.
          </p>
          <div className="mt-4">
            <NewsletterSignup variant="default" source="who-owns-checker" />
          </div>
          <p className="mt-4 text-sm font-body text-mono-gray">
            Or browse every brand we&rsquo;ve decoded in <Link href="/who-owns-africa" className="text-mono-amber-strong font-bold hover:text-mono-amber-hover">Who Owns Africa? →</Link>
          </p>
        </div>
      )}

      {!asked && (
        <p className="mt-3 text-sm font-body text-mono-gray">
          Every answer is sourced, with a value-capture verdict — did the ownership stay African, or move abroad?
        </p>
      )}
    </div>
  );
}
