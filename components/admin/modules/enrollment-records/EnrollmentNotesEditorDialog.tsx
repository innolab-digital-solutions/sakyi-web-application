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

const NOTES_FORM_ID = 'enrollment-notes-editor';

export type NotesEditorDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notesBody: string;
  setNotesBody: React.Dispatch<React.SetStateAction<string>>;
  notesError: string | undefined;
  setNotesError: React.Dispatch<React.SetStateAction<string | undefined>>;
  notesPending: boolean;
  onSubmit: (e: React.FormEvent) => void;
};

export default function EnrollmentNotesEditorDialog({
  open,
  onOpenChange,
  notesBody,
  setNotesBody,
  notesError,
  setNotesError,
  notesPending,
  onSubmit,
}: NotesEditorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={!notesPending}
        className={enrollmentWizardDialogContentClass}
      >
        <div className='border-border flex min-h-0 flex-1 flex-col overflow-hidden'>
          <DialogHeader className={enrollmentWizardDialogHeaderClass}>
            <DialogTitle className={enrollmentWizardDialogTitleClass}>
              Edit Enrollment Notes
            </DialogTitle>
            <DialogDescription className='text-muted-foreground text-[13px] leading-relaxed font-medium'>
              Add any relevant internal notes regarding the participant or their
              program. These notes are visible to staff only and can provide
              helpful professional context. Leave empty and save to remove
              existing notes.
            </DialogDescription>
          </DialogHeader>

          <div>
            <form
              id={NOTES_FORM_ID}
              onSubmit={onSubmit}
              className='flex min-h-0'
            >
              <div className='min-h-0 flex-1 overflow-y-auto p-6'>
                <TextAreaField
                  label='Notes'
                  placeholder='Enter any relevant internal notes for this enrollment (visible to staff only)'
                  value={notesBody}
                  onChange={(e) => {
                    setNotesBody(e.target.value);
                    setNotesError(undefined);
                  }}
                  rows={8}
                  className='min-h-30 resize-none text-[13px] md:text-[13px]'
                  error={notesError}
                />
              </div>
            </form>
          </div>
        </div>

        <DialogFooter className={enrollmentWizardDialogFooterClass}>
          <Button
            type='button'
            variant='outline'
            disabled={notesPending}
            className={wizardOutlineButtonClass}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type='submit'
            form={NOTES_FORM_ID}
            variant='default'
            disabled={notesPending}
            className={wizardPrimaryButtonClass}
          >
            <SaveIcon className='size-3.5 shrink-0' />
            {notesPending ? 'Saving…' : 'Save notes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
