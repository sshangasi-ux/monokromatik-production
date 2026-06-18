import type { Metadata } from 'next';
import { Space_Grotesk, Inter, Merriweather } from 'next/font/google';
import { GoogleAnalytics } from '@next/third-parties/google';
import './globals.css';

// Self-host the brand fonts via next/font instead of a CSS @import. This avoids
// the Turbopack/Tailwind-v4 issue where `@import "tailwindcss"` is inlined above
// the Google Fonts @import (illegal @import ordering → dev 500), and removes the
// runtime request to fonts.googleapis.com. The CSS variables below feed the
// --font-display / --font-body / --font-quote theme tokens in globals.css.
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
const fontQuote = Merriweather({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-quote-src',
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${fontDisplay.variable} ${fontBody.variable} ${fontQuote.variable}`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <GoogleAnalytics gaId="G-9F5R5FM8NS" />
      </body>
    </html>
  );
}
