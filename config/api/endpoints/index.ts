import { ADMIN_ENDPOINTS } from './admin';
import { LOOKUP_ENDPOINTS } from './lookup';
import { MARKETING_ENDPOINTS } from './marketing';

/**
 * Centralized collection of all API endpoint definitions.
 *
 * Groups together admin, lookup, and marketing endpoint objects for unified, type-safe API access throughout the codebase.
 *
 * References:
 * - {@link ADMIN_ENDPOINTS} – Admin API endpoint definitions
 * - {@link LOOKUP_ENDPOINTS} – Lookup API endpoint definitions
 * - {@link MARKETING_ENDPOINTS} – Marketing API endpoint definitions
 *
 * @example
 * import ENDPOINTS from '@/config/api/endpoints';
 *
 * ENDPOINTS.ADMIN.AUTH.LOGIN; // "/web/admin/auth/login"
 * ENDPOINTS.MARKETING.PROGRAMS; // "/web/marketing/programs"
 * ENDPOINTS.LOOKUP.GOALS; // "/lookup/goals"
 */
const ENDPOINTS = {
  ADMIN: ADMIN_ENDPOINTS,
  LOOKUP: LOOKUP_ENDPOINTS,
  MARKETING: MARKETING_ENDPOINTS,
} as const;

export { ADMIN_ENDPOINTS, ENDPOINTS, LOOKUP_ENDPOINTS, MARKETING_ENDPOINTS };
