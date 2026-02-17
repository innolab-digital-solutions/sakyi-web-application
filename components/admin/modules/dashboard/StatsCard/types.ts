import type { LucideIcon } from 'lucide-react';

/** Trend badge for stat cards: value, direction, optional label. */
export interface TrendBadge {
  value: number;
  direction: 'up' | 'down';
  label?: string;
}

/** Icon name keys supported by StatsCard. Pass as string so Server Components can use the component. */
export type StatCardIconName =
  | 'UserSquare2'
  | 'Users'
  | 'ClipboardCheck'
  | 'FolderKanban'
  | 'ListChecks'
  | 'BookOpenCheck';

/** Map of icon name to Lucide component. Used to resolve icon from string in client component. */
export type StatCardIconMap = Record<StatCardIconName, LucideIcon>;

/** Base content props shared by stat card. */
export interface StatsCardContent {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: TrendBadge;
}

/** Optional styling props for icon and container. */
export interface StatsCardStyle {
  iconBgClass?: string;
  iconClass?: string;
}

/** Own props for StatsCard (content + style + icon). */
export interface StatsCardOwnProps extends StatsCardContent, StatsCardStyle {
  iconName: StatCardIconName;
}

/** Full props: own props + spreadable article attributes (e.g. className). */
export type StatCardProps = StatsCardOwnProps &
  Omit<React.ComponentPropsWithoutRef<'article'>, keyof StatsCardOwnProps>;
