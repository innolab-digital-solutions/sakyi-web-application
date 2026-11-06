'use client';

import { SaveIcon } from 'lucide-react';

import {
  enrollmentWizardDialogContentClass,
  enrollmentWizardDialogFooterClass,
  enrollmentWizardDialogHeaderClass,
  enrollmentWizardDialogTitleClass,
  wizardOutlineButtonClass,
  wizardPrimaryButtonClass,
} from '@/components/admin/modules/enrollmentWizardModalUi';
import TextAreaField from '@/components/shared/form/TextAreaField';
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
  dayLabel: string;
  motivation: string;
  error?: string;
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onMotivationChange: (value: string) => void;
  onSave: () => void;
};

/**
 * Edits the client-facing daily motivation tip for a care plan day.
 * Separate from admin day notes (`general_notes`).
 */
export default function CarePlanDayMotivationModal({
  open,
  dayLabel,
  motivation,
  error,
  isSaving,
  onOpenChange,
  onMotivationChange,
  onSave,
}: Props) {
  const formId = 'care-plan-day-motivation-form';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={!isSaving}
        className={enrollmentWizardDialogContentClass}
      >
        <div className='border-border flex min-h-0 flex-1 flex-col overflow-hidden'>
          <DialogHeader className={enrollmentWizardDialogHeaderClass}>
            <DialogTitle className={enrollmentWizardDialogTitleClass}>
              Daily Motivation
            </DialogTitle>
            <DialogDescription className='text-muted-foreground text-[13px] leading-relaxed font-medium'>
              Optional tip for <span className='font-semibold'>{dayLabel}</span>
              . Clients see this on the mobile home overview for that day.
              Separate from day notes.
            </DialogDescription>
          </DialogHeader>

          <div>
            <form
              id={formId}
              onSubmit={(event) => {
                event.preventDefault();
                onSave();
              }}
              className='flex min-h-0 flex-1 flex-col gap-4 overflow-hidden'
            >
              <div className='min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-6'>
                <TextAreaField
                  label='Daily motivation (optional)'
                  rows={6}
                  placeholder='e.g. Small steps today build lasting strength.'
                  value={motivation}
                  onChange={(event) => onMotivationChange(event.target.value)}
                  error={error}
                  disabled={isSaving}
                />
              </div>
            </form>
          </div>
        </div>

        <DialogFooter className={enrollmentWizardDialogFooterClass}>
          <Button
            type='button'
            variant='outline'
            disabled={isSaving}
            className={wizardOutlineButtonClass}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type='submit'
            form={formId}
            disabled={isSaving}
            className={wizardPrimaryButtonClass}
          >
            <SaveIcon className='size-3.5 shrink-0' />
            {isSaving ? 'Saving…' : 'Save Motivation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
