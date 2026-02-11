import { LayoutDashboard, Users, Package } from 'lucide-react';
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
    name: 'Users',
    icon: Users,
    path: '#',
    subitems: [],
  },
  {
    name: 'Products',
    icon: Package,
    path: '#',
    subitems: [],
  },
] as const;
