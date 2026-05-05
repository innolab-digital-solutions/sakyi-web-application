import { ADMIN_NAVIGATION } from './admin';
import { HEADER_NAVIGATION } from './marketing';

/**
 * Centralized navigation configuration for the application.
 *
 * Groups together admin and marketing navigation objects for unified, type-safe navigation access throughout the codebase.
 *
 * References:
 * - {@link ADMIN_NAVIGATION} - Admin navigation items rendered in-cluster (super-admin-only backend links are appended in `DashboardSidebar` when applicable)
 * - {@link HEADER_NAVIGATION} - Marketing header navigation objects
 *
 * @example
 * import NAVIGATION from '@/config/navigation';
 *
 * NAVIGATION.ADMIN; // All admin navigation items
 * NAVIGATION.MARKETING.HEADER; // All marketing header navigation items
 *
 */
const NAVIGATION = {
  ADMIN: ADMIN_NAVIGATION,
  MARKETING: {
    HEADER: HEADER_NAVIGATION,
  },
} as const;

export { ADMIN_NAVIGATION, HEADER_NAVIGATION, NAVIGATION };
