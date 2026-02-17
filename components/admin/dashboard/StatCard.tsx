'use client';

import {
  ClipboardCheck,
  FolderKanban,
  ListChecks,
  TrendingDown,
  TrendingUp,
  UserSquare2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const DASHBOARD_TEAL = '#0c96c4';

/** Icon names supported by StatCard. Pass as string so Server Components can use StatCard. */
export const STAT_CARD_ICONS = {
  UserSquare2,
  ClipboardCheck,
  FolderKanban,
  ListChecks,
} as const;

export type StatCardIconName = keyof typeof STAT_CARD_ICONS;

interface TrendBadge {
  value: number;
  direction: 'up' | 'down';
  label?: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: TrendBadge;
  iconName: StatCardIconName;
  iconBgClass?: string;
  iconClass?: string;
  /** Accent bar (left edge). Defaults to teal. */
  accentClass?: string;
  /** Card background. Use for tinted cards, e.g. "bg-[#0c96c4]/5". */
  cardBgClass?: string;
  className?: string;
}

/**
 * Compact dashboard stat card: icon + title row, value, then trend/subtitle.
 * Optional tinted background; subtle hover. Smaller padding and typography.
 */
export function StatCard({
  title,
  value,
  subtitle,
  trend,
  iconName,
  iconBgClass = 'bg-[#0c96c4]/10',
  iconClass = 'text-[#0c96c4]',
  accentClass = 'bg-[#0c96c4]',
  cardBgClass,
  className,
}: StatCardProps) {
  const Icon = STAT_CARD_ICONS[iconName];
  return (
    <article
      className={cn(
        'group border-border/60 hover:border-border relative overflow-hidden rounded-lg border shadow-sm transition-all duration-200 hover:shadow-md',
        cardBgClass ?? 'bg-card',
        className,
      )}
    >
      <span
        className={cn('absolute top-0 left-0 h-full w-0.5', accentClass)}
        aria-hidden
      />

      <div className="flex flex-col gap-2 p-3 pl-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-muted-foreground truncate text-xs font-medium">
            {title}
          </p>
          <div
            className={cn(
              'flex size-8 shrink-0 items-center justify-center rounded-md',
              iconBgClass,
              iconClass,
            )}
          >
            <Icon className="size-4" strokeWidth={2} />
          </div>
        </div>

        <p className="text-foreground text-xl font-bold tracking-tight">
          {value}
        </p>

        <div className="flex min-h-5 flex-wrap items-center gap-1.5">
          {trend && (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-semibold',
                trend.direction === 'up'
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                  : 'bg-red-500/15 text-red-700 dark:text-red-400',
              )}
            >
              {trend.direction === 'up' ? (
                <TrendingUp className="size-3" />
              ) : (
                <TrendingDown className="size-3" />
              )}
              {trend.direction === 'up' ? '+' : ''}
              {trend.value}%{trend.label ? ` ${trend.label}` : ''}
            </span>
          )}
          {subtitle && (
            <p className="text-muted-foreground text-[11px] leading-tight">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
