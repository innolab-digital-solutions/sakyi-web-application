import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: false,
  images: {
    domains: ['i.pravatar.cc'],
  },
  devIndicators: {
    position: 'bottom-left',
  },
};

export default nextConfig;
