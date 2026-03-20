import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: false,
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
        hostname: 'via.placeholder.com',
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
