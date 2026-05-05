import type { User } from './types';

/**
 * Laravel-backed role slug for unrestricted platform tooling (Pulse, Telescope, Horizon, etc.).
 * UI gates only — API must enforce authorization.
 */
export const SUPER_ADMIN_ROLE_SLUG = 'super_admin';

function normalizeRoleSlug(role: string): string {
  return role.trim().toLowerCase().replace(/\s+/g, '_');
}

/**
 * @returns Whether the authenticated user should see super-admin navigation (e.g. backend observability links).
 */
export function isSuperAdminUser(user: User | null | undefined): boolean {
  if (!user) {
    return false;
  }

  return normalizeRoleSlug(user.role) === SUPER_ADMIN_ROLE_SLUG;
}
