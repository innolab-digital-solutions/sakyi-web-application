import {
  BookOpenCheck,
  ClipboardCheck,
  FolderKanban,
  ListChecks,
  Users,
  UserSquare2,
} from 'lucide-react';

import type { StatCardIconMap } from './types';

/** Icon name → Lucide component. Resolve icon in client component from string (Server Component safe). */
export const STAT_CARD_ICONS: StatCardIconMap = {
  UserSquare2,
  Users,
  ClipboardCheck,
  FolderKanban,
  ListChecks,
  BookOpenCheck,
};

/** Trend direction → badge class names (light: theme colors from globals.css, dark: fallback). */
export const TREND_STYLE_BY_DIRECTION = {
  up: 'bg-chart-1/15 text-chart-1 dark:bg-emerald-500/15 dark:text-emerald-400',
  down: 'bg-destructive/15 text-destructive dark:bg-red-500/15 dark:text-red-400',
} as const;

/** Default icon container and icon color when not provided. */
export const DEFAULT_ICON_CLASSES = {
  iconBgClass: 'bg-muted/80',
  iconClass: 'text-muted-foreground',
} as const;
