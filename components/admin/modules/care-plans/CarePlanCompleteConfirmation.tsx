'use client';

import { CheckCircle2Icon, CircleQuestionMark } from 'lucide-react';

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
import type { CarePlanValidationIssue } from '@/domains/care-plans/types/admin';

type ValidationResult = {
  is_valid: boolean;
  issues: CarePlanValidationIssue[];
} | null;

export type CarePlanCompleteConfirmationProps = {
  open: boolean;
  isValidating: boolean;
  planReference?: string;
  validationResult: ValidationResult;
  onOpenChange: (open: boolean) => void;
  onValidate: () => void;
  onViewDetail: () => void;
  onBackToList: () => void;
};

export default function CarePlanCompleteConfirmation({
  open,
  isValidating,
  planReference,
  validationResult,
  onOpenChange,
  onValidate,
  onViewDetail,
  onBackToList,
}: CarePlanCompleteConfirmationProps) {
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
                Complete care plan draft?
              </AlertDialogTitle>
              <AlertDialogDescription className='text-muted-foreground text-[13px] font-medium'>
                You have reached the final day and section for{' '}
                <span className='text-primary text-xs font-semibold'>
                  {planReference?.trim() || 'this care plan'}
                </span>
                . Validate now to confirm the draft is ready before activation.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <div className='p-6'>
          {validationResult == null ? (
            <p className='text-muted-foreground text-[13px] font-medium'>
              Validation has not been run yet.
            </p>
          ) : validationResult.is_valid ? (
            <div className='rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-[13px] font-medium text-emerald-800'>
              No validation issues found. This care plan is ready for
              activation.
            </div>
          ) : (
            <div className='space-y-2'>
              <div className='rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] font-medium text-amber-900'>
                Found {validationResult.issues.length} validation issue
                {validationResult.issues.length === 1 ? '' : 's'}.
              </div>
              <ul className='text-muted-foreground list-disc space-y-1 pl-5 text-[13px]'>
                {validationResult.issues.slice(0, 6).map((issue, idx) => (
                  <li key={`${issue.field}-${idx}`}>{issue.message}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <AlertDialogFooter className='bg-muted/30 border-border gap-2 border-t p-4 sm:justify-between'>
          <div className='flex flex-wrap gap-2'>
            <Button
              type='button'
              variant='outline'
              disabled={isValidating}
              className='text-foreground bg-background hover:bg-muted h-10 gap-1.5 rounded-md border-neutral-300 px-3 text-[13px]! font-semibold'
              onClick={onViewDetail}
            >
              View Detail
            </Button>
            <Button
              type='button'
              variant='outline'
              disabled={isValidating}
              className='text-foreground bg-background hover:bg-muted h-10 gap-1.5 rounded-md border-neutral-300 px-3 text-[13px]! font-semibold'
              onClick={onBackToList}
            >
              Back to List
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
                onValidate();
              }}
            >
              <CheckCircle2Icon className='size-3.5' aria-hidden />
              {isValidating ? 'Validating…' : 'Validate Now'}
            </AlertDialogAction>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
