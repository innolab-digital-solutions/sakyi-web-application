/**
 * API endpoints used by the admin dashboard and related backend modules.
 *
 * These paths are **relative** to the API base configured in `lib/api/client`
 * and are intended to be consumed via the shared HTTP client (`http` / `client`).
 */
export const ADMIN_ENDPOINTS = {
  AUTH: {
    LOGIN: '/admin/auth/login',
    LOGOUT: '/admin/auth/logout',
    ME: '/admin/auth/me',
  },
} as const;
