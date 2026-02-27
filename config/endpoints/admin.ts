/**
 * API endpoints used by the admin dashboard and related backend modules.
 *
 * These paths are **relative** to the API base configured in `lib/api/client`
 * and are intended to be consumed via the shared HTTP client (`http` / `client`).
 */
export const ADMIN_ENDPOINTS = {
  AUTH: {
    LOGIN: '/web/admin/auth/login',
    LOGOUT: '/web/admin/auth/logout',
    ME: '/web/admin/auth/me',
  },
} as const;
