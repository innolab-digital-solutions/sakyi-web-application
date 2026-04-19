'use client';

import { SendHorizontal, Smartphone } from 'lucide-react';

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

export type SendContractConfirmationProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSubmitting: boolean;
  /** `first` = no prior send (`sent_at` empty). `resend` = notification already sent once. */
  variant: 'first' | 'resend';
  /** Shown in copy, e.g. first name or full name. */
  applicantName?: string | null;
  onConfirm: () => void;
};

/**
 * Confirms sending / resending the enrollment contract mobile notification (matches intake / enrollment dialog chrome).
 */
export default function SendContractConfirmation({
  open,
  onOpenChange,
  isSubmitting,
  variant,
  applicantName,
  onConfirm,
}: SendContractConfirmationProps) {
  const who = applicantName?.trim() || 'the applicant';

  const title =
    variant === 'first'
      ? 'Send enrollment contract?'
      : 'Resend contract notification?';

  const description =
    variant === 'first' ? (
      <>
        This sends a secure link to <strong>{who}</strong> by mobile
        notification so they can review and sign the enrollment contract. Only
        send when the intake is complete and you are ready for them to act.
      </>
    ) : (
      <>
        A contract notification was already sent to <strong>{who}</strong>.
        Sending again will deliver another mobile notification. Use this only if
        they did not receive the first message or you need to send a reminder.
      </>
    );

  const confirmLabel = variant === 'first' ? 'Send contract' : 'Send again';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className='gap-0 overflow-hidden p-0 sm:max-w-md'>
        <AlertDialogHeader className='border-border border-b p-6'>
          <div className='flex items-start gap-3'>
            <div className='bg-primary/10 border-primary/20 text-primary mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-md border'>
              <Smartphone className='size-5' aria-hidden />
            </div>
            <div className='space-y-1.5'>
              <AlertDialogTitle className='text-foreground/90 text-sm font-bold capitalize'>
                {title}
              </AlertDialogTitle>
              <AlertDialogDescription className='text-muted-foreground text-[13px] font-medium'>
                {description}
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
          <Button
            type='button'
            className='h-10 gap-1.5 rounded-md px-3 text-[13px]! font-semibold'
            disabled={isSubmitting}
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
          >
            <SendHorizontal className='size-3.5' aria-hidden />
            {isSubmitting ? 'Sending…' : confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
