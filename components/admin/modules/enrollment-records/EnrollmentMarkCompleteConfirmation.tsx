'use client';

import { CircleCheckIcon, CircleQuestionMark } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export type EnrollmentMarkCompleteConfirmationProps = {
  open: boolean;
  isSubmitting: boolean;
  enrollmentReference?: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

/** Confirmation dialog for marking an active program enrollment as complete. */
export default function EnrollmentMarkCompleteConfirmation({
  open,
  isSubmitting,
  enrollmentReference,
  onOpenChange,
  onConfirm,
}: EnrollmentMarkCompleteConfirmationProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className='gap-0 overflow-hidden p-0 sm:max-w-md'>
        <AlertDialogHeader className='border-border border-b p-6'>
          <div className='flex items-start gap-3'>
            <div className='bg-primary/10 border-primary/20 text-primary mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-md border'>
              <CircleQuestionMark className='size-5' aria-hidden />
            </div>
            <div className='space-y-1.5'>
              <AlertDialogTitle className='text-foreground/90 text-sm font-bold capitalize'>
                Mark enrollment as complete?
              </AlertDialogTitle>
              <AlertDialogDescription className='text-muted-foreground text-[13px] font-medium'>
                This sets{' '}
                <span className='text-primary text-xs font-semibold'>
                  {enrollmentReference?.trim() || 'this enrollment'}
                </span>{' '}
                to completed. Use this when the participant has finished the
                program and you are recording completion manually.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className='bg-muted/30 border-border gap-2 border-t p-4 sm:justify-end'>
          <AlertDialogCancel
            disabled={isSubmitting}
            className='text-foreground bg-background hover:bg-muted h-10 gap-1.5 rounded-md border-neutral-300 px-3 text-[13px]! font-semibold'
          >
            Not now
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isSubmitting}
            className='h-10 gap-1.5 rounded-md px-3 text-[13px]! font-semibold'
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
          >
            <CircleCheckIcon className='size-3.5' aria-hidden />
            {isSubmitting ? 'Updating…' : 'Mark as complete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
