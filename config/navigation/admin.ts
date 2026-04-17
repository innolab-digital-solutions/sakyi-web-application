import {
  Activity,
  Apple,
  ClipboardCheck,
  Dumbbell,
  FolderKanban,
  LayoutDashboard,
  NotebookPen,
  Scale,
  UserCog,
  Users,
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
    name: 'User Accounts',
    icon: UserCog,
    path: '#',
    subitems: [],
  },
  {
    name: 'Enrollment Operations',
    icon: ClipboardCheck,
    path: '#',
    subitems: [
      {
        name: 'Enrollment Requests',
        path: ADMIN_ROUTES.MODULES.ENROLLMENT_REQUESTS.LIST,
      },
      {
        name: 'Intake Assessments',
        path: ADMIN_ROUTES.MODULES.INTAKE_ASSESSMENTS.LIST,
      },
      {
        name: 'Contracts & E-Signatures',
        path: ADMIN_ROUTES.MODULES.ENROLLMENT_CONTRACTS.LIST,
      },
      {
        name: 'Enrollment Records',
        path: '#',
      },
    ],
  },
  {
    name: 'Client Care',
    icon: Activity,
    path: '#',
    subitems: [
      {
        name: 'Client Profiles',
        path: '#',
      },
      {
        name: 'Care Plans',
        path: '#',
      },
      {
        name: 'Daily Task Logs',
        path: '#',
      },
      {
        name: 'Operational Logs',
        path: '#',
      },
      {
        name: 'Period Reports',
        path: '#',
      },
    ],
  },
  {
    name: 'Care Programs',
    icon: FolderKanban,
    path: ADMIN_ROUTES.MODULES.PROGRAMS.LIST,
    subitems: [],
  },
  {
    name: 'Nutrition Library',
    icon: Apple,
    path: '#',
    subitems: [
      {
        name: 'Food Categories',
        path: ADMIN_ROUTES.MODULES.NUTRITION_CATEGORIES.LIST,
      },
      {
        name: 'Food Items',
        path: ADMIN_ROUTES.MODULES.NUTRITION_ITEMS.LIST,
      },
    ],
  },
  {
    name: 'Movement Library',
    icon: Dumbbell,
    path: '#',
    subitems: [
      {
        name: 'Categories',
        path: ADMIN_ROUTES.MODULES.MOVEMENT_CATEGORIES.LIST,
      },
      {
        name: 'Exercises',
        path: ADMIN_ROUTES.MODULES.MOVEMENT_EXERCISES.LIST,
      },
      {
        name: 'Equipment',
        path: '#',
      },
    ],
  },
  {
    name: 'Content & Education',
    icon: NotebookPen,
    path: '#',
    subitems: [
      {
        name: 'Blog Categories',
        path: ADMIN_ROUTES.MODULES.BLOG_CATEGORIES.LIST,
      },
      {
        name: 'Blog Posts',
        path: ADMIN_ROUTES.MODULES.BLOG_POSTS.LIST,
      },
    ],
  },
  {
    name: 'Measurement Reference',
    icon: Scale,
    path: ADMIN_ROUTES.MODULES.UNITS.LIST,
    subitems: [],
  },
  {
    name: 'Care Teams',
    icon: Users,
    path: '#',
    subitems: [],
  },
] as const;
