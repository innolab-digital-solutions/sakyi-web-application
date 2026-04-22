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
  notes: string;
  error?: string;
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onNotesChange: (value: string) => void;
  onSave: () => void;
};

export default function CarePlanDayNoteModal({
  open,
  dayLabel,
  notes,
  error,
  isSaving,
  onOpenChange,
  onNotesChange,
  onSave,
}: Props) {
  const formId = 'care-plan-day-note-form';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={!isSaving}
        className={enrollmentWizardDialogContentClass}
      >
        <div className='border-border flex min-h-0 flex-1 flex-col overflow-hidden'>
          <DialogHeader className={enrollmentWizardDialogHeaderClass}>
            <DialogTitle className={enrollmentWizardDialogTitleClass}>
              Day Note for Client
            </DialogTitle>
            <DialogDescription className='text-muted-foreground text-[13px] leading-relaxed font-medium'>
              Add optional guidance for <span className='font-semibold'>{dayLabel}</span>.
              This note helps the client understand day-level context beyond
              section tasks.
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
                  label='Client Day Note (Optional)'
                  rows={6}
                  placeholder='Write optional guidance the client should see for this day.'
                  value={notes}
                  onChange={(event) => onNotesChange(event.target.value)}
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
            {isSaving ? 'Saving…' : 'Save Note'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
