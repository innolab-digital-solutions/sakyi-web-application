'use client';

import { CircleQuestionMark, Save } from 'lucide-react';

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

export type SaveCarePlanDataConfirmationProps = {
  open: boolean;
  isSubmitting: boolean;
  /** Optional care plan code shown for reference. */
  carePlanCode?: string | null;
  /** When true, warn that save updates the live published client report. */
  isPublishedCorrection?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

/**
 * Confirmation before persisting operational-log metrics and daily breakdown data.
 * Matches {@link OnboardingCompleteConfirmation} layout and tone.
 */
export default function SaveCarePlanDataConfirmation({
  open,
  isSubmitting,
  carePlanCode,
  isPublishedCorrection = false,
  onOpenChange,
  onConfirm,
}: SaveCarePlanDataConfirmationProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className='gap-0 overflow-hidden p-0 sm:max-w-md'>
        <AlertDialogHeader className='border-border border-b p-6'>
          <div className='flex items-start gap-3'>
            <div className='bg-primary/10 border-primary/20 text-primary mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-md border'>
              <CircleQuestionMark className='size-5' aria-hidden />
            </div>
            <div className='space-y-1.5'>
              <AlertDialogTitle className='text-foreground/90 text-sm font-bold'>
                Save This Operational Log?
              </AlertDialogTitle>
              <AlertDialogDescription className='text-muted-foreground text-[13px] font-medium'>
                You are about to save this period&apos;s metric and daily
                breakdown data to this operational log for{' '}
                <span className='text-primary text-xs font-semibold tabular-nums'>
                  {carePlanCode?.trim() || 'this care plan'}
                </span>
                .{' '}
                {isPublishedCorrection
                  ? 'This report is live on the client app. Saving will update the numbers the client already sees. It will not create a new report.'
                  : 'Check targets, actuals, and each day\u2019s values carefully: this data is reused in period reports, adherence summaries, and downstream workflows, and mistakes are hard to unwind later.'}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className='bg-muted/30 border-border gap-2 border-t p-4 sm:justify-end'>
          <AlertDialogCancel
            disabled={isSubmitting}
            className='text-foreground bg-background hover:bg-muted h-10 gap-1.5 rounded-md border-neutral-300 px-3 text-[13px]! font-semibold'
          >
            Keep editing
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isSubmitting}
            className='h-10 gap-1.5 rounded-md px-3 text-[13px]! font-semibold'
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
          >
            <Save className='size-3.5' aria-hidden />
            {isSubmitting ? 'Saving…' : 'Save operational log'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
