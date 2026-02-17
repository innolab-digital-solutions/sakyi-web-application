'use client';

import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DEFAULT_ICON_CLASSES,
  STAT_CARD_ICONS,
  TREND_STYLE_BY_DIRECTION,
} from './constants';
import type { StatCardProps } from './types';

const StatsCard = ({
  title,
  value,
  subtitle,
  trend,
  iconName,
  iconBgClass = DEFAULT_ICON_CLASSES.iconBgClass,
  iconClass = DEFAULT_ICON_CLASSES.iconClass,
  className,
  ...rest
}: StatCardProps) => {
  const Icon = STAT_CARD_ICONS[iconName];
  const trendStyle = trend ? TREND_STYLE_BY_DIRECTION[trend.direction] : null;

  return (
    <article
      className={cn(
        'border-border bg-card flex items-start gap-4 rounded-lg border p-4 shadow-xs transition-shadow hover:shadow-sm',
        className,
      )}
      {...rest}
    >
      <div
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-lg',
          iconBgClass,
          iconClass,
        )}
      >
        <Icon className="size-5" strokeWidth={1.75} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-muted-foreground text-xs font-medium">{title}</p>
        <p className="text-foreground mt-0.5 text-xl font-semibold tracking-tight tabular-nums">
          {value}
        </p>
        {(trend || subtitle) && (
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            {trend && trendStyle && (
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium',
                  trendStyle,
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
              <span className="text-muted-foreground text-[11px]">
                {subtitle}
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
};

export default StatsCard;
