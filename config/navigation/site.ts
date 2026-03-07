import PATHS from '@/config/paths';

import type { NavItem } from './types';

/**
 * HEADER_NAVIGATION defines the primary navigation structure
 * for unauthenticated (public-facing) users, typically rendered in the site header.
 *
 * Each item conforms to the NavItem interface:
 *  - name: Display label for the navigation link
 *  - path: Navigation route (use '#' as a placeholder for unimplemented routes)
 *  - icon: Not typically used for top-level public navigation
 *  - subitems: Not used at this level
 *
 * Guidelines for contributors:
 *  - Maintain consistent order: Home > About > Programs > Blog > Contact.
 *  - Use appropriate, user-friendly names and valid path routes; use '#' only as a placeholder.
 *  - Keep this array limited to essential top-level public navigation.
 *  - Do not add admin, client-only, or authentication links here.
 *
 * @see NavItem (config/navigation/types.ts)
 */
export const HEADER_NAVIGATION: NavItem[] = [
  {
    name: 'layout.header.navigation.home.label',
    path: PATHS.SITE.HOME,
  },
  {
    name: 'layout.header.navigation.about.label',
    path: PATHS.SITE.ABOUT,
  },
  {
    name: 'layout.header.navigation.programs.label',
    path: PATHS.SITE.PROGRAMS,
  },
  {
    name: 'layout.header.navigation.blog.label',
    path: PATHS.SITE.BLOG,
  },
  {
    name: 'layout.header.navigation.contact.label',
    path: PATHS.SITE.CONTACT,
  },
];

/**
 * FOOTER_NAVIGATION defines the secondary navigation structure
 * for unauthenticated users, typically rendered in the site footer.
 *
 * Each item conforms to the NavItem interface:
 *  - name: Display label for the navigation link
 *  - path: Actual or placeholder route (use '#' if not implemented)
 *  - icon: Not typically used for footer navigation
 *  - subitems: Not used in the footer
 *
 * Guidelines for contributors:
 *  - Add or update only public-facing site policy/legal/help pages.
 *  - Do not duplicate items from HEADER_NAVIGATION unless necessary for usability.
 *  - Do not include admin, client, or authentication links here.
 *  - Use valid routes from your project constants where possible.
 *
 * @see NavItem (config/navigation/types.ts)
 */
export const FOOTER_NAVIGATION: NavItem[] = [
  {
    name: 'Privacy Policy',
    path: '#',
  },
  {
    name: 'Terms of Service',
    path: '#',
  },
];
