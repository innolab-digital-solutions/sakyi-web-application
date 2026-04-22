import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'staging-api.sakyihealthandwellness.com',
      },
      {
        protocol: 'https',
        hostname: 'api.sakyihealthandwellness.com',
      },
      {
        protocol: 'https',
        hostname: 'api.sakyi.test',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '**',
      },
    ],
  },
  devIndicators: {
    position: 'bottom-left',
  },
};
export default nextConfig;
