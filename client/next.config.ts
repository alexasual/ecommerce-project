import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Suppress hydration warnings
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  images: {
    domains: ["picsum.photos"],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://app:4000/:path*',
      },
    ]
  }
};

export default nextConfig;
