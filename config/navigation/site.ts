import PATHS from '@/config/paths';

import type { NavItem } from './types';

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
