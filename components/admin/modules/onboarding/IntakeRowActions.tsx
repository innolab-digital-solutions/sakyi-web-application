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

const viewDetailButtonClass =
  'normal-case bg-background hover:bg-muted text-foreground h-9 shrink-0 gap-1.5 rounded-md border-neutral-300 px-2.5 text-[13px]! font-semibold';

const mainActionButtonClass =
  'normal-case h-9 shrink-0 gap-1.5 px-2.5 text-[13px]! font-semibold';

const moreTriggerClass =
  'bg-background hover:bg-muted text-foreground/80 size-9 shrink-0 rounded-md border-neutral-300';

export type IntakeRowActionsProps = {
  intake: OnboardingIntakeData;
  onSendContract: () => void;
  isSendingContract: boolean;
};

type PrimaryAction = 'continue' | 'send' | 'view';

function getPrimaryAction(intake: OnboardingIntakeData): PrimaryAction {
  if (canContinueInterview(intake)) return 'continue';
  if (canSendContract(intake)) return 'send';
  return 'view';
}

/** Exposes the top workflow action (continue → send → view); everything else under ⋯. */
export default function IntakeRowActions({
  intake,
  onSendContract,
  isSendingContract,
}: IntakeRowActionsProps) {
  const referenceText = getIntakeReference(intake);
  const primary = getPrimaryAction(intake);
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

  const showViewInMenu = primary !== 'view';
  const showContinueInMenu = primary !== 'continue' && showContinue;
  const showSendInMenu = primary !== 'send' && showSend;
  const hasMenuAfterCopy =
    showViewInMenu || showContinueInMenu || showSendInMenu;

  return (
    <div className='flex items-center justify-end gap-1.5'>
      {primary === 'continue' ? (
        <Button
          variant='default'
          size='sm'
          className={mainActionButtonClass}
          asChild
        >
          <Link
            href={ROUTES.ADMIN.MODULES.INTAKE_ASSESSMENTS.INTERVIEW(
              String(intake.id),
            )}
            className='inline-flex items-center gap-1.5'
          >
            <SquarePenIcon className='size-3.5 shrink-0' />
            Continue interview
          </Link>
        </Button>
      ) : null}
      {primary === 'send' ? (
        <Button
          type='button'
          variant='default'
          size='sm'
          className={mainActionButtonClass}
          disabled={sendDisabled}
          onClick={() => {
            if (!sendDisabled) onSendContract();
          }}
        >
          <SendHorizontal className='size-3.5 shrink-0' />
          Send contract
        </Button>
      ) : null}
      {primary === 'view' ? (
        <Button
          variant='outline'
          size='sm'
          className={viewDetailButtonClass}
          asChild
        >
          <Link
            href={ROUTES.ADMIN.MODULES.INTAKE_ASSESSMENTS.DETAIL(
              String(intake.id),
            )}
            className='inline-flex items-center gap-1.5'
          >
            <EyeIcon className='size-3.5 shrink-0' />
            View detail
          </Link>
        </Button>
      ) : null}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type='button'
            variant='outline'
            size='icon'
            className={moreTriggerClass}
            aria-label='More actions'
          >
            <MoreHorizontalIcon className='size-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='min-w-52'>
          <DropdownMenuLabel className='text-foreground/70 space-y-1 px-2 py-1.5 text-[11px]! font-bold tracking-wide uppercase'>
            More Options
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className='flex cursor-pointer items-center gap-2 text-[13px]! font-medium'
            onClick={handleCopyReference}
          >
            <ClipboardCopyIcon className='size-3.5 shrink-0' />
            Copy reference
          </DropdownMenuItem>
          {hasMenuAfterCopy ? (
            <>
              <DropdownMenuSeparator />
              {showViewInMenu ? (
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
              ) : null}
              {showContinueInMenu ? (
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
              {showSendInMenu ? (
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
    </div>
  );
}
