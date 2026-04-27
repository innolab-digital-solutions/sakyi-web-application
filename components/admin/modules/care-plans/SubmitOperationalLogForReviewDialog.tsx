'use client';

import {
  ArrowLeftIcon,
  ChevronRightIcon,
  FileChartColumn,
  FileSymlink,
} from 'lucide-react';
import * as React from 'react';

import {
  enrollmentWizardDialogContentClass,
  enrollmentWizardDialogFooterClass,
  wizardOutlineButtonClass,
  wizardPrimaryButtonClass,
} from '@/components/admin/modules/enrollmentWizardModalUi';
import TextAreaField from '@/components/shared/form/TextAreaField';
import TextField from '@/components/shared/form/TextField';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { ReportRunFeedback } from '@/domains/care-plans/types/care-plan-report';
import { getCarePlanSectionTab } from '@/lib/care-plans/carePlanSectionTabs';
import { cn } from '@/lib/utils/styles';

type SubmitMetricOption = {
  metricKey: string;
  label: string;
  section: string;
};

export type SubmitOperationalLogForReviewDialogProps = {
  open: boolean;
  isSubmitting: boolean;
  hasExistingReport: boolean;
  metricOptions: SubmitMetricOption[];
  includedMetricKeys: string[];
  feedback: ReportRunFeedback;
  avgIntake: string;
  avgBurn: string;
  avgSteps: string;
  avgTrainingTime: string;
  onOpenChange: (open: boolean) => void;
  onIncludedMetricKeysChange: (keys: string[]) => void;
  onFeedbackChange: (feedback: ReportRunFeedback) => void;
  onAvgIntakeChange: (value: string) => void;
  onAvgBurnChange: (value: string) => void;
  onAvgStepsChange: (value: string) => void;
  onAvgTrainingTimeChange: (value: string) => void;
  onSubmit: () => void;
};

function formatSectionLabel(sectionKey: string): string {
  const k = sectionKey.replace(/_/g, ' ').trim() || 'other';
  return k.replace(/\b\w/g, (ch) => ch.toUpperCase());
}

export default function SubmitOperationalLogForReviewDialog({
  open,
  isSubmitting,
  hasExistingReport,
  metricOptions,
  includedMetricKeys,
  feedback,
  avgIntake,
  avgBurn,
  avgSteps,
  avgTrainingTime,
  onOpenChange,
  onIncludedMetricKeysChange,
  onFeedbackChange,
  onAvgIntakeChange,
  onAvgBurnChange,
  onAvgStepsChange,
  onAvgTrainingTimeChange,
  onSubmit,
}: SubmitOperationalLogForReviewDialogProps) {
  const [step, setStep] = React.useState<1 | 2 | 3>(1);
  const actionTitle = hasExistingReport ? 'Regenerate client report' : 'Generate client report';
  const submitLabel = hasExistingReport ? 'Regenerate report' : 'Generate report';
  const STEPS = [
    {
      id: 1 as const,
      title: 'Average Values',
      description:
        'Review and confirm the period averages shown to the client, then adjust values when clinical context requires an override.',
    },
    {
      id: 2 as const,
      title: 'Select Metrics',
      description:
        'Select the operational metrics that best represent this reporting period so the client report stays focused and relevant.',
    },
    {
      id: 3 as const,
      title: 'Narrative',
      description:
        'Finalize the care-team narrative with a clear summary and next-period focus. Ensure these sections convey key achievements and primary goals for the upcoming period.',
   
    },
  ];

  const goBack = () => {
    if (step === 1) return;
    setStep((prev) => (prev === 3 ? 2 : 1));
  };

  const goNext = () => {
    if (step === 3) return;
    setStep((prev) => (prev === 1 ? 2 : 3));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          enrollmentWizardDialogContentClass,
          'max-h-[min(90vh,760px)] overflow-hidden',
        )}
      >
        <div className='border-border flex min-h-0 flex-1 flex-col'>
          <DialogHeader className='border-border shrink-0 border-b px-6 pt-6 pb-4 text-left'>
            <DialogTitle className='text-foreground flex items-center gap-2 text-[15.5px] font-bold capitalize'>
              {actionTitle}
            </DialogTitle>
            <DialogDescription className='text-muted-foreground text-[13px] leading-relaxed font-medium'>
              Use this guided workflow to prepare a high-quality client report
              draft from the operational log before final review and publication.
            </DialogDescription>
          </DialogHeader>

          <div className='flex min-h-0 flex-1 flex-col px-6 py-4'>
            <ol className='flex w-full shrink-0 gap-2' aria-label='Generate report steps'>
              {STEPS.map((item) => {
                const active = step === item.id;
                const completed = step > item.id;
                return (
                  <li key={item.id} className='min-w-0 flex-1'>
                    <div
                      className={cn(
                        'flex flex-col gap-1 rounded-lg border px-2 py-2 text-center transition-colors',
                        active && 'border-primary bg-primary/5 dark:bg-primary/10 shadow-sm',
                        completed && 'border-border bg-muted/30',
                        !active && !completed && 'border-border bg-background',
                      )}
                    >
                      <span
                        className={cn(
                          'text-[11px] font-bold tracking-wide uppercase',
                          active ? 'text-primary' : 'text-muted-foreground',
                        )}
                      >
                        Step {item.id}
                      </span>
                      <span
                        className={cn(
                          'truncate text-xs font-semibold',
                          active ? 'text-foreground' : 'text-muted-foreground',
                        )}
                      >
                        {item.title}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ol>
            <p className='text-muted-foreground mt-4 shrink-0 text-[13px] leading-relaxed font-medium'>
              {STEPS[step - 1]?.description}
            </p>

            <div className='min-h-0 flex-1 pt-4'>
              {step === 1 ? (
                <div className='grid grid-cols-1 gap-3 px-0.5 py-0.5 sm:grid-cols-2'>
                  <TextField
                    id='submit-review-avg-intake'
                    label='Average Intake (kcal)'
                    type='number'
                    min={0}
                    step='any'
                    value={avgIntake}
                    onChange={(event) => onAvgIntakeChange(event.target.value)}
                    className='text-[13px]'
                  />
                  <TextField
                    id='submit-review-avg-burn'
                    label='Average Burn (kcal)'
                    type='number'
                    min={0}
                    step='any'
                    value={avgBurn}
                    onChange={(event) => onAvgBurnChange(event.target.value)}
                    className='text-[13px]'
                  />
                  <TextField
                    id='submit-review-avg-steps'
                    label='Average Steps (steps)'
                    type='number'
                    min={0}
                    step='any'
                    value={avgSteps}
                    onChange={(event) => onAvgStepsChange(event.target.value)}
                    className='text-[13px]'
                  />
                  <TextField
                    id='submit-review-avg-training-time'
                    label='Average Training Time (minutes)'
                    type='number'
                    min={0}
                    step='any'
                    value={avgTrainingTime}
                    onChange={(event) =>
                      onAvgTrainingTimeChange(event.target.value)
                    }
                    className='text-[13px]'
                  />
                </div>
              ) : null}

              {step === 2 ? (
                <div className='space-y-2'>
                  {metricOptions.length ? (
                    <div className='max-h-72 overflow-y-auto px-0.5 py-0.5'>
                      <div className='grid grid-cols-1 gap-2 md:grid-cols-2'>
                        {metricOptions.map((metric) => {
                          const checked = includedMetricKeys.includes(metric.metricKey);
                          const sectionTab = getCarePlanSectionTab(metric.section);
                          const SectionIcon = sectionTab?.icon;
                          return (
                            <label
                              key={metric.metricKey}
                              className={cn(
                                'border-border bg-muted/40 hover:border-primary/40 hover:bg-primary/2 flex min-h-20 items-center justify-between gap-3 rounded-md border p-3 transition-colors',
                                checked && 'border-primary/50 bg-primary/5 shadow-xs',
                              )}
                            >
                              <div className='flex min-w-0 items-center gap-2.5'>
                                <div className='border-border bg-muted/25 flex size-10 shrink-0 items-center justify-center rounded-md border'>
                                  {SectionIcon ? (
                                    <SectionIcon
                                      aria-hidden
                                      className='text-muted-foreground size-4'
                                    />
                                  ) : (
                                    <div
                                      aria-hidden
                                      className='bg-border/70 size-3 rounded-sm'
                                    />
                                  )}
                                </div>
                                <div className='min-w-0 space-y-1'>
                                  <p className='text-muted-foreground text-[10px] font-semibold tracking-wide uppercase'>
                                    {sectionTab?.label ?? formatSectionLabel(metric.section)}
                                  </p>
                                  <p className='text-foreground line-clamp-2 text-[13px] font-semibold leading-tight'>
                                    {metric.label}
                                  </p>
                                </div>
                              </div>
                              <div className='flex items-center'>
                                <Checkbox
                                  checked={checked}
                                  onCheckedChange={(value) => {
                                    if (value === true) {
                                      onIncludedMetricKeysChange([
                                        ...includedMetricKeys,
                                        metric.metricKey,
                                      ]);
                                      return;
                                    }
                                    onIncludedMetricKeysChange(
                                      includedMetricKeys.filter(
                                        (key) => key !== metric.metricKey,
                                      ),
                                    );
                                  }}
                                  aria-label={`Include ${metric.label}`}
                                />
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <p className='text-muted-foreground text-sm'>
                      No metric rows available to include from this operational log.
                    </p>
                  )}
                </div>
              ) : null}

              {step === 3 ? (
                <div className='space-y-3 px-0.5 py-0.5'>
                  <TextAreaField
                    id='submit-review-summary'
                    label='Summary'
                    placeholder='Provide a concise summary of the client performance for this reporting period.'
                    value={feedback.summary ?? ''}
                    onChange={(event) =>
                      onFeedbackChange({ ...feedback, summary: event.target.value })
                    }
                    className='min-h-24 text-[13px]'
                  />
                  <TextAreaField
                    id='submit-review-focus'
                    label='Focus For Next Period'
                    placeholder='State the primary priorities and actionable focus areas for the next period.'
                    value={feedback.focus_next_period ?? ''}
                    onChange={(event) =>
                      onFeedbackChange({
                        ...feedback,
                        focus_next_period: event.target.value,
                      })
                    }
                    className='min-h-20 text-[13px]'
                  />
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <DialogFooter className={enrollmentWizardDialogFooterClass}>
          {step === 1 ? (
            <Button
              type='button'
              variant='outline'
              className={wizardOutlineButtonClass}
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          ) : (
            <Button
              type='button'
              variant='outline'
              className={wizardOutlineButtonClass}
              onClick={goBack}
              disabled={isSubmitting}
            >
              <ArrowLeftIcon className='size-3.5 shrink-0' />
              Previous
            </Button>
          )}
          {step < 3 ? (
            <Button
              type='button'
              className={wizardPrimaryButtonClass}
              onClick={goNext}
              disabled={isSubmitting}
            >
              Continue
              <ChevronRightIcon className='size-3.5 shrink-0' />
            </Button>
          ) : (
            <Button
              type='button'
              className={wizardPrimaryButtonClass}
              onClick={onSubmit}
              disabled={isSubmitting}
            >
              {hasExistingReport ? (
                <FileSymlink className='size-3.5 shrink-0' />
              ) : (
                <FileChartColumn className='size-3.5 shrink-0' />
              )}
              {isSubmitting
                ? hasExistingReport
                  ? 'Regenerating...'
                  : 'Generating...'
                : submitLabel}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
