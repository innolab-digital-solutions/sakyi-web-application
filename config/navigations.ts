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
import { NavItem } from '@/types/common';

export const DASHBOARD_NAVIGATION: NavItem[] = [
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
