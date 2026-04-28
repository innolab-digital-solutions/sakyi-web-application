'use client';

import { AlertTriangleIcon, EyeIcon } from 'lucide-react';
import Link from 'next/link';

import {
  wizardOutlineButtonClass,
  wizardPrimaryButtonClass,
} from '@/components/admin/modules/enrollmentWizardModalUi';
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
import { ROUTES } from '@/config/routes';

type CarePlanActivateEnrollmentPrerequisiteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  carePlanReference?: string;
  enrollmentReference?: string;
  enrollmentId?: number | null;
};

/**
 * Shown when the user tries to activate a care plan while the program enrollment
 * is still `scheduled` — the enrollment must be activated first.
 */
export default function CarePlanActivateEnrollmentPrerequisiteDialog({
  open,
  onOpenChange,
  carePlanReference,
  enrollmentReference,
  enrollmentId,
}: CarePlanActivateEnrollmentPrerequisiteDialogProps) {
  const enrollmentRef =
    enrollmentReference?.trim() || 'this enrollment program';

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
                Enrollment Activation Required
              </AlertDialogTitle>
              <AlertDialogDescription className='text-muted-foreground text-[13px] font-medium'>
                <span className='text-xs font-semibold text-amber-600'>
                  {carePlanReference || 'This care plan'}
                </span>{' '}
                cannot be activated while the program enrollment is still
                <span className='text-foreground/90 font-semibold'>
                  {' '}
                  “scheduled”
                </span>
                . Activate{' '}
                <span className='text-xs font-semibold text-amber-600'>
                  {enrollmentRef}
                </span>{' '}
                to active in the enrollment record, then return here to activate
                the care plan. This helps avoid a mismatch where the care plan
                is live before the program enrollment has started.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter className='bg-muted/30 border-border flex flex-col gap-2 border-t p-4 sm:flex-row sm:items-center sm:justify-end'>
          <AlertDialogCancel className={wizardOutlineButtonClass}>
            Got it
          </AlertDialogCancel>
          {enrollmentId != null ? (
            <Button type='button' className={wizardPrimaryButtonClass} asChild>
              <Link
                href={ROUTES.ADMIN.MODULES.ENROLLMENT_RECORDS.DETAIL(
                  String(enrollmentId),
                )}
                onClick={() => onOpenChange(false)}
              >
                <EyeIcon className='size-3.5 shrink-0' />
                View Enrollment
              </Link>
            </Button>
          ) : null}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
