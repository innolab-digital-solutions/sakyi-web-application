'use client';

import { CircleQuestionMark, NotebookPenIcon } from 'lucide-react';

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

type OperationalLogDraftConfirmationProps = {
  open: boolean;
  isSubmitting: boolean;
  carePlanReference: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

/**
 * Confirms creation of a draft operational log (default period = care plan range), then opens the
 * care plan workspace.
 */
export default function OperationalLogDraftConfirmation({
  open,
  isSubmitting,
  carePlanReference,
  onOpenChange,
  onConfirm,
}: OperationalLogDraftConfirmationProps) {
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
                Create Operational Log?
              </AlertDialogTitle>
              <AlertDialogDescription className='text-muted-foreground text-[13px] font-medium'>
                This creates a new draft operational log for this care plan{' '}
                <span className='text-primary text-xs font-semibold'>
                  {carePlanReference.trim()}
                </span>
                . The entry appears in the operational logs list and uses this
                care plan’s covered period. You will continue in the care plan
                workspace to add internal metrics and supporting detail.
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
            <NotebookPenIcon className='size-3.5' aria-hidden />
            {isSubmitting ? 'Creating…' : 'Create and Open Workspace'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
