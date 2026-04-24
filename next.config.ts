import { withSentryConfig } from '@sentry/nextjs';
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
        protocol: 'http',
        hostname: 'localhost',
      },
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
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  devIndicators: {
    position: 'bottom-left',
  },
};

/**
 * Wraps the Next.js configuration with Sentry monitoring and source map upload.
 *
 * Sentry Options:
 * - org: Sentry organization slug.
 * - project: Sentry project slug.
 * - silent: Suppresses upload logs unless running in CI.
 * - widenClientFileUpload: Uploads more source maps for better stack traces (slower build).
 * - tunnelRoute: Proxies browser Sentry requests through a Next.js rewrite to help avoid ad-blockers.
 * - webpack: Additional Sentry Webpack plugin options.
 *   - automaticVercelMonitors: Auto-instruments Vercel Cron Monitors (not for App Router handlers yet).
 *   - treeshake.removeDebugLogging: Removes Sentry logger statements for smaller bundles.
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
 * @see https://www.npmjs.com/package/@sentry/webpack-plugin#options
 */
export default withSentryConfig(nextConfig, {
  org: 'aung-thu-zaw',
  project: 'javascript-nextjs',
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: '/monitoring',
  webpack: {
    automaticVercelMonitors: true,
    treeshake: {
      removeDebugLogging: true,
    },
  },
});
