import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  i18n: {
    locales: ['en', 'my'],
    defaultLocale: 'en',
  },
  devIndicators: false,
};

export default nextConfig;
