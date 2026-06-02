import type { Metadata } from 'next';
import { GoogleAnalytics } from '@next/third-parties/google';
import './globals.css';

export const metadata: Metadata = {
  title: 'Monokromatik — African Culture. Global Influence. Brand Intelligence.',
  description: 'An editorial and intelligence network decoding the campaigns, creators, athletes, brands and cultural movements shaping Africa and its diaspora.',
  keywords: [
    'African brand intelligence',
    'African culture',
    'brand marketing Africa',
    'African campaigns',
    'African diaspora',
    'sports commerce Africa',
    'Monokromatik',
  ],
  authors: [{ name: 'Sibu Shangase' }],
  verification: {
    google: 'V25p3DOYTN6kChFRtlU0cL0V4vGdcUcfkKHfJuGJ1qY',
  },
  openGraph: {
    title: 'Monokromatik — African Culture. Global Influence. Brand Intelligence.',
    description: 'Decoding the campaigns, brands and cultural movements shaping Africa and its diaspora.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Monokromatik — African Culture. Global Influence. Brand Intelligence.',
    description: 'Decoding the campaigns, brands and cultural movements shaping Africa and its diaspora.',
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
