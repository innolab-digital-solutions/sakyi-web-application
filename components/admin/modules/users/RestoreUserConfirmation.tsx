'use client';

import { CircleQuestionMark, RotateCcwIcon } from 'lucide-react';

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

export type RestoreUserConfirmationProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string | undefined;
  isRestoring: boolean;
  onConfirm: () => void;
};

export default function RestoreUserConfirmation({
  open,
  onOpenChange,
  userName,
  isRestoring,
  onConfirm,
}: RestoreUserConfirmationProps) {
  const displayName = userName?.trim() || 'This user';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className='gap-0 overflow-hidden p-0 sm:max-w-md'>
        <AlertDialogHeader className='border-border border-b p-6'>
          <div className='flex items-start gap-3'>
            <div className='bg-primary/10 border-primary/20 text-primary mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-md border'>
              <CircleQuestionMark className='size-5' aria-hidden />
            </div>
            <div className='space-y-1.5'>
              <AlertDialogTitle className='text-foreground text-sm font-bold capitalize'>
                Restore this user account?
              </AlertDialogTitle>
              <AlertDialogDescription className='text-muted-foreground text-[13px] font-medium'>
                Restore{' '}
                <strong className='text-primary text-xs font-semibold'>
                  {displayName}
                </strong>{' '}
                so they can sign in again. Enrollments and care history remain
                as they were.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className='bg-muted/30 border-border gap-2 border-t p-4 sm:justify-end'>
          <AlertDialogCancel
            disabled={isRestoring}
            className='text-foreground bg-background hover:bg-muted h-10 gap-1.5 rounded-md border-neutral-300 px-3 text-[13px]! font-semibold'
          >
            Cancel
          </AlertDialogCancel>
          <Button
            type='button'
            disabled={isRestoring}
            className='h-10 cursor-pointer gap-1.5 rounded-md px-3 text-[13px]! font-semibold'
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
          >
            <RotateCcwIcon className='size-3.5' aria-hidden />
            {isRestoring ? 'Restoring…' : 'Restore'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
