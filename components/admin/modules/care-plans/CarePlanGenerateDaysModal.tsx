'use client';

import { format, startOfDay } from 'date-fns';
import {
  AlertTriangleIcon,
  CalendarIcon,
  InfoIcon,
  TriangleAlertIcon,
} from 'lucide-react';

import {
  enrollmentWizardDialogContentClass,
  enrollmentWizardDialogFooterClass,
  enrollmentWizardDialogHeaderClass,
  enrollmentWizardDialogTitleClass,
  wizardOutlineButtonClass,
  wizardPrimaryButtonClass,
} from '@/components/admin/modules/enrollmentWizardModalUi';
import DatePickerField from '@/components/shared/form/DatePickerField';
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

type Props = {
  open: boolean;
  title: string;
  submitLabel: string;
  isRegenerate: boolean;
  replaceStrategy: 'preserve_overlap' | 'full';
  startsOn: string;
  endsOn: string;
  startsOnError?: string;
  endsOnError?: string;
  showOverwriteWarning: boolean;
  showScheduledDraftDemotionWarning?: boolean;
  isSubmitting: boolean;
  startDateDisabled?: { before: Date; after: Date };
  endDateDisabled?: { before: Date };
  rangePreviewLabel?: string;
  onOpenChange: (open: boolean) => void;
  onStartsOnChange: (value: string) => void;
  onEndsOnChange: (value: string) => void;
  onReplaceStrategyChange: (value: 'preserve_overlap' | 'full') => void;
  onSubmit: () => void;
};

function parseYmdLocal(ymd: string): Date | undefined {
  if (!ymd?.trim()) return undefined;
  const d = new Date(`${ymd.trim()}T00:00:00`);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function formatYmdLabel(ymd: string): string | null {
  const d = parseYmdLocal(ymd);
  if (!d) return null;
  return format(d, 'MMM d, yyyy');
}

export default function CarePlanGenerateDaysModal({
  open,
  title,
  submitLabel,
  isRegenerate,
  replaceStrategy,
  startsOn,
  endsOn,
  startsOnError,
  endsOnError,
  showOverwriteWarning,
  showScheduledDraftDemotionWarning,
  isSubmitting,
  startDateDisabled,
  endDateDisabled,
  rangePreviewLabel,
  onOpenChange,
  onStartsOnChange,
  onEndsOnChange,
  onReplaceStrategyChange,
  onSubmit,
}: Props) {
  const formId = 'care-plan-generate-days-form';
  const startLabel = formatYmdLabel(startsOn);
  const endLabel = formatYmdLabel(endsOn);
  const isFullReset = replaceStrategy === 'full';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={!isSubmitting}
        className={enrollmentWizardDialogContentClass}
      >
        <div className='border-border flex min-h-0 flex-1 flex-col overflow-hidden'>
          <DialogHeader className={enrollmentWizardDialogHeaderClass}>
            <DialogTitle className={enrollmentWizardDialogTitleClass}>
              {title}
            </DialogTitle>
            <DialogDescription className='text-muted-foreground text-[13px] leading-relaxed font-medium'>
              {isRegenerate
                ? 'Choose the updated care timeline. By default, overlapping days keep their existing content, while days outside the new range are removed.'
                : 'Choose the care timeline to set up this plan period. After you apply the dates, day entries will be created for the selected window so you can configure section tasks.'}
            </DialogDescription>
          </DialogHeader>

          <div>
            <form
              id={formId}
              onSubmit={(event) => {
                event.preventDefault();
                onSubmit();
              }}
              className='flex min-h-0 flex-1 flex-col gap-4 overflow-hidden'
            >
              <div className='min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-6 pb-2'>
                <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4'>
                  <DatePickerField
                    label='Start Date'
                    required
                    presets={false}
                    placeholder='Pick start date'
                    dateFormat='PP'
                    className='[&_button]:text-[13px] md:[&_button]:text-[13px]'
                    value={parseYmdLocal(startsOn)}
                    onChange={(d) =>
                      onStartsOnChange(
                        d ? format(startOfDay(d), 'yyyy-MM-dd') : '',
                      )
                    }
                    error={startsOnError}
                    calendarProps={{ disabled: startDateDisabled }}
                    disabled={isSubmitting}
                  />
                  <DatePickerField
                    label='End Date'
                    required
                    presets={false}
                    placeholder='Pick end date'
                    dateFormat='PP'
                    className='[&_button]:text-[13px] md:[&_button]:text-[13px]'
                    value={parseYmdLocal(endsOn)}
                    onChange={(d) =>
                      onEndsOnChange(
                        d ? format(startOfDay(d), 'yyyy-MM-dd') : '',
                      )
                    }
                    error={endsOnError}
                    calendarProps={{ disabled: endDateDisabled }}
                    disabled={isSubmitting}
                  />
                </div>

                {showOverwriteWarning ? (
                  <div
                    className={`mt-4 rounded-md border px-3 py-2.5 ${
                      isFullReset
                        ? 'border-rose-200 bg-rose-50'
                        : 'border-amber-200 bg-amber-50'
                    }`}
                  >
                    <div className='flex items-start gap-2.5'>
                      <div
                        className={`mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-md border ${
                          isFullReset
                            ? 'border-rose-300/70 bg-rose-100 text-rose-700'
                            : 'border-amber-300/70 bg-amber-100 text-amber-700'
                        }`}
                      >
                        {isFullReset ? (
                          <AlertTriangleIcon className='size-4' aria-hidden />
                        ) : (
                          <TriangleAlertIcon className='size-4' aria-hidden />
                        )}
                      </div>
                      <div className='space-y-0.5'>
                        <p
                          className={`text-[13px] font-semibold ${
                            isFullReset ? 'text-rose-800' : 'text-amber-800'
                          }`}
                        >
                          {isFullReset
                            ? 'Full Reset: All Existing Days Will Be Rebuilt'
                            : 'Partial Reset: Overlapping Days Will Be Preserved'}
                        </p>
                        <p
                          className={`text-[12px] font-medium ${
                            isFullReset ? 'text-rose-700' : 'text-amber-700'
                          }`}
                        >
                          {isFullReset
                            ? 'All existing days and day content will be removed and rebuilt from the selected timeline.'
                            : 'Only days outside the new date range will be removed. Overlapping days and their content will be retained.'}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}
                {isRegenerate ? (
                  <div className='border-input bg-background mt-3 rounded-md border px-3 py-2.5 shadow-xs'>
                    <label className='flex cursor-pointer items-center gap-3'>
                      <Checkbox
                        className='border-border'
                        checked={replaceStrategy === 'full'}
                        onCheckedChange={(checked) =>
                          onReplaceStrategyChange(
                            checked ? 'full' : 'preserve_overlap',
                          )
                        }
                        disabled={isSubmitting}
                        aria-label='Reset all day content'
                      />
                      <span className='flex flex-col gap-0.5'>
                        <span className='text-foreground block text-[13px] font-semibold'>
                          Reset all day content (Full Regenerate)
                        </span>
                        <span className='text-muted-foreground block text-[12px] font-medium'>
                          Use this only when you want a complete rebuild and do
                          not need to keep any existing day items.
                        </span>
                      </span>
                    </label>
                  </div>
                ) : null}
                {showScheduledDraftDemotionWarning ? (
                  <div className='mt-3 rounded-md border border-sky-200 bg-sky-50 px-3 py-2.5'>
                    <div className='flex items-start gap-2.5'>
                      <div className='mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-md border border-sky-300/70 bg-sky-100 text-sky-700'>
                        <InfoIcon className='size-4' aria-hidden />
                      </div>
                      <div className='space-y-0.5'>
                        <p className='text-[13px] font-semibold text-sky-800'>
                          Scheduled Plan Will Return to Draft
                        </p>
                        <p className='text-[12.5px] font-medium text-sky-700'>
                          This care plan is currently{' '}
                          <span className='font-semibold'>scheduled</span>. If
                          the selected start date is today, applying the
                          timeline will move the plan to{' '}
                          <span className='font-semibold'>draft</span> so the
                          team can continue editing before activation.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className='flex flex-wrap items-center justify-between gap-2 bg-transparent p-3 px-6'>
                <p className='text-foreground text-[12px] font-semibold'>
                  Schedule Window
                  <span className='text-muted-foreground ml-2 font-medium'>
                    {startLabel && endLabel
                      ? `${startLabel} - ${endLabel}`
                      : 'Select start and end dates'}
                  </span>
                </p>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${
                    rangePreviewLabel
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {rangePreviewLabel ?? 'Duration pending'}
                </span>
              </div>
            </form>
          </div>
        </div>

        <DialogFooter className={enrollmentWizardDialogFooterClass}>
          <Button
            type='button'
            variant='outline'
            disabled={isSubmitting}
            className={wizardOutlineButtonClass}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type='submit'
            form={formId}
            disabled={isSubmitting}
            className={wizardPrimaryButtonClass}
          >
            <CalendarIcon className='size-3.5 shrink-0' />
            {isSubmitting ? 'Applying timeline…' : submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
