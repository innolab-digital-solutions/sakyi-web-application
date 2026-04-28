'use client';

import { AlertTriangleIcon } from 'lucide-react';

import { wizardOutlineButtonClass } from '@/components/admin/modules/enrollmentWizardModalUi';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export type ActivePlanSummary = {
  id: number;
  code: string;
  starts_on: string | null;
  ends_on: string | null;
};

type CarePlanActivateActivePlanExistsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The draft care plan the user tried to activate. */
  draftCarePlanReference?: string;
  /** The care plan that is currently active for this enrollment. */
  activePlan: ActivePlanSummary | null;
  enrollmentReference?: string;
};

function formatPlanLabel(plan: ActivePlanSummary): string {
  const code = plan.code?.trim();
  if (code) return code;
  return `Care plan #${plan.id}`;
}

/**
 * Shown when activating a draft care plan is not allowed because this enrollment
 * already has another active care plan. Only one active plan per enrollment at a time.
 */
export default function CarePlanActivateActivePlanExistsDialog({
  open,
  onOpenChange,
  draftCarePlanReference,
  activePlan,
  enrollmentReference,
}: CarePlanActivateActivePlanExistsDialogProps) {
  const activeLabel = activePlan
    ? formatPlanLabel(activePlan)
    : 'another care plan';
  const draftLabel = draftCarePlanReference?.trim() || 'This draft care plan';
  const enrollmentLabel = enrollmentReference?.trim() || 'this enrollment';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className='gap-0 overflow-hidden p-0 sm:max-w-md'>
        <AlertDialogHeader className='border-border border-b p-6'>
          <div className='flex items-start gap-3'>
            <div className='mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-amber-500/25 bg-amber-500/10 text-amber-700'>
              <AlertTriangleIcon className='size-5' aria-hidden />
            </div>
            <div className='space-y-1.5'>
              <AlertDialogTitle className='text-foreground/90 text-sm font-bold'>
                Another Care Plan Is Already Active
              </AlertDialogTitle>
              <AlertDialogDescription className='text-muted-foreground text-[13px] font-medium'>
                <span className='text-xs font-semibold text-amber-600'>
                  {draftLabel}
                </span>{' '}
                cannot be activated because{' '}
                <span className='text-xs font-semibold text-amber-600'>
                  {activeLabel}
                </span>{' '}
                is already the active care plan for this enrollment{' '}
                <span className='text-foreground/90 text-xs font-semibold'>
                  {enrollmentLabel}
                </span>{' '}
                . Complete, cancel, or replace that plan before activating a
                different one. This keeps the client on a single authoritative
                schedule at a time.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter className='bg-muted/30 border-border flex flex-col gap-2 border-t p-4 sm:flex-row sm:items-center sm:justify-end'>
          <AlertDialogCancel className={wizardOutlineButtonClass}>
            Got it
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
