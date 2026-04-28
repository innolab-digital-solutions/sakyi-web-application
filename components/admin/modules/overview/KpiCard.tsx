'use client';

import * as React from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils/styles';

type KpiTone =
  | 'blue'
  | 'indigo'
  | 'cyan'
  | 'amber'
  | 'violet'
  | 'emerald'
  | 'sky'
  | 'rose';

const TONE_ICON_STYLES: Record<KpiTone, string> = {
  blue: 'bg-blue-50 text-blue-700',
  indigo: 'bg-indigo-50 text-indigo-700',
  cyan: 'bg-cyan-50 text-cyan-700',
  amber: 'bg-amber-50 text-amber-700',
  violet: 'bg-violet-50 text-violet-700',
  emerald: 'bg-emerald-50 text-emerald-700',
  sky: 'bg-sky-50 text-sky-700',
  rose: 'bg-rose-50 text-rose-700',
};

export function KpiCard({
  title,
  value,
  icon: Icon,
  description,
  tone = 'blue',
}: {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  tone?: KpiTone;
}) {
  return (
    <div className='group rounded-md border border-border bg-white p-4 transition-shadow hover:shadow-sm'>
      <div className='mb-2 flex items-start justify-between gap-3'>
        <p className='text-muted-foreground line-clamp-1 text-[10px] font-semibold tracking-wider uppercase'>
          {title}
        </p>
        <span
          className={cn(
            'inline-flex size-7 shrink-0 items-center justify-center rounded-md',
            TONE_ICON_STYLES[tone],
          )}
        >
          <Icon className='size-3.5' />
        </span>
      </div>

      <p className='text-foreground/90 text-[24px] leading-none font-semibold tracking-tight'>
        {value}
      </p>

      {description ? (
        <p className='text-muted-foreground mt-1.5 line-clamp-2 text-[11px] font-medium'>
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function KpiCardSkeleton() {
  return (
    <div className='rounded-md border border-border bg-white p-4'>
      <div className='mb-2 flex items-center justify-between gap-3'>
        <Skeleton className='h-3 w-28 rounded-sm' />
        <Skeleton className='size-7 rounded-md' />
      </div>
      <Skeleton className='h-7 w-16' />
      <Skeleton className='mt-2 h-3 w-24 rounded-sm' />
    </div>
  );
}
