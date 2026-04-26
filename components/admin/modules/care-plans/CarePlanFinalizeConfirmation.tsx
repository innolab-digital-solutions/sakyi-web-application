'use client';

import { CheckCircle2Icon, CircleQuestionMark, ScanTextIcon } from 'lucide-react';

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
import { Button } from '@/components/ui/button';

export type CarePlanFinalizeConfirmationProps = {
  open: boolean;
  isValidating: boolean;
  planReference?: string;
  hasValidationResult: boolean;
  onOpenChange: (open: boolean) => void;
  onValidate: () => void;
  onFinalize: () => void;
};

export default function CarePlanFinalizeConfirmation({
  open,
  isValidating,
  planReference,
  hasValidationResult,
  onOpenChange,
  onValidate,
  onFinalize,
}: CarePlanFinalizeConfirmationProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className='gap-0 overflow-hidden p-0 sm:max-w-lg'>
        <AlertDialogHeader className='border-border border-b p-6'>
          <div className='flex items-start gap-3'>
            <div className='bg-primary/10 border-primary/20 text-primary mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-md border'>
              <CircleQuestionMark className='size-5' aria-hidden />
            </div>
            <div className='space-y-1.5'>
              <AlertDialogTitle className='text-foreground/90 text-sm font-bold'>
                Finalize This Care Plan?
              </AlertDialogTitle>
              <AlertDialogDescription className='text-muted-foreground text-[13px] font-medium'>
                You have reached the last scheduled day and section for{' '}
                <span className='text-primary text-xs font-semibold'>
                  {planReference?.trim() || 'this care plan'}
                </span>
                . Run validation before finalizing to confirm this draft is ready
                for activation. If validation fails, activation will be blocked
                until the reported issues are fixed.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter className='bg-muted/30 border-border gap-2 border-t p-4 sm:justify-between'>
          <div className='flex flex-wrap gap-2'>
            <Button
              type='button'
              variant='outline'
              disabled={isValidating}
              className='text-foreground bg-background hover:bg-muted h-10 gap-1.5 rounded-md border-neutral-300 px-3 text-[13px]! font-semibold'
              onClick={onValidate}
            >
              <ScanTextIcon className='size-3.5' aria-hidden />
              {isValidating
                ? 'Validating…'
                : hasValidationResult
                  ? 'Run Check Again'
                  : 'Validate Now'}
            </Button>
          </div>
          <div className='flex flex-wrap gap-2'>
            <AlertDialogCancel
              disabled={isValidating}
              className='text-foreground bg-background hover:bg-muted h-10 gap-1.5 rounded-md border-neutral-300 px-3 text-[13px]! font-semibold'
            >
              Keep Editing
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isValidating}
              className='h-10 gap-1.5 rounded-md px-3 text-[13px]! font-semibold'
              onClick={(event) => {
                event.preventDefault();
                onFinalize();
              }}
            >
              <CheckCircle2Icon className='size-3.5' aria-hidden />
              Finalize Care Plan
            </AlertDialogAction>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
