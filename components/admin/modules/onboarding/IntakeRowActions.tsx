'use client';

import {
  ClipboardCopyIcon,
  EyeIcon,
  MoreHorizontalIcon,
  SendHorizontal,
  SquarePenIcon,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ROUTES } from '@/config/routes';
import type { OnboardingIntakeData } from '@/domains/intake-assessments/types';

function getIntakeReference(intake: OnboardingIntakeData): string {
  const code = intake.code?.trim();
  if (code) return code;
  return `#${intake.id}`;
}

function canContinueInterview(intake: OnboardingIntakeData): boolean {
  return intake.status !== 'completed' && intake.status !== 'cancelled';
}

function canSendContract(intake: OnboardingIntakeData): boolean {
  return (
    intake.status === 'completed' && !intake.enrollment_contract?.signed_at
  );
}

export type IntakeRowActionsProps = {
  intake: OnboardingIntakeData;
  onSendContract: () => void;
  isSendingContract: boolean;
};

/** Matches {@link EnrollmentRequestRowActions} menu pattern for admin tables. */
export default function IntakeRowActions({
  intake,
  onSendContract,
  isSendingContract,
}: IntakeRowActionsProps) {
  const referenceText = getIntakeReference(intake);
  const showContinue = canContinueInterview(intake);
  const showSend = canSendContract(intake);
  const enrollmentRequestId = intake.enrollment_request?.id ?? null;
  const sendDisabled = enrollmentRequestId == null || isSendingContract;

  const handleCopyReference = () => {
    void (async () => {
      try {
        await navigator.clipboard.writeText(referenceText);
        toast.success('Reference copied to clipboard.');
      } catch {
        toast.error('Could not copy reference.');
      }
    })();
  };

  const hasSecondary = showContinue || showSend;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type='button'
          variant='outline'
          size='sm'
          className='bg-background hover:bg-muted text-foreground/80 h-9 w-full gap-1.5 rounded-md border-neutral-300 px-3 text-[13px]! font-semibold sm:w-auto'
          aria-label='Row actions'
        >
          <MoreHorizontalIcon className='size-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='min-w-52'>
        <DropdownMenuLabel className='text-foreground/90 space-y-1 px-2 py-1.5 text-xs font-semibold tracking-wide'>
          <span className='text-muted-foreground block font-medium tracking-normal capitalize'>
            Intake Assessment Code
          </span>
          <span className='text-foreground/80 text-xs tracking-tight'>
            {referenceText}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className='cursor-pointer'>
          <Link
            className='flex w-full cursor-pointer items-center gap-2 text-[13px]! font-medium'
            href={ROUTES.ADMIN.MODULES.INTAKE_ASSESSMENTS.DETAIL(
              String(intake.id),
            )}
          >
            <EyeIcon className='size-3.5 shrink-0' />
            View detail
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          className='flex cursor-pointer items-center gap-2 text-[13px]! font-medium'
          onClick={handleCopyReference}
        >
          <ClipboardCopyIcon className='size-3.5 shrink-0' />
          Copy reference
        </DropdownMenuItem>
        {hasSecondary ? (
          <>
            <DropdownMenuSeparator />
            {showContinue ? (
              <DropdownMenuItem asChild className='cursor-pointer'>
                <Link
                  className='flex w-full cursor-pointer items-center gap-2 text-[13px]! font-medium'
                  href={ROUTES.ADMIN.MODULES.INTAKE_ASSESSMENTS.INTERVIEW(
                    String(intake.id),
                  )}
                >
                  <SquarePenIcon className='size-3.5 shrink-0' />
                  Continue interview
                </Link>
              </DropdownMenuItem>
            ) : null}
            {showSend ? (
              <DropdownMenuItem
                className='flex cursor-pointer items-center gap-2 text-[13px]! font-medium'
                disabled={sendDisabled}
                onClick={() => {
                  if (!sendDisabled) onSendContract();
                }}
              >
                <SendHorizontal className='size-3.5 shrink-0' />
                Send contract
              </DropdownMenuItem>
            ) : null}
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
