'use client';

import { format, parse, parseISO, startOfDay } from 'date-fns';
import { SaveIcon } from 'lucide-react';

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
import { Label } from '@/components/ui/label';

function toDateInputValue(iso: string | null | undefined): string {
  if (!iso?.trim()) return '';
  try {
    return format(parseISO(iso.trim()), 'yyyy-MM-dd');
  } catch {
    return '';
  }
}

function parseYmdLocal(ymd: string): Date | undefined {
  if (!ymd?.trim()) return undefined;
  const d = parse(ymd.trim(), 'yyyy-MM-dd', new Date());
  return Number.isNaN(d.getTime()) ? undefined : startOfDay(d);
}

export type ScheduleEditorDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isActive: boolean;
  rowId: number;
  rowStartsAt: string | null | undefined;
  startsAt: string;
  setStartsAt: React.Dispatch<React.SetStateAction<string>>;
  endsAt: string;
  setEndsAt: React.Dispatch<React.SetStateAction<string>>;
  scheduleErrors: Record<string, string>;
  setScheduleErrors: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >;
  schedulePending: boolean;
  onSubmit: (e: React.FormEvent) => void;
};

export default function EnrollmentScheduleEditorDialog({
  open,
  onOpenChange,
  isActive,
  rowId,
  rowStartsAt,
  startsAt,
  setStartsAt,
  endsAt,
  setEndsAt,
  scheduleErrors,
  setScheduleErrors,
  schedulePending,
  onSubmit,
}: ScheduleEditorDialogProps) {
  const formId = `enrollment-schedule-editor-${rowId}`;
  const startDate = !isActive ? parseYmdLocal(startsAt) : undefined;
  const endDate = parseYmdLocal(endsAt);
  const lockedStartYmd = toDateInputValue(rowStartsAt);
  const lockedStartDisplay = lockedStartYmd
    ? format(parse(lockedStartYmd, 'yyyy-MM-dd', new Date()), 'PP')
    : '—';

  const startForEndConstraint = isActive
    ? parseYmdLocal(lockedStartYmd)
    : startDate;
  const endCalendarDisabled = startForEndConstraint
    ? { before: startOfDay(startForEndConstraint) }
    : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={!schedulePending}
        className={enrollmentWizardDialogContentClass}
      >
        <div className='border-border flex min-h-0 flex-1 flex-col overflow-hidden'>
          <DialogHeader className={enrollmentWizardDialogHeaderClass}>
            <DialogTitle className={enrollmentWizardDialogTitleClass}>
              Edit Enrollment Schedule
            </DialogTitle>
            <DialogDescription className='text-muted-foreground text-[13px] leading-relaxed font-medium'>
              {isActive
                ? 'The start date cannot be modified for active enrollments. You may update the end date only while the enrollment remains active.'
                : 'You may set or modify the start and end dates for this enrollment. The end date is optional and can be updated while the enrollment is scheduled or active.'}
            </DialogDescription>
          </DialogHeader>

          <div>
            <form
              id={formId}
              onSubmit={onSubmit}
              className='flex min-h-0 flex-1 flex-col gap-4 overflow-hidden'
            >
              <div className='min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-6'>
                {isActive ? (
                  <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4'>
                    <div className='min-w-0'>
                      <Label className='text-foreground text-[13px] font-semibold'>
                        Start date <span className='text-destructive'>*</span>
                      </Label>
                      <p className='text-foreground mt-2 text-[13px] font-semibold tabular-nums'>
                        {lockedStartDisplay}
                      </p>
                      <p className='text-muted-foreground mt-1 text-[12px] font-medium'>
                        Locked while enrollment is active.
                      </p>
                    </div>

                    <DatePickerField
                      label='End Date'
                      presets={false}
                      placeholder='Optional — pick end date'
                      dateFormat='PP'
                      className='[&_button]:text-[13px] md:[&_button]:text-[13px]'
                      value={endDate}
                      onChange={(d) => {
                        setEndsAt(d ? format(startOfDay(d), 'yyyy-MM-dd') : '');
                        setScheduleErrors((p) => {
                          const n = { ...p };
                          delete n.ends_at;
                          return n;
                        });
                      }}
                      error={scheduleErrors.ends_at}
                      calendarProps={{
                        disabled: endCalendarDisabled,
                      }}
                    />
                  </div>
                ) : (
                  <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4'>
                    <DatePickerField
                      label='Start Date'
                      required
                      presets
                      clearable={false}
                      dateFormat='PP'
                      className='[&_button]:text-[13px] md:[&_button]:text-[13px]'
                      value={startDate}
                      onChange={(d) => {
                        const next = d ? startOfDay(d) : undefined;
                        setStartsAt(next ? format(next, 'yyyy-MM-dd') : '');
                        setScheduleErrors((p) => {
                          const n = { ...p };
                          delete n.starts_at;
                          return n;
                        });
                        if (
                          next &&
                          endsAt.trim() &&
                          parseYmdLocal(endsAt) &&
                          parseYmdLocal(endsAt)!.getTime() < next.getTime()
                        ) {
                          setEndsAt('');
                          setScheduleErrors((p) => {
                            const n = { ...p };
                            delete n.ends_at;
                            return n;
                          });
                        }
                      }}
                      error={scheduleErrors.starts_at}
                    />
                    <DatePickerField
                      label='End Date'
                      presets={false}
                      placeholder='Optional — pick end date'
                      dateFormat='PP'
                      className='[&_button]:text-[13px] md:[&_button]:text-[13px]'
                      value={endDate}
                      onChange={(d) => {
                        setEndsAt(d ? format(startOfDay(d), 'yyyy-MM-dd') : '');
                        setScheduleErrors((p) => {
                          const n = { ...p };
                          delete n.ends_at;
                          return n;
                        });
                      }}
                      error={scheduleErrors.ends_at}
                      calendarProps={{
                        disabled: endCalendarDisabled,
                      }}
                    />
                  </div>
                )}
                {scheduleErrors.status ? (
                  <p className='text-destructive mt-3 text-xs font-medium'>
                    {scheduleErrors.status}
                  </p>
                ) : null}
              </div>
            </form>
          </div>
        </div>

        <DialogFooter className={enrollmentWizardDialogFooterClass}>
          <Button
            type='button'
            variant='outline'
            disabled={schedulePending}
            className={wizardOutlineButtonClass}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type='submit'
            form={formId}
            variant='default'
            disabled={schedulePending}
            className={wizardPrimaryButtonClass}
          >
            <SaveIcon className='size-3.5 shrink-0' />
            {schedulePending ? 'Saving…' : 'Save schedule'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
