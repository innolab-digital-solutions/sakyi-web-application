'use client';

import { AlertTriangleIcon, Trash2 } from 'lucide-react';

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

export type ForceDeleteUserConfirmationProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string | undefined;
  isDeleting: boolean;
  onConfirm: () => void;
};

export default function ForceDeleteUserConfirmation({
  open,
  onOpenChange,
  userName,
  isDeleting,
  onConfirm,
}: ForceDeleteUserConfirmationProps) {
  const displayName = userName?.trim() || 'This user';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className='gap-0 overflow-hidden p-0 sm:max-w-md'>
        <AlertDialogHeader className='border-border border-b p-6'>
          <div className='flex items-start gap-3'>
            <div className='border-destructive/25 bg-destructive/10 text-destructive mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-md border'>
              <AlertTriangleIcon className='size-5' aria-hidden />
            </div>
            <div className='space-y-1.5'>
              <AlertDialogTitle className='text-foreground text-sm font-bold capitalize'>
                Delete this account permanently?
              </AlertDialogTitle>
              <AlertDialogDescription className='text-muted-foreground text-[13px] font-medium'>
                Permanently delete{' '}
                <strong className='text-destructive font-semibold'>
                  {displayName}
                </strong>{' '}
                and all related records (enrollments, care plans, and other
                linked data). This cannot be undone.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className='bg-muted/30 border-border gap-2 border-t p-4 sm:justify-end'>
          <AlertDialogCancel
            disabled={isDeleting}
            className='text-foreground bg-background hover:bg-muted h-10 gap-1.5 rounded-md border-neutral-300 px-3 text-[13px]! font-semibold'
          >
            Cancel
          </AlertDialogCancel>
          <Button
            type='button'
            variant='destructive'
            disabled={isDeleting}
            className='border-destructive/45 h-10 cursor-pointer gap-1.5 rounded-md px-3 text-[13px]! font-semibold'
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
          >
            <Trash2 className='size-3.5' aria-hidden />
            {isDeleting ? 'Deleting…' : 'Delete permanently'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
