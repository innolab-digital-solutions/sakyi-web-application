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
import { PATHS } from '@/config/paths';
import type { NavItem } from './types';

/**
 * ADMIN_NAVIGATION defines the sidebar navigation structure
 * for authenticated admin users (dashboard/control panel).
 *
 * Each item conforms to the NavItem interface:
 *  - name: Display label for the navigation link
 *  - icon: Lucide icon component used for visualization
 *  - path: Navigation route (use '#' as a placeholder for unimplemented routes)
 *  - subitems: Optional dropdown/secondary links (empty array if no children)
 *
 * Guidelines for contributors:
 *  - Maintain consistent naming and ordering for clarity.
 *  - Use specific PATHS.ADMIN entries for real routes; use '#' as a placeholder only until the route is implemented.
 *  - If adding complex nested navigation, define proper subitems.
 *  - Icons should be chosen for semantic alignment with the navigation item.
 *  - Do not expose client-only or non-admin routes here.
 *
 * @see NavItem (config/navigation/types.ts)
 */
export const ADMIN_NAVIGATION: NavItem[] = [
  {
    name: 'Dashboard',
    icon: LayoutDashboard,
    path: PATHS.ADMIN.DASHBOARD,
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
    path: '#',
    subitems: [],
  },
  {
    name: 'Clients',
    icon: UserSquare2,
    path: PATHS.ADMIN.CLIENTS,
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
    path: '#',
    subitems: [],
  },
  {
    name: 'Measurement Units',
    icon: Scale,
    path: '#',
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
