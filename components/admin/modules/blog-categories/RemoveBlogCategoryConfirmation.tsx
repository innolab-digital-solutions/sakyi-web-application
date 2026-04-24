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

export type RemoveBlogCategoryConfirmationProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryName: string | undefined;
  isRemoving: boolean;
  onConfirm: () => void;
};

export default function RemoveBlogCategoryConfirmation({
  open,
  onOpenChange,
  categoryName,
  isRemoving,
  onConfirm,
}: RemoveBlogCategoryConfirmationProps) {
  const displayName = categoryName?.trim() || 'This category';

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
                Remove this blog category?
              </AlertDialogTitle>
              <AlertDialogDescription className='text-muted-foreground text-[13px] font-medium'>
                This will permanently remove{' '}
                <strong className='text-foreground font-semibold'>
                  {displayName}
                </strong>{' '}
                from your blog category library. This action cannot be undone.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className='bg-muted/30 border-border gap-2 border-t p-4 sm:justify-end'>
          <AlertDialogCancel
            disabled={isRemoving}
            className='text-foreground bg-background hover:bg-muted h-10 gap-1.5 rounded-md border-neutral-300 px-3 text-[13px]! font-semibold'
          >
            Cancel
          </AlertDialogCancel>
          <Button
            type='button'
            variant='destructive'
            disabled={isRemoving}
            className='border-destructive/45 h-10 cursor-pointer gap-1.5 rounded-md px-3 text-[13px]! font-semibold'
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
          >
            <Trash2 className='size-3.5' aria-hidden />
            {isRemoving ? 'Removing…' : 'Remove'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
