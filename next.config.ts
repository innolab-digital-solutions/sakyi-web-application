import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'http',
        hostname: 'api.sakyi.test',
      },
    ],
  },
  devIndicators: {
    position: 'bottom-left',
  },
};

export default nextConfig;
