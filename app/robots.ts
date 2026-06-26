import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        // Allow the public data feed + AI guide explicitly (more specific than the
        // /api/ block) so the Index is crawlable and citable; keep the rest closed.
        allow: ['/', '/api/index', '/llms.txt'],
        disallow: ['/api/', '/_next/', '/admin/'],
      },
    ],
    sitemap: 'https://www.monokromatik.com/sitemap.xml',
    host: 'https://www.monokromatik.com',
  };
}
