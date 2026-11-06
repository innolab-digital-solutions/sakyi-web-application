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

type PeriodReportPublishBlockedAlertProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportReference?: string;
  carePlanEndDateLabel?: string;
};

export default function PeriodReportPublishBlockedAlert({
  open,
  onOpenChange,
  reportReference,
  carePlanEndDateLabel,
}: PeriodReportPublishBlockedAlertProps) {
  const reportLabel = reportReference?.trim() || 'This report';
  const endDateLabel = carePlanEndDateLabel?.trim() || 'the care plan end date';

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
                Report Publish Blocked
              </AlertDialogTitle>
              <AlertDialogDescription className='text-muted-foreground text-[13px] font-medium'>
                <span className='text-xs font-semibold text-amber-600'>
                  {reportLabel}
                </span>{' '}
                cannot be published yet. Publishing is allowed only after the
                care plan period ends. This care plan reaches its end date on{' '}
                <strong className='text-amber-700'>{endDateLabel}</strong>.
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
