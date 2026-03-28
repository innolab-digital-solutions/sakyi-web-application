import {
  Activity,
  Apple,
  BookOpenCheck,
  ClipboardCheck,
  Dumbbell,
  FolderKanban,
  LayoutDashboard,
  ListChecks,
  Scale,
  UserCog,
  Users,
  UserSquare2,
} from 'lucide-react';

import { ADMIN_ROUTES } from '@/config/routes/admin';

import type { NavItem } from './types';

/**
 * Sidebar navigation configuration for the Admin Dashboard.
 *
 * Each object represents a primary navigation item, including its display name, icon,
 * target route, and any associated subitems (for dropdown or nested nav items).
 *
 * Important:
 * - `path` must reference a value from {@link ADMIN_ROUTES} to ensure route consistency and type safety across the application.
 *
 * @see NavItem - Type definition for navigation items
 * @see ADMIN_ROUTES - Centralized admin route definitions
 *
 * @example
 * import { ADMIN_NAVIGATION } from '@/config/navigation/admin';
 */
export const ADMIN_NAVIGATION: NavItem[] = [
  {
    name: 'Overview',
    icon: LayoutDashboard,
    path: ADMIN_ROUTES.MODULES.OVERVIEW,
    subitems: [],
  },
  {
    name: 'Accounts',
    icon: UserCog,
    path: '#',
    subitems: [],
  },
  {
    name: 'Teams',
    icon: Users,
    path: '#',
    subitems: [],
  },
  {
    name: 'Programs',
    icon: FolderKanban,
    path: ADMIN_ROUTES.MODULES.PROGRAMS.LIST,
    subitems: [],
  },
  {
    name: 'Clients',
    icon: UserSquare2,
    path: '#',
    subitems: [],
  },
  {
    name: 'Enrollments',
    icon: ClipboardCheck,
    path: '#',
    subitems: [],
  },
  {
    name: 'Doctor Instructions',
    icon: BookOpenCheck,
    path: '#',
    subitems: [],
  },
  {
    name: 'Client Logs',
    icon: Activity,
    path: '#',
    subitems: [],
  },
  {
    name: 'Intakes',
    icon: ListChecks,
    path: ADMIN_ROUTES.MODULES.ONBOARDING.INTAKES.LIST,
    subitems: [],
  },
  {
    name: 'Measurement Units',
    icon: Scale,
    path: ADMIN_ROUTES.MODULES.UNITS.LIST,
    subitems: [],
  },
  {
    name: 'Nutrition Library',
    icon: Apple,
    path: '#',
    subitems: [
      { name: 'Categories', path: '#' },
      { name: 'Items', path: '#' },
    ],
  },
  {
    name: 'Movement Library',
    icon: Dumbbell,
    path: '#',
    subitems: [
      { name: 'Categories', path: '#' },
      { name: 'Exercises', path: '#' },
    ],
  },
] as const;
