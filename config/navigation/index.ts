import { ADMIN_NAVIGATION } from './private';
import { FOOTER_NAVIGATION, HEADER_NAVIGATION } from './public';

/**
 * NAVIGATION aggregates the principal navigation structures used throughout the application.
 *
 * Structure:
 *  - ADMIN: Navigation menu for authenticated admin users (sidebar/dashboard).
 *  - SITE:
 *      - HEADER: Main navigation for public-facing users (typically site header).
 *      - FOOTER: Secondary links for public users (typically site footer).
 *
 * This constant centralizes all available navigation schemas for consistent consumption across the app.
 *
 * @see ADMIN_NAVIGATION (config/navigation/private.ts)
 * @see HEADER_NAVIGATION, FOOTER_NAVIGATION (config/navigation/public.ts)
 * @see NavItem (config/navigation/types.ts)
 */
export const NAVIGATION = {
  ADMIN: ADMIN_NAVIGATION,
  SITE: {
    HEADER: HEADER_NAVIGATION,
    FOOTER: FOOTER_NAVIGATION,
  },
} as const;

export { NAVIGATION as default };
export { ADMIN_NAVIGATION } from './private';
export { FOOTER_NAVIGATION, HEADER_NAVIGATION } from './public';
export * from './types';
