'use client';

import { ClipboardListIcon } from 'lucide-react';

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

type SubmitMetricOption = {
  metricKey: string;
  label: string;
  section: string;
};

export type SubmitOperationalLogForReviewDialogProps = {
  open: boolean;
  isSubmitting: boolean;
  metricOptions: SubmitMetricOption[];
  includedMetricKeys: string[];
  feedback: ReportRunFeedback;
  avgSteps: string;
  avgTrainingTime: string;
  onOpenChange: (open: boolean) => void;
  onIncludedMetricKeysChange: (keys: string[]) => void;
  onFeedbackChange: (feedback: ReportRunFeedback) => void;
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
  metricOptions,
  includedMetricKeys,
  feedback,
  avgSteps,
  avgTrainingTime,
  onOpenChange,
  onIncludedMetricKeysChange,
  onFeedbackChange,
  onAvgStepsChange,
  onAvgTrainingTimeChange,
  onSubmit,
}: SubmitOperationalLogForReviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] max-w-2xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-sm font-semibold'>
            <ClipboardListIcon className='size-4' aria-hidden />
            Generate client-facing report
          </DialogTitle>
          <DialogDescription>
            Select which operational metrics to include, provide manual averages,
            and add the care-team narrative before submitting for review.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='space-y-2'>
            <p className='text-foreground text-xs font-semibold tracking-wide uppercase'>
              Include metrics
            </p>
            {metricOptions.length ? (
              <div className='space-y-2 rounded-md border p-3'>
                {metricOptions.map((metric) => {
                  const checked = includedMetricKeys.includes(metric.metricKey);
                  return (
                    <label
                      key={metric.metricKey}
                      className='flex items-start gap-2 rounded-md border p-2'
                    >
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
                      <div className='min-w-0'>
                        <p className='text-sm font-medium'>{metric.label}</p>
                        <p className='text-muted-foreground text-xs'>
                          {formatSectionLabel(metric.section)} -{' '}
                          {metric.metricKey}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            ) : (
              <p className='text-muted-foreground text-sm'>
                No metric rows available to include from this operational log.
              </p>
            )}
          </div>

          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
            <TextField
              id='submit-review-avg-steps'
              label='Average steps (manual)'
              type='number'
              min={0}
              step='any'
              value={avgSteps}
              onChange={(event) => onAvgStepsChange(event.target.value)}
            />
            <TextField
              id='submit-review-avg-training-time'
              label='Average training time (minutes)'
              type='number'
              min={0}
              step='any'
              value={avgTrainingTime}
              onChange={(event) => onAvgTrainingTimeChange(event.target.value)}
            />
          </div>

          <TextAreaField
            id='submit-review-summary'
            label='Summary'
            value={feedback.summary ?? ''}
            onChange={(event) =>
              onFeedbackChange({ ...feedback, summary: event.target.value })
            }
            className='min-h-24'
          />
          <TextAreaField
            id='submit-review-focus'
            label='Focus for next period'
            value={feedback.focus_next_period ?? ''}
            onChange={(event) =>
              onFeedbackChange({
                ...feedback,
                focus_next_period: event.target.value,
              })
            }
            className='min-h-20'
          />
          <TextAreaField
            id='submit-review-notes'
            label='Internal notes'
            value={feedback.notes ?? ''}
            onChange={(event) =>
              onFeedbackChange({ ...feedback, notes: event.target.value })
            }
            className='min-h-20'
          />
        </div>

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type='button' onClick={onSubmit} disabled={isSubmitting}>
            Submit for review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
