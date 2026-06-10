'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SearchResult {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
}

export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const searchArticles = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        setResults(data.results || []);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchArticles, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setIsOpen(false);
      setQuery('');
    }
  };

  return (
    <div ref={searchRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-mono-amber/15 rounded-lg transition-colors"
        aria-label="Search"
        aria-expanded={isOpen}
      >
        <Search className="w-5 h-5 text-mono-white" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 bg-mono-black/50 z-40" onClick={() => setIsOpen(false)} />
          <div className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-mono-white rounded-lg shadow-2xl z-50 p-6">
            <form onSubmit={handleSubmit} className="relative mb-4">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search stories and intelligence..."
                className="w-full px-5 py-4 pr-12 bg-mono-soft-white text-mono-black font-body rounded-lg border-2 border-transparent focus:outline-none focus:border-mono-amber transition-colors"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-mono-gray rounded transition-colors"
                >
                  <X className="w-5 h-5 text-mono-charcoal" />
                </button>
              )}
            </form>

            {query.length >= 2 && (
              <div className="max-h-96 overflow-y-auto">
                {isSearching ? (
                  <div className="text-center py-8 text-mono-gray font-body">Searching...</div>
                ) : results.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-mono-gray font-body text-sm mb-4">Found {results.length} {results.length === 1 ? 'article' : 'articles'}</p>
                    {results.map((result) => (
                      <Link
                        key={result.slug}
                        href={`/article/${result.slug}`}
                        onClick={() => {
                          setIsOpen(false);
                          setQuery('');
                        }}
                        className="block p-4 hover:bg-mono-soft-white rounded-lg transition-colors group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="px-2 py-0.5 bg-mono-amber text-mono-white text-xs font-display font-bold rounded uppercase">{result.category}</span>
                            </div>
                            <h4 className="font-display font-bold text-mono-black group-hover:text-mono-amber-strong transition-colors mb-1">{result.title}</h4>
                            <p className="text-mono-charcoal font-body text-sm line-clamp-2">{result.excerpt}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-mono-gray font-body mb-2">No articles found for &quot;{query}&quot;</p>
                    <p className="text-mono-gray font-body text-sm">Try different keywords or browse our categories</p>
                  </div>
                )}
              </div>
            )}

            {query.length < 2 && (
              <div className="text-center py-8 text-mono-gray font-body text-sm">Type at least 2 characters to search</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
