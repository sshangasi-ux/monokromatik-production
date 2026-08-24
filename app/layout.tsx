import type { Metadata } from 'next';
import { Space_Grotesk, Inter, Fraunces } from 'next/font/google';
import { GoogleAnalytics } from '@next/third-parties/google';
import { Analytics } from '@vercel/analytics/next';
import RegistrationGate from './components/RegistrationGate';
import SiteFooter from './components/SiteFooter';
import './globals.css';

// Self-host the brand fonts via next/font instead of a CSS @import. This avoids
// the Turbopack/Tailwind-v4 issue where `@import "tailwindcss"` is inlined above
// the Google Fonts @import (illegal @import ordering → dev 500), and removes the
// runtime request to fonts.googleapis.com. The CSS variables below feed the
// --font-display / --font-body / --font-feature theme tokens in globals.css.
const fontDisplay = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display-src',
  display: 'swap',
});
const fontBody = Inter({
  subsets: ['latin'],
  variable: '--font-body-src',
  display: 'swap',
});
// Fraunces — a high-contrast display serif (variable optical size) for feature
// titles and standfirsts. This is the single biggest "editorial-luxury" lever:
// it pairs against the Space Grotesk sans the way BoF/Monocle pair serif+sans.
const fontFeature = Fraunces({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-feature-src',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Monokromatik — The Intelligence Behind African Influence.',
  description: 'A living editorial and intelligence network decoding the brands, campaigns, creators and cultural forces shaping how Africa moves the world.',
  keywords: [
    'African brand intelligence',
    'African creative industry',
    'brand marketing Africa',
    'African campaigns',
    'African diaspora influence',
    'creative commerce Africa',
    'Monokromatik',
  ],
  authors: [{ name: 'Sibu Shangase' }],
  verification: {
    google: 'V25p3DOYTN6kChFRtlU0cL0V4vGdcUcfkKHfJuGJ1qY',
  },
  openGraph: {
    title: 'Monokromatik — The Intelligence Behind African Influence.',
    description: 'Decoding the brands, campaigns, creators and cultural forces shaping how Africa moves the world.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Monokromatik — The Intelligence Behind African Influence.',
    description: 'Decoding the brands, campaigns, creators and cultural forces shaping how Africa moves the world.',
  },
};

// Site-level entity graph: Organization + WebSite, so search and AI engines
// recognise MonoKromatik as a publisher entity (knowledge panel, sitelinks,
// citation). Emitted once, sitewide.
const SITE = 'https://www.monokromatik.com';
const siteJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE}/#organization`,
      name: 'MonoKromatik',
      alternateName: 'MonoKromatik Network',
      url: SITE,
      logo: { '@type': 'ImageObject', url: `${SITE}/favicon.ico` },
      description:
        'A living editorial and intelligence network decoding the brands, campaigns, creators and cultural forces shaping how Africa moves the world.',
      founder: { '@type': 'Person', name: 'Sibu Shangase' },
      knowsAbout: [
        'African brand intelligence',
        'African and diaspora creative economy',
        'Afrobeats and African music business',
        'African sport and sponsorship',
        'African fashion, film and the drinks economy',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE}/#website`,
      name: 'MonoKromatik',
      url: SITE,
      inLanguage: 'en',
      publisher: { '@id': `${SITE}/#organization` },
      description:
        'The intelligence behind African influence — authored analysis, a breaking-news Wire, and the Cultural-Signal Index.',
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${fontDisplay.variable} ${fontBody.variable} ${fontFeature.variable}`}
    >
      <body className="min-h-full flex flex-col">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }} />
        {/* Primary landmark so all page content sits inside a <main> (a11y: axe
            "region"). Each page renders its own fixed <nav> inside; utility
            components below stay as siblings. */}
        <main id="main-content" className="flex-1 flex flex-col">{children}</main>
        <SiteFooter />
        <RegistrationGate />
        <GoogleAnalytics gaId="G-9F5R5FM8NS" />
        {/* Vercel Web Analytics — first-party, cookie-free, route-level.
            Complements GA4; powers the Vercel dashboard Analytics tab.
            Requires Web Analytics enabled for the project in Vercel. */}
        <Analytics />
      </body>
    </html>
  );
}
