import { ADMIN_PATHS } from './admin';
import { SITE_PATHS } from './site';

/**
 * Aggregated route paths used throughout the application.
 *
 * Structure:
 * - ADMIN: Admin dashboard and modules.
 * - SITE:  Public/site-facing pages (marketing, blog, etc.).
 * - PUBLIC: Alias for SITE paths, kept for backwards compatibility.
 *
 * These are **URL paths**, not API endpoints. Use them when constructing
 * links, redirects, or route comparisons.
 *
 * @example
 *   import PATHS from '@/config/paths';
 *   router.push(PATHS.ADMIN.DASHBOARD);
 */
const PATHS = {
  ADMIN: ADMIN_PATHS,
  SITE: SITE_PATHS,
} as const;

export { PATHS as default };

export { ADMIN_PATHS } from './admin';
export { SITE_PATHS } from './site';
