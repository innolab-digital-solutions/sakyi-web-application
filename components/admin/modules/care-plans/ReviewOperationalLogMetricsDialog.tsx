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
import { getCarePlanSectionTab } from '@/lib/care-plans/carePlanSectionTabs';
import type { ReportRunMetricsDiff } from '@/lib/care-plans/diffReportRunMetrics';
import { cn } from '@/lib/utils/styles';

export type ReviewOperationalLogMetricsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  period: { starts_on: string; ends_on: string } | null;
  diff: ReportRunMetricsDiff;
  onContinueToSave: () => void;
};

function formatSectionLabel(sectionKey: string): string {
  const tab = getCarePlanSectionTab(sectionKey);
  if (tab) return tab.label;
  const k = sectionKey.replace(/_/g, ' ').trim() || 'other';
  return k.replace(/\b\w/g, (ch) => ch.toUpperCase());
}

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
          <div className='flex min-w-0 items-start gap-3'>
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
                <p className='text-foreground/80 mt-2 text-[12px] font-semibold tabular-nums'>
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

          {totalFieldChanges > 0 ? (
            <p className='text-foreground/90 text-[12px] font-semibold tabular-nums'>
              {`${totalFieldChanges} Change${totalFieldChanges === 1 ? '' : 's'} across ${metrics.length} Metric${metrics.length === 1 ? '' : 's'}.`}
            </p>
          ) : null}

          {!hasDetails && totalFieldChanges === 0 ? (
            <div className='border-border/80 bg-muted/15 my-2 rounded-md border px-3.5 py-3.5'>
              <p className='text-foreground/90 text-[12px] font-semibold'>
                Nothing new to review right now
              </p>
              <p className='text-muted-foreground mt-1 text-[12px] leading-relaxed font-medium'>
                You can continue to save if you want to confirm this worksheet
                on the server, or keep editing to make more changes first.
              </p>
            </div>
          ) : null}

          {hasDetails ? (
            <ul className='mt-4 space-y-4'>
              {metrics.map((m, rowIdx) => {
                const sectionTab = getCarePlanSectionTab(m.section);
                const SectionIcon = sectionTab?.icon;
                return (
                  <li
                    key={`review-metric-${rowIdx}-${m.metricKey}`}
                    className='border-border from-muted/20 overflow-hidden rounded-md border bg-linear-to-b to-white dark:from-zinc-900/40 dark:to-zinc-950/40'
                  >
                    <div className='border-border/60 flex min-h-11 items-stretch gap-2 border-b bg-white/50 px-3 py-2 sm:gap-2.5 sm:px-3.5 dark:bg-zinc-950/30'>
                      <div
                        className='border-border/90 bg-muted/20 flex size-7 shrink-0 items-center justify-center self-start rounded-md border sm:size-8'
                        aria-hidden
                      >
                        {SectionIcon ? (
                          <SectionIcon className='text-muted-foreground size-3.5' />
                        ) : (
                          <div className='bg-border/50 size-2.5 rounded-sm' />
                        )}
                      </div>
                      <div className='min-w-0 flex-1 py-px'>
                        <div className='flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5'>
                          <p
                            className='text-muted-foreground text-[9px] font-semibold tracking-wider uppercase'
                            title={m.section}
                          >
                            {formatSectionLabel(m.section)}
                          </p>
                          {m.keyMismatch ? (
                            <span className='inline-flex items-center rounded border border-amber-200/90 bg-amber-50/90 px-1.5 py-0.5 text-[8px] font-semibold text-amber-900 uppercase dark:border-amber-900/50 dark:bg-amber-950/50 dark:text-amber-100'>
                              Row check
                            </span>
                          ) : null}
                        </div>
                        <p className='text-foreground mt-0.5 text-[12.5px] leading-snug font-semibold tracking-tight'>
                          {m.label}
                        </p>
                      </div>
                    </div>
                    <div className='overflow-x-auto bg-white/40 dark:bg-zinc-950/20'>
                      <table
                        className='w-full min-w-80 border-collapse text-left text-[11px] sm:min-w-full'
                        aria-label={`Changes for ${m.label}`}
                      >
                        <caption className='sr-only'>
                          Field, previous and new value for {m.label}
                        </caption>
                        <thead>
                          <tr className='border-border/50 text-muted-foreground border-b text-[9px] font-bold tracking-wider dark:bg-zinc-900/20'>
                            <th className='text-foreground/70 px-3 py-1.5 text-left sm:px-4'>
                              Field
                            </th>
                            <th className='w-[28%] min-w-20 px-2 py-1.5 text-left'>
                              Previous
                            </th>
                            <th
                              className='text-muted-foreground/70 w-6 px-0.5 text-center'
                              aria-hidden
                            >
                              →
                            </th>
                            <th className='w-[30%] min-w-20 px-2 py-1.5 text-left'>
                              New
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {m.changes.map((ch, i) => (
                            <tr
                              key={`${m.metricKey}-${ch.pathLabel}-${i}`}
                              className='border-border/30 hover:bg-muted/20 border-b last:border-b-0'
                            >
                              <td className='text-foreground/90 bg-muted/5 px-3 py-2 align-top font-medium capitalize sm:px-4'>
                                {ch.pathLabel}
                              </td>
                              <td className='px-1.5 py-1.5 align-top sm:px-2'>
                                <span
                                  className='border-border/70 bg-background text-foreground/85 inline-block max-w-full min-w-0 rounded border px-2 py-1 font-medium wrap-break-word tabular-nums dark:bg-zinc-900/50'
                                  title={ch.before}
                                >
                                  {ch.before}
                                </span>
                              </td>
                              <td
                                className='text-muted-foreground/60 px-0.5 text-center align-middle'
                                aria-hidden
                              >
                                →
                              </td>
                              <td className='px-1.5 py-1.5 align-top sm:px-2'>
                                <span
                                  className='border-primary/20 bg-primary/5 text-foreground inline-block max-w-full min-w-0 rounded border px-2 py-1 font-semibold wrap-break-word tabular-nums'
                                  title={ch.after}
                                >
                                  {ch.after}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </li>
                );
              })}
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
