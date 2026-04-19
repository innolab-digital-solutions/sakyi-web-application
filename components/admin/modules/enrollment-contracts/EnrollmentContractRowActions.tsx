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
import type { EnrollmentContract } from '@/domains/enrollment-contracts/types';

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
};

type PrimaryAction = 'createEnrollment' | 'viewEnrollment' | 'viewDetail';

function getPrimaryAction(contract: EnrollmentContract): PrimaryAction {
  const isSigned = contract.status === 'signed';
  const hasEnrollment =
    contract.enrollment_id != null &&
    Number.isFinite(contract.enrollment_id) &&
    contract.enrollment_id > 0;
  if (isSigned && !hasEnrollment) return 'createEnrollment';
  if (isSigned && hasEnrollment) return 'viewEnrollment';
  return 'viewDetail';
}

/** Surfaces the strongest next step when signed; otherwise “View detail” + ⋯. */
export default function EnrollmentContractRowActions({
  contract,
}: EnrollmentContractRowActionsProps) {
  const referenceText = getContractReference(contract);
  const primary = getPrimaryAction(contract);
  const isSigned = contract.status === 'signed';
  const hasEnrollment =
    contract.enrollment_id != null &&
    Number.isFinite(contract.enrollment_id) &&
    contract.enrollment_id > 0;
  const showViewEnrollment = isSigned && hasEnrollment;
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
  const showEnrollmentInMenu =
    primary !== 'viewEnrollment' && showViewEnrollment;
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
          variant='default'
          size='sm'
          className={mainActionButtonClass}
          asChild
        >
          <Link
            href={ROUTES.ADMIN.MODULES.ENROLLMENT_CONTRACTS.ENROLL(
              String(contract.id),
            )}
            className='inline-flex items-center gap-1.5'
          >
            <FileSignatureIcon className='size-3.5 shrink-0' />
            Create enrollment
          </Link>
        </Button>
      ) : null}
      {primary === 'viewEnrollment' ? (
        <Button
          variant='outline'
          size='sm'
          className={viewDetailButtonClass}
          asChild
        >
          <Link
            href={ROUTES.ADMIN.MODULES.ENROLLMENT_RECORDS.DETAIL(
              String(contract.enrollment_id),
            )}
            className='inline-flex items-center gap-1.5'
          >
            <UserRoundIcon className='size-3.5 shrink-0' />
            View enrollment
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
              {showEnrollmentInMenu ? (
                <DropdownMenuItem asChild className='cursor-pointer'>
                  <Link
                    className='flex w-full cursor-pointer items-center gap-2 text-[13px]! font-medium'
                    href={ROUTES.ADMIN.MODULES.ENROLLMENT_RECORDS.DETAIL(
                      String(contract.enrollment_id),
                    )}
                  >
                    <UserRoundIcon className='size-3.5 shrink-0' />
                    View enrollment
                  </Link>
                </DropdownMenuItem>
              ) : null}
              {showCreateInMenu ? (
                <DropdownMenuItem asChild className='cursor-pointer'>
                  <Link
                    className='flex w-full cursor-pointer items-center gap-2 text-[13px]! font-medium'
                    href={ROUTES.ADMIN.MODULES.ENROLLMENT_CONTRACTS.ENROLL(
                      String(contract.id),
                    )}
                  >
                    <FileSignatureIcon className='size-3.5 shrink-0' />
                    Create enrollment
                  </Link>
                </DropdownMenuItem>
              ) : null}
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
