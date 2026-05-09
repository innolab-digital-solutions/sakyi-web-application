'use client';

import {
  BanIcon,
  ClipboardCopyIcon,
  ClipboardListIcon,
  ClipboardSignatureIcon,
  FileTextIcon,
  MoreHorizontalIcon,
  PhoneCallIcon,
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
import type {
  EnrollmentRequestEnrollmentSummary,
  EnrollmentRequestResource,
} from '@/domains/enrollment-requests/types';

/**
 * Intake should only start while the request is still actively being worked.
 * In practice that means:
 * - pending: newly submitted and still triageable
 * - contacted: qualified and in active follow-up
 * Finalized states (completed/cancelled) should not create new intake sessions.
 * If an intake is already linked (`onboarding_intake`), do not offer start again.
 */
function canStartIntake(request: EnrollmentRequestResource): boolean {
  if (!request.client?.id) return false;
  if (request.onboarding_intake) return false;
  return request.status === 'pending' || request.status === 'contacted';
}

function canMarkAsContacted(request: EnrollmentRequestResource): boolean {
  return request.status === 'pending';
}

function canCancelRequest(request: EnrollmentRequestResource): boolean {
  if (request.onboarding_intake) return false;
  return request.status === 'pending' || request.status === 'contacted';
}

function getRequestReference(request: EnrollmentRequestResource): string {
  const code = request.code?.trim();
  if (code) return code;
  return `#${request.id}`;
}

/**
 * Mirrors detail-page primary enrollment selection:
 * active -> scheduled -> newest fallback.
 */
function pickPrimaryEnrollmentId(
  request: EnrollmentRequestResource,
): number | null {
  const rows = Array.isArray(request.enrollments) ? request.enrollments : [];
  if (rows.length === 0) return null;

  const byStatus = (status: string) =>
    rows.find((r: EnrollmentRequestEnrollmentSummary) => r.status === status);

  return byStatus('active')?.id ?? byStatus('scheduled')?.id ?? rows[0]?.id ?? null;
}

const viewDetailButtonClass =
  'normal-case bg-background hover:bg-muted text-foreground h-9 shrink-0 gap-1.5 rounded-md border-neutral-300 px-2.5 text-[13px]! font-semibold';

const startIntakePrimaryClass =
  'normal-case h-9 shrink-0 gap-1.5 px-2.5 text-[13px]! font-semibold';

const moreTriggerClass =
  'bg-background hover:bg-muted text-foreground/80 size-9 shrink-0 rounded-md border-neutral-300';

export type EnrollmentRequestRowActionsProps = {
  request: EnrollmentRequestResource;
  onStartIntake: () => void;
  onMarkContacted: () => void;
  onCancelRequest: () => void;
  isStartingIntake: boolean;
  isUpdatingStatus: boolean;
};

type PrimaryAction = 'startIntake' | 'viewDetail';

/** Primary mirrors intake/contracts: start intake when available (solid primary); otherwise outline View detail. */
export default function EnrollmentRequestRowActions({
  request,
  onStartIntake,
  onMarkContacted,
  onCancelRequest,
  isStartingIntake,
  isUpdatingStatus,
}: EnrollmentRequestRowActionsProps) {
  const showStartIntake = canStartIntake(request);
  const showMarkContacted = canMarkAsContacted(request);
  const showCancelRequest = canCancelRequest(request);
  const primary: PrimaryAction = showStartIntake ? 'startIntake' : 'viewDetail';
  const referenceText = getRequestReference(request);
  const intakeId = request.onboarding_intake?.id ?? null;
  const contractId = request.contract?.id ?? null;
  const enrollmentId = pickPrimaryEnrollmentId(request);

  const showViewDetailInMenu = primary === 'startIntake';
  const showOpenIntake = intakeId != null;
  const showOpenContract = contractId != null;
  const showOpenEnrollment = enrollmentId != null;
  const hasMenuAfterCopy =
    showViewDetailInMenu ||
    showOpenIntake ||
    showOpenContract ||
    showOpenEnrollment ||
    showMarkContacted ||
    showCancelRequest;

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
      {primary === 'startIntake' ? (
        <Button
          type='button'
          variant='default'
          size='sm'
          className={startIntakePrimaryClass}
          disabled={isStartingIntake}
          onClick={() => onStartIntake()}
        >
          <ClipboardListIcon className='size-3.5 shrink-0' />
          Start Interview
        </Button>
      ) : (
        <Button
          variant='outline'
          size='sm'
          className={viewDetailButtonClass}
          asChild
        >
          <Link
            href={ROUTES.ADMIN.MODULES.ENROLLMENT_REQUESTS.DETAIL(
              String(request.id),
            )}
            className='inline-flex items-center gap-1.5'
          >
            <FileTextIcon className='size-3.5 shrink-0' />
            Open Overview
          </Link>
        </Button>
      )}

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
          {hasMenuAfterCopy ? (
            <>
              <DropdownMenuSeparator />
              {showViewDetailInMenu ? (
                <DropdownMenuItem asChild className='cursor-pointer'>
                  <Link
                    className='flex w-full cursor-pointer items-center gap-2 text-[13px]! font-medium'
                    href={ROUTES.ADMIN.MODULES.ENROLLMENT_REQUESTS.DETAIL(
                      String(request.id),
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
              {showOpenContract ? (
                <DropdownMenuItem asChild className='cursor-pointer'>
                  <Link
                    className='flex w-full cursor-pointer items-center gap-2 text-[13px]! font-medium'
                    href={ROUTES.ADMIN.MODULES.ENROLLMENT_CONTRACTS.DETAIL(
                      String(contractId),
                    )}
                  >
                    <ClipboardSignatureIcon className='size-3.5 shrink-0' />
                    Open Contract Record
                  </Link>
                </DropdownMenuItem>
              ) : null}
              {showOpenEnrollment ? (
                <DropdownMenuItem asChild className='cursor-pointer'>
                  <Link
                    className='flex w-full cursor-pointer items-center gap-2 text-[13px]! font-medium'
                    href={ROUTES.ADMIN.MODULES.ENROLLMENT_RECORDS.DETAIL(
                      String(enrollmentId),
                    )}
                  >
                    <FileTextIcon className='size-3.5 shrink-0' />
                    Open Enrollment Record
                  </Link>
                </DropdownMenuItem>
              ) : null}
              {(showViewDetailInMenu ||
                showOpenIntake ||
                showOpenContract ||
                showOpenEnrollment) &&
              (showMarkContacted || showCancelRequest) ? (
                <DropdownMenuSeparator />
              ) : null}
              {showMarkContacted ? (
                <DropdownMenuItem
                  className='flex cursor-pointer items-center gap-2 text-[13px]! font-medium'
                  disabled={isUpdatingStatus}
                  onClick={() => onMarkContacted()}
                >
                  <PhoneCallIcon className='size-3.5 shrink-0' />
                  Mark as contacted
                </DropdownMenuItem>
              ) : null}
              {showCancelRequest ? (
                <DropdownMenuItem
                  className='text-destructive focus:text-destructive flex cursor-pointer items-center gap-2 text-[13px]! font-medium'
                  disabled={isUpdatingStatus}
                  onClick={() => onCancelRequest()}
                >
                  <BanIcon className='text-destructive size-3.5 shrink-0' />
                  Cancel Request
                </DropdownMenuItem>
              ) : null}
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
