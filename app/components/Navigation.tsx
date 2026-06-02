'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import SearchBar from './SearchBar';

const navLinks = [
  { href: '/pulse', label: 'LATEST', description: 'Current Stories & Signals' },
  { href: '/signal', label: 'SIGNAL', description: 'Brand & Campaign Intelligence' },
  { href: '/roots', label: 'ROOTS', description: 'Culture, Identity & Design' },
  { href: '/arena', label: 'ARENA', description: 'Sport, Fans & Commerce' },
  { href: '/waves', label: 'WAVES', description: 'Music, Film & Creators' },
  { href: '/watch', label: 'WATCH', description: 'Video Stories' },
  { href: '/listen', label: 'LISTEN', description: 'Audio & Conversations' },
  { href: '/intelligence', label: 'INTELLIGENCE', description: 'Research & Reports' },
];

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-mono-black/95 backdrop-blur-md shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="font-display text-2xl font-bold tracking-tight group">
              <span className="text-mono-white">MONO</span>
              <span className="text-mono-amber">KROMATIK</span>
              <span className="ml-2 text-xs text-mono-gray font-body font-normal">NETWORK</span>
            </Link>

            <div className="hidden xl:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 font-display text-xs font-medium tracking-wide text-mono-white transition-all hover:bg-mono-amber hover:text-mono-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="hidden xl:flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-mono-amber/10 rounded-full border border-mono-amber/20">
                <div className="w-2 h-2 bg-mono-amber rounded-full animate-pulse-slow" />
                <span className="text-xs font-body text-mono-white">AI-assisted. Human-directed.</span>
              </div>
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
          <div className="xl:hidden bg-mono-black border-t border-mono-gray/20">
            <div className="px-4 py-6 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block py-3 px-4 text-mono-white font-display font-medium text-lg hover:bg-mono-amber transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                  <span className="block text-xs text-mono-gray font-body font-normal mt-1">{link.description}</span>
                </Link>
              ))}
              <div className="pt-4 mt-4 border-t border-mono-gray/20 px-4 text-sm font-body text-mono-white">
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
