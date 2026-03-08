import { ADMIN_ROUTES } from './admin';
import { MARKETING_ROUTES } from './marketing';

/**
 * Centralized collection of all application route definitions.
 *
 * Groups together admin and marketing route objects for unified, type-safe route access throughout the codebase.
 *
 * References:
 * - {@link ADMIN_ROUTES} – Admin route definitions
 * - {@link MARKETING_ROUTES} – Marketing route definitions
 *
 * @example
 * import ROUTES from '@/config/routes';
 * ROUTES.ADMIN.MODULES.PROGRAMS.LIST; // "/admin/programs"
 * ROUTES.MARKETING.HOME; // "/"
 */
const ROUTES = {
  ADMIN: ADMIN_ROUTES,
  MARKETING: MARKETING_ROUTES,
} as const;

export { ADMIN_ROUTES, MARKETING_ROUTES, ROUTES };
