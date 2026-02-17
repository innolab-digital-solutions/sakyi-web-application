import type { StatCardIconName } from '@/components/admin/modules/dashboard/StatsCard';

/**
 * Dashboard overview stats aligned with admin navigation and health & wellness program operations.
 * Use for StatsCard grid on the dashboard. Replace values with API data in production.
 */

export type { StatCardIconName };

export interface DashboardStatItem {
  id: string;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: { value: number; direction: 'up' | 'down'; label?: string };
  iconName: StatCardIconName;
  /** Theme-based icon box background (e.g. bg-chart-1/15). From globals.css in light mode. */
  iconBgClass?: string;
  /** Theme-based icon color (e.g. text-chart-1). */
  iconClass?: string;
}

/**
 * Four core metrics for the health and wellness admin dashboard:
 * - Total Clients (audience size)
 * - Active Enrollments (current participation)
 * - Programs (offerings)
 * - Pending Intakes (actionable work)
 */
export const DASHBOARD_STATS: DashboardStatItem[] = [
  {
    id: 'clients',
    title: 'Total Clients',
    value: '1,248',
    trend: { value: 12, direction: 'up', label: 'vs last month' },
    subtitle: 'Registered in platform',
    iconName: 'UserSquare2',
    iconBgClass: 'bg-chart-1/15',
    iconClass: 'text-chart-1',
  },
  {
    id: 'enrollments',
    title: 'Active Enrollments',
    value: 342,
    trend: { value: 5, direction: 'up' },
    subtitle: 'Currently in programs',
    iconName: 'ClipboardCheck',
    iconBgClass: 'bg-chart-2/15',
    iconClass: 'text-chart-2',
  },
  {
    id: 'programs',
    title: 'Programs',
    value: 18,
    subtitle: 'Nutrition & movement',
    iconName: 'FolderKanban',
    iconBgClass: 'bg-chart-3/15',
    iconClass: 'text-chart-3',
  },
  {
    id: 'pending-intakes',
    title: 'Pending Intakes',
    value: 23,
    subtitle: 'Awaiting review',
    iconName: 'ListChecks',
    iconBgClass: 'bg-chart-4/15',
    iconClass: 'text-chart-4',
  },
];
