import type { Metadata } from 'next';
import { GoogleAnalytics } from '@next/third-parties/google';
import './globals.css';

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
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {children}
        <GoogleAnalytics gaId="G-9F5R5FM8NS" />
      </body>
    </html>
  );
}
