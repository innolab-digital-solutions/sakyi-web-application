'use client';

import {
  ClipboardCopyIcon,
  ClipboardListIcon,
  FileSignatureIcon,
  FileTextIcon,
  Link2Icon,
  MoreHorizontalIcon,
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
import {
  contractHasLinkedEnrollment,
  type EnrollmentContract,
} from '@/domains/enrollment-contracts/types';

function getContractReference(contract: EnrollmentContract): string {
  const code = contract.code?.trim();
  if (code) return code;
  return `#${contract.id}`;
}

const viewOverviewButtonClass =
  'normal-case bg-background hover:bg-muted text-foreground h-9 shrink-0 gap-1.5 rounded-md border-neutral-300 px-2.5 text-[13px]! font-semibold';

const mainActionButtonClass =
  'normal-case h-9 shrink-0 gap-1.5 px-2.5 text-[13px]! font-semibold';

const moreTriggerClass =
  'bg-background hover:bg-muted text-foreground/80 size-9 shrink-0 rounded-md border-neutral-300';

export type EnrollmentContractRowActionsProps = {
  contract: EnrollmentContract;
  onOpenCreateEnrollment: (contractId: number) => void;
};

type PrimaryAction = 'createEnrollment' | 'openOverview';

function getPrimaryAction(contract: EnrollmentContract): PrimaryAction {
  const isSigned = contract.status === 'signed';
  const hasEnrollment = contractHasLinkedEnrollment(contract);
  if (isSigned && !hasEnrollment) return 'createEnrollment';
  return 'openOverview';
}

/**
 * Primary: Create enrollment when signed without a record; otherwise outline Open overview.
 * Menu groups match intake / enrollment request: copy reference, quick links (intake, request, enrollment), then Create enrollment when duplicated.
 */
export default function EnrollmentContractRowActions({
  contract,
  onOpenCreateEnrollment,
}: EnrollmentContractRowActionsProps) {
  const referenceText = getContractReference(contract);
  const primary = getPrimaryAction(contract);
  const isSigned = contract.status === 'signed';
  const hasEnrollment = contractHasLinkedEnrollment(contract);
  const showCreateEnrollment = isSigned && !hasEnrollment;

  const intakeId = contract.onboarding_intake?.id ?? null;
  const enrollmentRequestId =
    contract.onboarding_intake?.enrollment_request?.id ?? null;
  const enrollmentRecordId = contract.enrollment?.id ?? null;

  const showOpenOverviewInMenu = primary === 'createEnrollment';
  const showOpenIntake = intakeId != null;
  const showOpenEnrollmentRequest = enrollmentRequestId != null;
  const showOpenEnrollmentRecord = enrollmentRecordId != null;

  const showCreateEnrollmentInMenu =
    primary !== 'createEnrollment' && showCreateEnrollment;

  const hasQuickLinks =
    showOpenOverviewInMenu ||
    showOpenIntake ||
    showOpenEnrollmentRequest ||
    showOpenEnrollmentRecord;

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

  return (
    <div className='flex items-center justify-end gap-1.5'>
      {primary === 'openOverview' ? (
        <Button
          variant='outline'
          size='sm'
          className={viewOverviewButtonClass}
          asChild
        >
          <Link
            href={ROUTES.ADMIN.MODULES.ENROLLMENT_CONTRACTS.DETAIL(
              String(contract.id),
            )}
            className='inline-flex items-center gap-1.5'
          >
            <FileTextIcon className='size-3.5 shrink-0' />
            Open Overview
          </Link>
        </Button>
      ) : null}
      {primary === 'createEnrollment' ? (
        <Button
          type='button'
          variant='default'
          size='sm'
          className={mainActionButtonClass}
          onClick={() => onOpenCreateEnrollment(contract.id)}
        >
          <FileSignatureIcon className='size-3.5 shrink-0' />
          Create Enrollment
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
        <DropdownMenuContent align='end' className='min-w-56'>
          <DropdownMenuLabel className='text-foreground/70 space-y-1 px-2 py-1.5 text-[11px]! font-bold tracking-wide uppercase'>
            Actions
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className='flex cursor-pointer items-center gap-2 text-[13px]! font-medium'
            onClick={handleCopyReference}
          >
            <ClipboardCopyIcon className='size-3.5 shrink-0' />
            Copy reference
          </DropdownMenuItem>

          {(hasQuickLinks || showCreateEnrollmentInMenu) && (
            <DropdownMenuSeparator />
          )}

          {hasQuickLinks ? (
            <>
              {showOpenOverviewInMenu ? (
                <DropdownMenuItem asChild className='cursor-pointer'>
                  <Link
                    className='flex w-full cursor-pointer items-center gap-2 text-[13px]! font-medium'
                    href={ROUTES.ADMIN.MODULES.ENROLLMENT_CONTRACTS.DETAIL(
                      String(contract.id),
                    )}
                  >
                    <FileTextIcon className='size-3.5 shrink-0' />
                    Open Overview
                  </Link>
                </DropdownMenuItem>
              ) : null}
              {showOpenIntake ? (
                <DropdownMenuItem asChild className='cursor-pointer'>
                  <Link
                    className='flex w-full cursor-pointer items-center gap-2 text-[13px]! font-medium'
                    href={ROUTES.ADMIN.MODULES.INTAKE_ASSESSMENTS.DETAIL(
                      String(intakeId),
                    )}
                  >
                    <ClipboardListIcon className='size-3.5 shrink-0' />
                    Open Intake Assessment
                  </Link>
                </DropdownMenuItem>
              ) : null}
              {showOpenEnrollmentRequest ? (
                <DropdownMenuItem asChild className='cursor-pointer'>
                  <Link
                    className='flex w-full cursor-pointer items-center gap-2 text-[13px]! font-medium'
                    href={ROUTES.ADMIN.MODULES.ENROLLMENT_REQUESTS.DETAIL(
                      String(enrollmentRequestId),
                    )}
                  >
                    <Link2Icon className='size-3.5 shrink-0' />
                    Open Enrollment Request
                  </Link>
                </DropdownMenuItem>
              ) : null}
              {showOpenEnrollmentRecord ? (
                <DropdownMenuItem asChild className='cursor-pointer'>
                  <Link
                    className='flex w-full cursor-pointer items-center gap-2 text-[13px]! font-medium'
                    href={ROUTES.ADMIN.MODULES.ENROLLMENT_RECORDS.DETAIL(
                      String(enrollmentRecordId),
                    )}
                  >
                    <FileTextIcon className='size-3.5 shrink-0' />
                    Open Enrollment Record
                  </Link>
                </DropdownMenuItem>
              ) : null}
            </>
          ) : null}

          {showCreateEnrollmentInMenu && hasQuickLinks ? (
            <DropdownMenuSeparator />
          ) : null}

          {showCreateEnrollmentInMenu ? (
            <DropdownMenuItem
              className='flex cursor-pointer items-center gap-2 text-[13px]! font-medium'
              onClick={() => onOpenCreateEnrollment(contract.id)}
            >
              <FileSignatureIcon className='size-3.5 shrink-0' />
              Create Enrollment
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
