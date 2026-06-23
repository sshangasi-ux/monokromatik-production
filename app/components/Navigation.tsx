'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import SearchBar from './SearchBar';

const primaryLinks = [
  { href: '/signal', label: 'SIGNAL', description: 'Ideas, work and brand consequence', priority: true },
  { href: '/intelligence', label: 'INTELLIGENCE', description: 'Case studies, reports and research', priority: true },
  { href: '/ask', label: 'ASK', description: 'Cited answers from the corpus', priority: true },
  { href: '/issues', label: 'ISSUES', description: 'Curated digital magazine editions' },
  { href: '/conversations', label: 'CONVERSATIONS', description: 'Leaders, creators and operators' },
  { href: '/culture', label: 'CULTURE', description: 'Roots, Arena and Waves' },
  { href: '/about', label: 'ABOUT', description: 'Mission and methodology' },
];

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileMenuOpen(false);
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isMobileMenuOpen]);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-mono-black/95 backdrop-blur-md border-b border-mono-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="font-display text-2xl font-bold tracking-tight group shrink-0">
              <span className="text-mono-white">MONO</span>
              <span className="text-mono-amber">KROMATIK</span>
              <span className="ml-2 text-xs text-mono-gray font-body font-normal">NETWORK</span>
            </Link>

            <div className="hidden xl:flex items-center space-x-1 ml-8">
              {primaryLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? 'page' : undefined}
                    className={`relative px-3 py-3 font-display text-xs font-bold tracking-[0.13em] transition-all ${
                      link.priority
                        ? 'text-mono-amber hover:bg-mono-amber hover:text-mono-black'
                        : 'text-mono-white hover:bg-mono-white/10'
                    } ${
                      active
                        ? 'after:absolute after:left-3 after:right-3 after:bottom-1.5 after:h-0.5 after:bg-mono-amber'
                        : ''
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="hidden xl:flex items-center space-x-4 ml-4">
              <Link href="/intelligence/source-desk" className="px-3 py-2 border border-mono-amber-strong/50 text-mono-amber-strong text-[10px] tracking-[0.18em] font-display font-bold hover:bg-mono-amber-strong hover:text-mono-black transition-colors">
                SOURCE DESK
              </Link>
              <SearchBar />
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden p-2 rounded-md text-mono-white"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="xl:hidden bg-mono-black border-t border-mono-white/10">
            <div className="px-4 py-5 space-y-2">
              {primaryLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? 'page' : undefined}
                    className={`block py-3 px-4 font-display font-bold text-lg transition-colors ${active ? 'border-l-4 border-mono-amber pl-3' : ''} ${link.priority ? 'text-mono-amber hover:bg-mono-amber hover:text-mono-black' : 'text-mono-white hover:bg-mono-white/10'}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                    <span className="block text-xs text-mono-gray font-body font-normal mt-1">{link.description}</span>
                  </Link>
                );
              })}
              <Link
                href="/intelligence/source-desk"
                className="block mt-4 py-3 px-4 border border-mono-amber/50 text-mono-amber font-display font-bold"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                SOURCE DESK
                <span className="block text-xs text-mono-gray font-body font-normal mt-1">Sources, verification and research method</span>
              </Link>
              <div className="pt-4 mt-4 border-t border-mono-white/10 px-4 text-sm font-body text-mono-white">
                AI-assisted discovery. Human-directed intelligence. Verified sourcing.
              </div>
            </div>
          </div>
        )}
      </nav>
      <div className="h-20 bg-mono-black" />
    </>
  );
}
