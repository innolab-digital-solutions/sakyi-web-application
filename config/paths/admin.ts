/**
 * Route paths for the admin area.
 *
 * These are **URL paths**, not API endpoints. They are typically used with
 * Next.js `Link` components or router navigation APIs.
 *
 * Prefer importing the aggregated `PATHS` object from `config/paths` and
 * accessing `PATHS.ADMIN.*` rather than importing this file directly.
 */
export const ADMIN_PATHS = {
  DASHBOARD: '/admin/dashboard',
  CLIENTS: '/admin/clients',
  LOGIN: '/admin/login',
  LOGOUT: '/admin/logout',
  ME: '/admin/me',
} as const;
