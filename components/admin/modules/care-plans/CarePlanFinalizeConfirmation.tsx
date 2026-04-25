'use client';

import {
  CheckCircle2Icon,
  CircleQuestionMark,
  InfoIcon,
  ScanTextIcon,
  ShieldAlertIcon,
} from 'lucide-react';
import * as React from 'react';

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

export type CarePlanFinalizeConfirmationProps = {
  open: boolean;
  isValidating: boolean;
  planReference?: string;
  validationResult: ValidationResult;
  onOpenChange: (open: boolean) => void;
  onValidate: () => void;
  onFinalize: () => void;
};

export default function CarePlanFinalizeConfirmation({
  open,
  isValidating,
  planReference,
  validationResult,
  onOpenChange,
  onValidate,
  onFinalize,
}: CarePlanFinalizeConfirmationProps) {
  const [showAllIssues, setShowAllIssues] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      queueMicrotask(() => {
        setShowAllIssues(false);
      });
    }
  }, [open]);

  React.useEffect(() => {
    queueMicrotask(() => {
      setShowAllIssues(false);
    });
  }, [validationResult?.is_valid, validationResult?.issues.length]);

  const visibleIssues =
    validationResult && !validationResult.is_valid
      ? showAllIssues
        ? validationResult.issues
        : validationResult.issues.slice(0, 3)
      : [];
  const hiddenIssueCount =
    validationResult && !validationResult.is_valid
      ? Math.max(validationResult.issues.length - visibleIssues.length, 0)
      : 0;

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
                You have reached the final day and section for{' '}
                <span className='text-primary text-xs font-semibold'>
                  {planReference?.trim() || 'this care plan'}
                </span>
                . Validate now to confirm the draft is ready before activation,
                then finalize this editing session.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <div className='p-6'>
          {validationResult == null ? (
            <div className='bg-muted/35 border-border rounded-md border p-4'>
              <div className='flex items-start gap-2.5'>
                <div className='bg-background text-muted-foreground inline-flex size-7 shrink-0 items-center justify-center rounded-md border'>
                  <InfoIcon className='size-3.5' aria-hidden />
                </div>
                <div className='space-y-1'>
                  <p className='text-foreground text-[13px] font-semibold'>
                    Validation has not been run yet.
                  </p>
                  <p className='text-muted-foreground text-[12.5px] font-medium'>
                    Run a validation check to review missing details before
                    finalizing this draft.
                  </p>
                </div>
              </div>
            </div>
          ) : validationResult.is_valid ? (
            <div className='rounded-md border border-emerald-200 bg-emerald-50 p-4'>
              <div className='flex items-start gap-2.5'>
                <div className='inline-flex size-7 shrink-0 items-center justify-center rounded-md border border-emerald-200 bg-white/80 text-emerald-700'>
                  <CheckCircle2Icon className='size-3.5' aria-hidden />
                </div>
                <div className='space-y-1'>
                  <p className='text-[13px] font-semibold text-emerald-900'>
                    Validation complete. No issues found.
                  </p>
                  <p className='text-[12.5px] font-medium text-emerald-800/90'>
                    This care plan draft is fully reviewed and ready for
                    activation.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className='space-y-3'>
              <div className='rounded-md border border-amber-200 bg-amber-50 p-4'>
                <div className='flex items-start gap-2.5'>
                  <div className='inline-flex size-7 shrink-0 items-center justify-center rounded-md border border-amber-200 bg-white/80 text-amber-700'>
                    <ShieldAlertIcon className='size-3.5' aria-hidden />
                  </div>
                  <div className='space-y-1'>
                    <p className='text-[13px] font-semibold text-amber-900'>
                      Found {validationResult.issues.length} validation reminder
                      {validationResult.issues.length === 1 ? '' : 's'}.
                    </p>
                    <p className='text-[12.5px] font-medium text-amber-800/90'>
                      You can still finalize this draft, but reviewing these
                      items helps prevent missed plan details.
                    </p>
                  </div>
                </div>
              </div>
              <ul className='text-foreground/80 list-disc space-y-2 pl-5 text-xs font-medium'>
                {visibleIssues.map((issue, idx) => (
                  <li key={`${issue.field}-${idx}`}>{issue.message}</li>
                ))}
              </ul>

              <div className='px-5'>
                {hiddenIssueCount > 0 ? (
                  <button
                    type='button'
                    className='text-primary hover:text-primary/80 text-xs font-semibold underline-offset-2 hover:underline'
                    onClick={() => setShowAllIssues(true)}
                  >
                    Show {hiddenIssueCount} more reminder
                    {hiddenIssueCount === 1 ? '' : 's'}
                  </button>
                ) : validationResult.issues.length > 3 ? (
                  <button
                    type='button'
                    className='text-primary hover:text-primary/80 text-xs font-semibold underline-offset-2 hover:underline'
                    onClick={() => setShowAllIssues(false)}
                  >
                    Show fewer reminders
                  </button>
                ) : null}
              </div>
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
              onClick={onValidate}
            >
              <ScanTextIcon className='size-3.5' aria-hidden />
              {isValidating
                ? 'Validating…'
                : validationResult == null
                  ? 'Validate Now'
                  : 'Run Check Again'}
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
