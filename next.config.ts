import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Pin Turbopack root to this project so it doesn't accidentally resolve the
  // parent directory's lockfile (which lacks our deps).
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Allow images from RSS sources we ingest
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  // Pretty URLs: /roots renders /category/roots, /arena → /category/arena, etc.
  async rewrites() {
    return [
      { source: '/roots', destination: '/category/roots' },
      { source: '/arena', destination: '/category/arena' },
      { source: '/waves', destination: '/category/waves' },
      { source: '/watch', destination: '/category/watch' },
      { source: '/listen', destination: '/category/listen' },
      { source: '/shop', destination: '/category/shop' },
    ];
  },
};

export default nextConfig;
