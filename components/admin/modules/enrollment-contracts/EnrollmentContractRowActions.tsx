'use client';

import {
  ClipboardCopyIcon,
  EyeIcon,
  FileSignatureIcon,
  MoreHorizontalIcon,
  UserRoundIcon,
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

const viewDetailButtonClass =
  'normal-case bg-background hover:bg-muted text-foreground h-9 shrink-0 gap-1.5 rounded-md border-neutral-300 px-2.5 text-[13px]! font-semibold';

const mainActionButtonClass =
  'normal-case h-9 shrink-0 gap-1.5 px-2.5 text-[13px]! font-semibold';

const moreTriggerClass =
  'bg-background hover:bg-muted text-foreground/80 size-9 shrink-0 rounded-md border-neutral-300';

export type EnrollmentContractRowActionsProps = {
  contract: EnrollmentContract;
  onOpenCreateEnrollment: (contractId: number) => void;
};

type PrimaryAction = 'createEnrollment' | 'viewDetail';

function getPrimaryAction(contract: EnrollmentContract): PrimaryAction {
  const isSigned = contract.status === 'signed';
  const hasEnrollment = contractHasLinkedEnrollment(contract);
  if (isSigned && !hasEnrollment) return 'createEnrollment';
  return 'viewDetail';
}

/** Surfaces the strongest next step when signed; otherwise “View detail” + ⋯. */
export default function EnrollmentContractRowActions({
  contract,
  onOpenCreateEnrollment,
}: EnrollmentContractRowActionsProps) {
  const referenceText = getContractReference(contract);
  const primary = getPrimaryAction(contract);
  const isSigned = contract.status === 'signed';
  const hasEnrollment = contractHasLinkedEnrollment(contract);
  const showViewEnrollment = isSigned && hasEnrollment;
  const enrollmentRecordId = contract.enrollment?.id;
  const showCreateEnrollment = isSigned && !hasEnrollment;

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

  const showDetailInMenu = primary !== 'viewDetail';
  const showCreateInMenu =
    primary !== 'createEnrollment' && showCreateEnrollment;
  /** Enrollment record stays under ⋯; primary is always contract “View detail” once not “Create enrollment”. */
  const showEnrollmentInMenu = showViewEnrollment;
  const hasMenuAfterCopy =
    showDetailInMenu || showCreateInMenu || showEnrollmentInMenu;

  return (
    <div className='flex items-center justify-end gap-1.5'>
      {primary === 'viewDetail' ? (
        <Button
          variant='outline'
          size='sm'
          className={viewDetailButtonClass}
          asChild
        >
          <Link
            href={ROUTES.ADMIN.MODULES.ENROLLMENT_CONTRACTS.DETAIL(
              String(contract.id),
            )}
            className='inline-flex items-center gap-1.5'
          >
            <EyeIcon className='size-3.5 shrink-0' />
            View detail
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
          Create enrollment
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
              {showDetailInMenu ? (
                <DropdownMenuItem asChild className='cursor-pointer'>
                  <Link
                    className='flex w-full cursor-pointer items-center gap-2 text-[13px]! font-medium'
                    href={ROUTES.ADMIN.MODULES.ENROLLMENT_CONTRACTS.DETAIL(
                      String(contract.id),
                    )}
                  >
                    <EyeIcon className='size-3.5 shrink-0' />
                    View detail
                  </Link>
                </DropdownMenuItem>
              ) : null}
              {showEnrollmentInMenu && enrollmentRecordId != null ? (
                <DropdownMenuItem asChild className='cursor-pointer'>
                  <Link
                    className='flex w-full cursor-pointer items-center gap-2 text-[13px]! font-medium'
                    href={ROUTES.ADMIN.MODULES.ENROLLMENT_RECORDS.DETAIL(
                      String(enrollmentRecordId),
                    )}
                  >
                    <UserRoundIcon className='size-3.5 shrink-0' />
                    View enrollment
                  </Link>
                </DropdownMenuItem>
              ) : null}
              {showCreateInMenu ? (
                <DropdownMenuItem
                  className='flex cursor-pointer items-center gap-2 text-[13px]! font-medium'
                  onClick={() => onOpenCreateEnrollment(contract.id)}
                >
                  <FileSignatureIcon className='size-3.5 shrink-0' />
                  Create enrollment
                </DropdownMenuItem>
              ) : null}
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
