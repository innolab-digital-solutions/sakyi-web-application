'use client';

import { CopyPlusIcon, Loader2Icon } from 'lucide-react';
import * as React from 'react';

import {
  enrollmentWizardDialogContentClass,
  enrollmentWizardDialogFooterClass,
  enrollmentWizardDialogHeaderClass,
  enrollmentWizardDialogTitleClass,
  wizardOutlineButtonClass,
  wizardPrimaryButtonClass,
} from '@/components/admin/modules/enrollmentWizardModalUi';
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
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils/styles';

export type DuplicateCarePlanDayOption = {
  id: number;
  day_number: number;
  target_date_label: string;
  /** When true, day cannot be selected as a paste target. */
  blocked: boolean;
  blockedReason?: string;
};

type Props = {
  open: boolean;
  sourceDayNumber: number | null;
  sourceDateLabel: string | null;
  targetOptions: DuplicateCarePlanDayOption[];
  selectedTargetIds: number[];
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectedTargetIdsChange: (ids: number[]) => void;
  onConfirm: () => void;
};

/**
 * Confirms replacing one or more care-plan days with a source day's content.
 */
export default function DuplicateCarePlanDayDialog({
  open,
  sourceDayNumber,
  sourceDateLabel,
  targetOptions,
  selectedTargetIds,
  isSubmitting,
  onOpenChange,
  onSelectedTargetIdsChange,
  onConfirm,
}: Props) {
  const selectable = targetOptions.filter((d) => !d.blocked);
  const allSelectableSelected =
    selectable.length > 0 &&
    selectable.every((d) => selectedTargetIds.includes(d.id));

  const toggleAllSelectable = (checked: boolean) => {
    if (!checked) {
      onSelectedTargetIdsChange([]);
      return;
    }
    onSelectedTargetIdsChange(selectable.map((d) => d.id));
  };

  const toggleDay = (dayId: number, checked: boolean) => {
    if (checked) {
      onSelectedTargetIdsChange(
        Array.from(new Set([...selectedTargetIds, dayId])),
      );
      return;
    }
    onSelectedTargetIdsChange(selectedTargetIds.filter((id) => id !== dayId));
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (isSubmitting) return;
        onOpenChange(next);
      }}
    >
      <DialogContent
        showCloseButton={!isSubmitting}
        className={enrollmentWizardDialogContentClass}
      >
        <div className='border-border flex min-h-0 flex-1 flex-col overflow-hidden'>
          <DialogHeader className={enrollmentWizardDialogHeaderClass}>
            <DialogTitle className={enrollmentWizardDialogTitleClass}>
              Duplicate day onto…
            </DialogTitle>
            <DialogDescription className='text-muted-foreground text-[13px] leading-relaxed font-medium'>
              Copy all sections, the day note, and daily motivation from{' '}
              <span className='font-semibold'>
                Day {sourceDayNumber ?? '—'}
                {sourceDateLabel ? ` (${sourceDateLabel})` : ''}
              </span>{' '}
              onto the days you select. Target day content is{' '}
              <span className='font-semibold'>replaced</span>, not merged.
            </DialogDescription>
          </DialogHeader>

          <div className='min-h-0 flex-1 space-y-4 overflow-y-auto p-6'>
            {selectable.length > 0 ? (
              <div className='flex items-center gap-2'>
                <Checkbox
                  id='duplicate-day-select-all'
                  checked={allSelectableSelected}
                  disabled={isSubmitting}
                  onCheckedChange={(c) => toggleAllSelectable(c === true)}
                />
                <Label
                  htmlFor='duplicate-day-select-all'
                  className='text-[13px] font-medium'
                >
                  Select all available days
                </Label>
              </div>
            ) : null}

            <ul className='flex flex-col gap-2'>
              {targetOptions.map((day) => {
                const checked = selectedTargetIds.includes(day.id);
                const inputId = `duplicate-day-target-${day.id}`;
                return (
                  <li
                    key={day.id}
                    className={cn(
                      'border-border flex items-start gap-2.5 rounded-md border px-3 py-2.5',
                      day.blocked && 'bg-muted/30 opacity-70',
                    )}
                  >
                    <Checkbox
                      id={inputId}
                      checked={checked}
                      disabled={isSubmitting || day.blocked}
                      onCheckedChange={(c) => toggleDay(day.id, c === true)}
                      className='mt-0.5'
                    />
                    <div className='min-w-0 flex-1'>
                      <Label
                        htmlFor={inputId}
                        className={cn(
                          'text-[13px] font-semibold',
                          day.blocked && 'cursor-not-allowed',
                        )}
                      >
                        Day {day.day_number}
                      </Label>
                      <p className='text-muted-foreground text-[11px] font-medium'>
                        {day.target_date_label}
                      </p>
                      {day.blocked && day.blockedReason ? (
                        <p className='mt-1 text-[11px] font-medium text-amber-700 dark:text-amber-400'>
                          {day.blockedReason}
                        </p>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>

            {targetOptions.length === 0 ? (
              <p className='text-muted-foreground text-sm'>
                No other days are available to duplicate onto.
              </p>
            ) : null}
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
            type='button'
            disabled={isSubmitting || selectedTargetIds.length === 0}
            className={wizardPrimaryButtonClass}
            onClick={onConfirm}
          >
            {isSubmitting ? (
              <Loader2Icon className='size-3.5 animate-spin' />
            ) : (
              <CopyPlusIcon className='size-3.5' />
            )}
            {isSubmitting
              ? 'Duplicating…'
              : `Duplicate onto ${selectedTargetIds.length || ''} day${selectedTargetIds.length === 1 ? '' : 's'}`.trim()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
