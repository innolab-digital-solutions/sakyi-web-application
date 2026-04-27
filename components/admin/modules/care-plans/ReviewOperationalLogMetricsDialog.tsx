'use client';

import { ArrowRightIcon, ClipboardList } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { ReportRunMetricsDiff } from '@/lib/care-plans/diffReportRunMetrics';
import { cn } from '@/lib/utils/styles';

export type ReviewOperationalLogMetricsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  period: { starts_on: string; ends_on: string } | null;
  diff: ReportRunMetricsDiff;
  onContinueToSave: () => void;
};

/**
 * Pre-save review of what changed in operational log metrics (worksheet) vs
 * the last snapshot. Evidence is not part of the save; copy explains that.
 */
export default function ReviewOperationalLogMetricsDialog({
  open,
  onOpenChange,
  period,
  diff,
  onContinueToSave,
}: ReviewOperationalLogMetricsDialogProps) {
  const { metrics, totalFieldChanges, structurallyDifferentLength } = diff;
  const hasDetails = metrics.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'flex max-h-[min(90vh,720px)] max-w-2xl flex-col gap-0 p-0',
        )}
        showCloseButton
      >
        <DialogHeader className='border-border shrink-0 border-b p-5 sm:p-6'>
          <div className='flex items-start gap-3'>
            <div className='bg-primary/10 border-primary/20 text-primary inline-flex size-10 shrink-0 items-center justify-center rounded-md border'>
              <ClipboardList className='size-5' aria-hidden />
            </div>
            <div className='min-w-0 space-y-1.5'>
              <DialogTitle className='text-foreground/90 text-sm font-bold capitalize'>
                Review changes before save
              </DialogTitle>
              <DialogDescription className='text-muted-foreground text-[13px] font-medium'>
                You are about to save{' '}
                <span className='text-foreground font-semibold'>
                  operational log metrics
                </span>{' '}
                (targets, actuals, and daily on-target flags) for this period.{' '}
                <span className='text-foreground font-semibold'>Evidence</span>{' '}
                on the left is read-only context from the care plan and client
                logs; it is{' '}
                <span className='text-foreground font-semibold'>not</span>{' '}
                changed when you save.
              </DialogDescription>
              {period ? (
                <p className='text-primary text-[12px] font-semibold tabular-nums'>
                  Period: {period.starts_on} → {period.ends_on}
                </p>
              ) : null}
            </div>
          </div>
        </DialogHeader>

        <div className='min-h-0 flex-1 overflow-y-auto px-5 py-3 sm:px-6 sm:py-4'>
          {structurallyDifferentLength ? (
            <div
              className='mb-3 rounded-md border border-amber-200/90 bg-amber-50/90 px-3 py-2 text-[12px] font-medium text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100'
              role='status'
            >
              The number of metric rows changed compared to the last snapshot
              (load or save). The server still expects a full metrics list on
              save; confirm this is intentional.
            </div>
          ) : null}

          <p className='text-foreground/90 text-[12px] font-semibold tabular-nums'>
            {totalFieldChanges === 0
              ? 'No field-level changes since this workspace was opened (or your last save).'
              : `${totalFieldChanges} change${totalFieldChanges === 1 ? '' : 's'} across ${metrics.length} metric${metrics.length === 1 ? '' : 's'}.`}
          </p>

          {!hasDetails && totalFieldChanges === 0 ? (
            <p className='text-muted-foreground mt-2 text-[12px] leading-relaxed font-medium'>
              You can still save to confirm the current worksheet on the server,
              or go back to keep editing.
            </p>
          ) : null}

          {hasDetails ? (
            <ul className='mt-3 space-y-3'>
              {metrics.map((m, rowIdx) => (
                <li
                  key={`review-metric-${rowIdx}-${m.metricKey}`}
                  className='border-border rounded-md border bg-white px-3 py-2.5 dark:bg-zinc-950/30'
                >
                  <p className='text-foreground/90 text-[12px] font-bold'>
                    {m.label}
                    <span className='text-muted-foreground ml-1.5 font-mono text-[10px] font-semibold'>
                      {m.metricKey}
                    </span>
                    {m.keyMismatch ? (
                      <span className='ml-1.5 text-[10px] font-semibold text-amber-800 uppercase dark:text-amber-200'>
                        order / key
                      </span>
                    ) : null}
                  </p>
                  <ul className='text-muted-foreground mt-1.5 list-none space-y-1.5 text-[11px] font-medium'>
                    {m.changes.map((ch, i) => (
                      <li
                        key={`${m.metricKey}-${ch.pathLabel}-${i}`}
                        className='flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5'
                      >
                        <span className='text-foreground/90 font-semibold'>
                          {ch.pathLabel}
                        </span>
                        <span
                          className='text-destructive/90 min-w-0 wrap-break-word'
                          title={ch.before}
                        >
                          {ch.before}
                        </span>
                        <span className='text-muted-foreground' aria-hidden>
                          →
                        </span>
                        <span
                          className='text-primary min-w-0 font-semibold wrap-break-word'
                          title={ch.after}
                        >
                          {ch.after}
                        </span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <DialogFooter className='bg-muted/30 border-border shrink-0 gap-2 border-t p-4 sm:justify-end sm:p-5'>
          <Button
            type='button'
            variant='outline'
            className='text-foreground bg-background hover:bg-muted h-10 gap-1.5 rounded-md border-neutral-300 px-3 text-[13px]! font-semibold'
            onClick={() => onOpenChange(false)}
          >
            Keep editing
          </Button>
          <Button
            type='button'
            className='h-10 gap-1.5 text-[13px]! font-semibold'
            onClick={onContinueToSave}
          >
            Continue to save
            <ArrowRightIcon className='size-3.5' aria-hidden />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
