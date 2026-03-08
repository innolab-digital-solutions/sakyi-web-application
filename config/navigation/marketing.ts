import { MARKETING_ROUTES } from '@/config/routes/marketing';

import type { NavItem } from './types';

/**
 * Header navigation configuration for the Marketing Site.
 *
 * Each object represents a primary navigation item, including its display name and target route.
 *
 * Important:
 * - `name` is a localization dictionary key (not plain text) and must exist in the relevant `layout.json` dictionary file.
 * - `path` must reference a value from {@link MARKETING_ROUTES} to ensure route consistency and type safety across the application.
 *
 * @see lib/localization/dictionaries/en/layout.json - English localization dictionary
 * @see lib/localization/dictionaries/my/layout.json - Myanmar localization dictionary
 * @see NavItem - Type definition for navigation items
 * @see MARKETING_ROUTES - Centralized marketing route definitions
 *
 * @example
 * import { HEADER_NAVIGATION } from '@/config/navigation/marketing';
 *
 * HEADER_NAVIGATION.map(item => (
 *   <Link href={item.path}>{translate(item.name)}</Link>
 * ))
 */
export const HEADER_NAVIGATION: NavItem[] = [
  {
    name: 'layout.header.navigation.home.label',
    path: MARKETING_ROUTES.HOME,
  },
  {
    name: 'layout.header.navigation.about.label',
    path: MARKETING_ROUTES.ABOUT,
  },
  {
    name: 'layout.header.navigation.programs.label',
    path: MARKETING_ROUTES.PROGRAMS,
  },
  {
    name: 'layout.header.navigation.blog.label',
    path: MARKETING_ROUTES.BLOG,
  },
  {
    name: 'layout.header.navigation.contact.label',
    path: MARKETING_ROUTES.CONTACT,
  },
];
