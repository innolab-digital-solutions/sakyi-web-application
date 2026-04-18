'use client';

import { Ban, CircleQuestionMark } from 'lucide-react';

import TextAreaField from '@/components/shared/form/TextAreaField';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

export type IntakeCancelConfirmationProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSubmitting: boolean;
  cancellationNote: string;
  onCancellationNoteChange: (value: string) => void;
  noteError?: string;
  onConfirmCancel: () => void;
};

/** Confirmation dialog for cancelling an in-progress intake assessment interview. */
export default function IntakeCancelConfirmation({
  open,
  onOpenChange,
  isSubmitting,
  cancellationNote,
  onCancellationNoteChange,
  noteError,
  onConfirmCancel,
}: IntakeCancelConfirmationProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className='gap-0 overflow-hidden p-0 sm:max-w-md'>
        <AlertDialogHeader className='border-border border-b p-6'>
          <div className='flex items-start gap-3'>
            <div className='border-destructive/25 bg-destructive/10 text-destructive mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-md border'>
              <CircleQuestionMark className='size-5' aria-hidden />
            </div>
            <div className='space-y-1.5'>
              <AlertDialogTitle className='text-foreground text-sm font-bold capitalize'>
                Cancel this intake assessment?
              </AlertDialogTitle>
              <AlertDialogDescription className='text-muted-foreground text-[13px] font-medium'>
                Cancelling stops this interview and marks the intake as
                cancelled. A brief note is required so your team has context on
                the intake record.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <div className='border-border/60 space-y-2 border-b px-6 py-4'>
          <TextAreaField
            label='Cancellation note'
            required
            value={cancellationNote}
            onChange={(event) => onCancellationNoteChange(event.target.value)}
            error={noteError}
            disabled={isSubmitting}
            placeholder='Reason for cancellation (visible on the intake record)'
          />
        </div>

        <AlertDialogFooter className='bg-muted/30 border-border gap-2 border-t p-4 sm:justify-end'>
          <AlertDialogCancel
            disabled={isSubmitting}
            className='text-foreground bg-background hover:bg-muted h-10 cursor-pointer gap-1.5 rounded-md border-neutral-300 px-3 text-[13px]! font-semibold'
          >
            Continue Interview
          </AlertDialogCancel>
          <Button
            type='button'
            variant='destructive'
            disabled={isSubmitting}
            className='border-destructive/45 h-10 cursor-pointer gap-1.5 rounded-md px-3 text-[13px]! font-semibold'
            onClick={onConfirmCancel}
          >
            <Ban className='size-3.5' />
            {isSubmitting ? 'Cancelling…' : 'Cancel Intake'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
