'use client';

import { BarChart3 } from 'lucide-react';

import { cn } from '@/lib/utils/styles';

type OverviewChartEmptyStateProps = {
  /** Primary line explaining why the chart is empty. */
  title: string;
  /** Optional supporting line for context (keeps copy chart-specific without changing layout). */
  description?: string;
  /** Matches the chart container height so cards stay visually aligned (`h-72` vs `h-80`). */
  variant?: 'default' | 'tall';
  className?: string;
};

/**
 * Shared empty placeholder for dashboard overview charts so every card uses the same
 * structure when there is nothing meaningful to plot (no series or all-zero values).
 */
export function OverviewChartEmptyState({
  title,
  description,
  variant = 'default',
  className,
}: OverviewChartEmptyStateProps) {
  return (
    <div
      className={cn(
        'border-border/70 bg-muted/20 flex w-full flex-col items-center justify-center rounded-md border border-dashed px-5 py-10 text-center',
        variant === 'tall' ? 'min-h-80' : 'min-h-72',
        className,
      )}
      role='status'
      aria-live='polite'
    >
      <div className='border-border bg-background mb-3 flex size-11 items-center justify-center rounded-md border shadow-xs'>
        <BarChart3 className='text-muted-foreground size-5.5' aria-hidden />
      </div>
      <p className='text-foreground text-sm font-semibold tracking-tight'>
        {title}
      </p>
      {description ? (
        <p className='text-muted-foreground mt-1 max-w-76 text-xs leading-relaxed font-medium'>
          {description}
        </p>
      ) : null}
    </div>
  );
}
