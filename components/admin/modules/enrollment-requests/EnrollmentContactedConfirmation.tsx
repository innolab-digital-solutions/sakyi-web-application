'use client';

import { CircleQuestionMark, PhoneCallIcon } from 'lucide-react';

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

type EnrollmentContactedConfirmationProps = {
  open: boolean;
  isSubmitting: boolean;
  requestReference?: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export default function EnrollmentContactedConfirmation({
  open,
  isSubmitting,
  requestReference,
  onOpenChange,
  onConfirm,
}: EnrollmentContactedConfirmationProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className='gap-0 overflow-hidden p-0 sm:max-w-md'>
        <AlertDialogHeader className='border-border border-b p-6'>
          <div className='flex items-start gap-3'>
            <div className='bg-primary/10 border-primary/20 text-primary mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-md border'>
              <CircleQuestionMark className='size-5' />
            </div>
            <div className='space-y-1.5'>
              <AlertDialogTitle className='text-foreground/90 text-sm font-bold capitalize'>
                Mark this request as contacted?
              </AlertDialogTitle>
              <AlertDialogDescription className='text-muted-foreground text-[13px] font-medium'>
                Apply this update after the applicant has been reached so the
                record reflects completed outreach. This sets{' '}
                <span className='text-primary text-xs font-semibold'>
                  {requestReference || 'the selected enrollment request'}
                </span>{' '}
                to contacted so follow-up is visible to the team and intake can
                proceed.
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
            <PhoneCallIcon className='size-3.5' />
            {isSubmitting ? 'Updating status...' : 'Mark as contacted'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
