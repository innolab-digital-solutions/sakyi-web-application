'use client';

import { AlertTriangleIcon, Ban } from 'lucide-react';

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

export type EnrollmentCancelConfirmationProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSubmitting: boolean;
  enrollmentReference?: string;
  cancellationNote: string;
  onCancellationNoteChange: (value: string) => void;
  noteError?: string;
  onConfirmCancel: () => void;
};

/** Confirmation dialog for cancelling a scheduled or active program enrollment. */
export default function EnrollmentCancelConfirmation({
  open,
  onOpenChange,
  isSubmitting,
  enrollmentReference,
  cancellationNote,
  onCancellationNoteChange,
  noteError,
  onConfirmCancel,
}: EnrollmentCancelConfirmationProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className='gap-0 overflow-hidden p-0 sm:max-w-md'>
        <AlertDialogHeader className='border-border border-b p-6'>
          <div className='flex items-start gap-3'>
            <div className='border-destructive/25 bg-destructive/10 text-destructive mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-md border'>
              <AlertTriangleIcon className='size-5' aria-hidden />
            </div>
            <div className='space-y-1.5'>
              <AlertDialogTitle className='text-foreground/90 text-sm font-bold capitalize'>
                Confirm Enrollment Cancellation?
              </AlertDialogTitle>
              <AlertDialogDescription className='text-muted-foreground text-[13px] font-medium'>
                This stops{' '}
                <span className='text-destructive text-xs font-semibold'>
                  {enrollmentReference?.trim() || 'this enrollment'}
                </span>{' '}
                before completion. Scheduled or active enrollments can be
                cancelled. Please add a brief note so your team has clear
                context on the enrollment record.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <div className='border-border/60 space-y-2 border-b px-6 py-4'>
          <TextAreaField
            label='Cancellation Note'
            required
            value={cancellationNote}
            onChange={(event) => onCancellationNoteChange(event.target.value)}
            error={noteError}
            disabled={isSubmitting}
            placeholder='Please provide a reason for cancellation'
            className='text-[13px]!'
          />
        </div>

        <AlertDialogFooter className='bg-muted/30 border-border gap-2 border-t p-4 sm:justify-end'>
          <AlertDialogCancel
            disabled={isSubmitting}
            className='text-foreground bg-background hover:bg-muted h-10 cursor-pointer gap-1.5 rounded-md border-neutral-300 px-3 text-[13px]! font-semibold'
          >
            Keep enrollment
          </AlertDialogCancel>
          <Button
            type='button'
            variant='destructive'
            disabled={isSubmitting}
            className='border-destructive/45 h-10 cursor-pointer gap-1.5 rounded-md px-3 text-[13px]! font-semibold'
            onClick={onConfirmCancel}
          >
            <Ban className='size-3.5' aria-hidden />
            {isSubmitting ? 'Cancelling…' : 'Cancel enrollment'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
