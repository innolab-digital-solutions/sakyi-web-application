import type { MetadataRoute } from 'next';

import { resolveMarketingSiteUrl } from '@/lib/utils/url';

/**
 * Admin and utility pages stay crawlable on purpose: they use a noindex meta tag,
 * which crawlers can only read if robots.txt lets them fetch the page.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: resolveMarketingSiteUrl('/sitemap.xml'),
  };
}
