/**
 * Centralized route paths for public marketing-facing pages.
 *
 * These objects contain all marketing-facing route definitions, grouped thematically.
 * Grouping routes this way ensures maintainability and clarity as the application expands and accommodates future pages.
 *
 * @example
 * import { MARKETING_ROUTES } from '@/config/routes/marketing';
 * MARKETING_ROUTES.PROGRAMS; // "/programs"
 */
export const MARKETING_ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  PROGRAMS: '/programs',
  BLOG: '/blog',
  CONTACT: '/contact',
  PRIVACY_POLICY: '/privacy-policy',
  TERMS_OF_SERVICE: '/terms-of-service',
} as const;
