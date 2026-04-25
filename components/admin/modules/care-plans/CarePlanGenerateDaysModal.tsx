'use client';

import { format, startOfDay } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

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
  startsOn: string;
  endsOn: string;
  startsOnError?: string;
  endsOnError?: string;
  showOverwriteWarning: boolean;
  isSubmitting: boolean;
  startDateDisabled?: { before: Date; after: Date };
  endDateDisabled?: { before: Date };
  rangePreviewLabel?: string;
  onOpenChange: (open: boolean) => void;
  onStartsOnChange: (value: string) => void;
  onEndsOnChange: (value: string) => void;
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
  startsOn,
  endsOn,
  startsOnError,
  endsOnError,
  showOverwriteWarning,
  isSubmitting,
  startDateDisabled,
  endDateDisabled,
  rangePreviewLabel,
  onOpenChange,
  onStartsOnChange,
  onEndsOnChange,
  onSubmit,
}: Props) {
  const formId = 'care-plan-generate-days-form';
  const startLabel = formatYmdLabel(startsOn);
  const endLabel = formatYmdLabel(endsOn);

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
              Choose the start and end dates to define your care plan&apos;s
              days. When you apply a new range, any existing days will be
              replaced with new ones for these dates.
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
                  <div className='mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] font-medium text-amber-700'>
                    Regenerating with a new date range will remove all currently
                    generated day rows for this care plan and replace them with
                    days from the selected start date to end date only.
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
            {isSubmitting ? 'Generating days…' : submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
