/**
 * Route paths for the public/site-facing pages.
 *
 * These are **URL paths**, not API endpoints. They should be used when
 * constructing links or redirects for the main website surface.
 *
 * Prefer importing the aggregated `PATHS` object from `config/paths` and
 * accessing `PATHS.SITE.*` rather than importing this file directly.
 */
export const SITE_PATHS = {
  HOME: '/',
  ABOUT: '/about',
  PROGRAMS: '/programs',
  BLOG: '/blog',
  CONTACT: '/contact',
} as const;
