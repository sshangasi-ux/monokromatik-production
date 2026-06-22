'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Search, X } from 'lucide-react';
import type { CaseStudy } from '../../../lib/case-studies';
import { workSignal } from '../../../lib/signal-index';
import SignalScore from '../../components/SignalScore';

const ALL = 'All';

// Interactive case-study library: filter the published cases by collection and
// verification level, plus a free-text search over title/brand/standfirst/tags.
// All client-side over the already-loaded set — no fetch, no router churn. This
// is the "interrogate, don't browse" index the page used to only gesture at.
export default function CaseStudyLibrary({ studies }: { studies: CaseStudy[] }) {
  const [collection, setCollection] = useState<string>(ALL);
  const [verification, setVerification] = useState<string>(ALL);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'recent' | 'score'>('recent');

  const collections = useMemo(
    () => [ALL, ...Array.from(new Set(studies.map((s) => s.collection)))],
    [studies]
  );
  const verifications = useMemo(
    () => [ALL, ...Array.from(new Set(studies.map((s) => s.verification)))],
    [studies]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return studies.filter((s) => {
      if (collection !== ALL && s.collection !== collection) return false;
      if (verification !== ALL && s.verification !== verification) return false;
      if (!q) return true;
      const haystack = [s.title, s.brand, s.standfirst, s.market, ...(s.tags ?? [])]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [studies, collection, verification, query]);

  const visible = useMemo(() => {
    if (sort !== 'score') return filtered;
    return [...filtered].sort((a, b) => (workSignal(b)?.score ?? -1) - (workSignal(a)?.score ?? -1));
  }, [filtered, sort]);

  const hasActiveFilter = collection !== ALL || verification !== ALL || query.trim() !== '';

  const clear = () => {
    setCollection(ALL);
    setVerification(ALL);
    setQuery('');
  };

  return (
    <div>
      {/* Controls */}
      <div className="mb-10 space-y-6">
        <div className="relative max-w-md">
          <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-mono-gray" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search cases — brand, market, tag…"
            aria-label="Search case studies"
            className="w-full bg-mono-white border border-mono-gray/30 py-3 pl-11 pr-4 font-body text-mono-black placeholder:text-mono-gray focus:border-mono-amber focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
          <FilterRow label="Collection" options={collections} active={collection} onSelect={setCollection} />
          <FilterRow label="Confidence" options={verifications} active={verification} onSelect={setVerification} />
          <FilterRow
            label="Sort"
            options={['Recent', 'Top signal']}
            active={sort === 'score' ? 'Top signal' : 'Recent'}
            onSelect={(v) => setSort(v === 'Top signal' ? 'score' : 'recent')}
          />
        </div>
      </div>

      {/* Result count + clear */}
      <div className="flex items-center justify-between mb-6 text-[11px] tracking-[0.16em] font-display font-bold text-mono-gray">
        <span>
          {visible.length} {visible.length === 1 ? 'CASE' : 'CASES'}
          {hasActiveFilter ? ` OF ${studies.length}` : ''}
        </span>
        {hasActiveFilter && (
          <button onClick={clear} className="inline-flex items-center gap-1.5 text-mono-amber-strong hover:text-mono-amber-hover">
            <X size={13} /> CLEAR FILTERS
          </button>
        )}
      </div>

      {/* Grid */}
      {visible.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-5">
          {visible.map((study) => {
            const sig = workSignal(study);
            return (
            <Link
              key={study.slug}
              href={`/intelligence/case-studies/${study.slug}`}
              className="group flex flex-col bg-mono-white border border-mono-gray/25 p-7 md:p-8 hover:border-mono-amber transition-colors"
            >
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <span className="text-[10px] tracking-[0.2em] px-3 py-1.5 bg-mono-black text-mono-white font-display font-bold">
                  {study.collection.toUpperCase()}
                </span>
                <span className="text-[10px] tracking-[0.2em] font-display font-bold text-mono-amber-strong">
                  {study.verification.toUpperCase()}
                </span>
                {sig && <SignalScore score={sig.score} className="ml-auto" />}
              </div>
              <h3 className="text-2xl md:text-3xl font-display font-bold text-mono-black leading-tight group-hover:text-mono-amber transition-colors">
                {study.title}
              </h3>
              <p className="mt-4 font-body text-mono-charcoal leading-relaxed line-clamp-3">{study.standfirst}</p>
              <div className="mt-auto pt-6 flex items-center justify-between text-[11px] tracking-[0.16em] font-display font-bold text-mono-gray">
                <span>{study.market}</span>
                <span className="inline-flex items-center gap-2 text-mono-amber-strong group-hover:text-mono-amber-hover">
                  READ THE DECODE <ArrowRight size={15} />
                </span>
              </div>
            </Link>
            );
          })}
        </div>
      ) : (
        <div className="border border-dashed border-mono-gray/40 p-12 text-center">
          <p className="font-display font-bold text-xl text-mono-black">No cases match those filters.</p>
          <p className="mt-3 font-body text-mono-charcoal">Try a broader collection or clear the search.</p>
          <button
            onClick={clear}
            className="mt-6 inline-flex items-center gap-2 bg-mono-black text-mono-white px-6 py-3 font-display font-bold"
          >
            <X size={15} /> CLEAR FILTERS
          </button>
        </div>
      )}
    </div>
  );
}

function FilterRow({
  label,
  options,
  active,
  onSelect,
}: {
  label: string;
  options: string[];
  active: string;
  onSelect: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[10px] tracking-[0.24em] font-display font-bold text-mono-gray mr-1">{label.toUpperCase()}</span>
      {options.map((opt) => {
        const on = active === opt;
        return (
          <button
            key={opt}
            onClick={() => onSelect(opt)}
            aria-pressed={on}
            className={`text-[10px] tracking-[0.16em] px-3 py-2 font-display font-bold border transition-colors ${
              on
                ? 'bg-mono-amber text-mono-black border-mono-amber'
                : 'bg-mono-white text-mono-charcoal border-mono-gray/30 hover:border-mono-amber'
            }`}
          >
            {opt.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
