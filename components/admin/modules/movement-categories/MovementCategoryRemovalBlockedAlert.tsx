'use client';

import { FileLockIcon } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

type MovementCategoryRemovalBlockedAlertProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryName: string | undefined;
  reason: string | undefined;
};

export default function MovementCategoryRemovalBlockedAlert({
  open,
  onOpenChange,
  categoryName,
  reason,
}: MovementCategoryRemovalBlockedAlertProps) {
  const displayName = categoryName?.trim() || 'This category';
  const detail =
    reason?.trim() ||
    'This movement category is currently referenced in active records and cannot be removed.';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className='gap-0 overflow-hidden p-0 sm:max-w-md'>
        <AlertDialogHeader className='border-border border-b p-6'>
          <div className='flex items-start gap-3'>
            <div className='mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-amber-500/30 bg-amber-500/10 text-amber-700'>
              <FileLockIcon className='size-5' aria-hidden />
            </div>
            <div className='space-y-1.5'>
              <AlertDialogTitle className='text-foreground text-sm font-bold capitalize'>
                Movement Category Removal Blocked
              </AlertDialogTitle>
              <AlertDialogDescription className='text-muted-foreground text-[13px] font-medium'>
                <strong className='font-semibold text-amber-600'>
                  {displayName}
                </strong>{' '}
                cannot be removed right now. {detail}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className='bg-muted/30 border-border gap-2 border-t p-4 sm:justify-end'>
          <Button
            type='button'
            variant='outline'
            className='text-foreground bg-background hover:bg-muted h-10 cursor-pointer gap-1.5 rounded-md border-neutral-300 px-3 text-[13px]! font-semibold'
            onClick={() => onOpenChange(false)}
          >
            Got it
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
