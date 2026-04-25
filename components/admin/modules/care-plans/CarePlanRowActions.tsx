'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle2Icon,
  ClipboardCopyIcon,
  FileBarChartIcon,
  EyeIcon,
  FilePenLineIcon,
  GitBranchPlusIcon,
  MoreHorizontalIcon,
  XCircleIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { toast } from 'sonner';

import CarePlanActivateActivePlanExistsDialog from '@/components/admin/modules/care-plans/CarePlanActivateActivePlanExistsDialog';
import CarePlanActivateConfirmation from '@/components/admin/modules/care-plans/CarePlanActivateConfirmation';
import CarePlanActivateEnrollmentPrerequisiteDialog from '@/components/admin/modules/care-plans/CarePlanActivateEnrollmentPrerequisiteDialog';
import CarePlanCancelConfirmation from '@/components/admin/modules/care-plans/CarePlanCancelConfirmation';
import CarePlanRevisionConfirmation from '@/components/admin/modules/care-plans/CarePlanRevisionConfirmation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ENDPOINTS } from '@/config/api/endpoints';
import { ROUTES } from '@/config/routes';
import {
  postCarePlanActivate,
  postCarePlanCancel,
  postCarePlanRevision,
} from '@/domains/care-plans/services';
import type {
  AdminCarePlan,
  CarePlanStatus,
} from '@/domains/care-plans/types/admin';

const LIST_QUERY_KEY = [
  'table',
  ENDPOINTS.ADMIN.MODULES.CARE_PLANS.LIST,
] as const;

const viewDetailButtonClass =
  'normal-case bg-background hover:bg-muted text-foreground h-9 shrink-0 gap-1.5 rounded-md border-neutral-300 px-2.5 text-[13px]! font-semibold';

const moreTriggerClass =
  'bg-background hover:bg-muted text-foreground/80 size-9 shrink-0 rounded-md border-neutral-300';

function normalizeStatus(
  status: string | null | undefined,
): CarePlanStatus | null {
  const value = (status ?? '').trim().toLowerCase();
  if (
    value === 'draft' ||
    value === 'scheduled' ||
    value === 'active' ||
    value === 'completed' ||
    value === 'cancelled'
  ) {
    return value;
  }
  return null;
}

function getReference(row: AdminCarePlan): string {
  const code = row.code?.trim();
  if (code) return code;
  return `#${row.id}`;
}

function normalizeEnrollmentStatus(value: string | null | undefined): string {
  return (value ?? '').trim().toLowerCase();
}

function isProgramEnrollmentScheduled(row: AdminCarePlan): boolean {
  return normalizeEnrollmentStatus(row.enrollment?.status) === 'scheduled';
}

/**
 * True when the enrollment already has an active care plan other than this row
 * (list payload may include `enrollment.current_active_plan` from the API).
 */
function hasAnotherActivePlanOnEnrollment(row: AdminCarePlan): boolean {
  const cap = row.enrollment?.current_active_plan;
  if (cap == null || cap.id == null) return false;
  return cap.id !== row.id;
}

function getEnrollmentReferenceForRow(row: AdminCarePlan): string {
  const code = row.enrollment?.code?.trim();
  if (code) return code;
  if (row.enrollment?.id != null) return `#${row.enrollment.id}`;
  if (row.enrollment_id != null) return `#${row.enrollment_id}`;
  return '';
}

export type CarePlanRowActionsProps = {
  row: AdminCarePlan;
};

export default function CarePlanRowActions({ row }: CarePlanRowActionsProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activateOpen, setActivateOpen] = React.useState(false);
  const [enrollmentPrerequisiteOpen, setEnrollmentPrerequisiteOpen] =
    React.useState(false);
  const [activePlanExistsOpen, setActivePlanExistsOpen] =
    React.useState(false);
  const [revisionOpen, setRevisionOpen] = React.useState(false);
  const [cancelOpen, setCancelOpen] = React.useState(false);
  const [cancellationNote, setCancellationNote] = React.useState('');
  const [cancelNoteError, setCancelNoteError] = React.useState<
    string | undefined
  >();
  const status = normalizeStatus(row.status);
  const reference = getReference(row);
  const enrollmentId = row.enrollment?.id ?? row.enrollment_id;
  const enrollmentRefLabel = getEnrollmentReferenceForRow(row);

  const invalidateList = React.useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: [...LIST_QUERY_KEY] });
  }, [queryClient]);

  const canEdit = status === 'draft' || status === 'scheduled';
  const canActivate = status === 'draft';
  const canCancel =
    status === 'draft' || status === 'scheduled' || status === 'active';
  const canCreateRevision =
    status === 'active' || status === 'cancelled';
  const canOpenPeriodReport = status === 'active' || status === 'completed';
  const hasMenuAfterCopy =
    canEdit || canActivate || canCreateRevision || canCancel || canOpenPeriodReport;

  const { mutate: activatePlan, isPending: activatePending } = useMutation({
    mutationFn: async () => {
      const response = await postCarePlanActivate(row.id);
      if (response.status === 'error') {
        throw new Error(response.message ?? 'Could not activate care plan.');
      }
      return response.data;
    },
    onSuccess: () => {
      toast.success('The care plan has been activated successfully.');
      setActivateOpen(false);
      invalidateList();
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Could not activate care plan.');
    },
  });

  const { mutate: createRevision, isPending: revisionPending } = useMutation({
    mutationFn: async () => {
      const response = await postCarePlanRevision(row.id);
      if (response.status === 'error') {
        throw new Error(response.message ?? 'Could not create revision.');
      }
      return response.data;
    },
    onSuccess: (nextPlan) => {
      toast.success('The care plan revision has been created successfully.');
      invalidateList();
      if (nextPlan?.id != null) {
        router.push(
          ROUTES.ADMIN.MODULES.CARE_PLANS.WORKSPACE(String(nextPlan.id)),
        );
      }
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Could not create revision.');
    },
  });

  const { mutate: cancelPlan, isPending: cancelPending } = useMutation({
    mutationFn: async () => {
      const note = cancellationNote.trim();
      if (!note) {
        throw new Error('Please provide a cancellation note.');
      }
      const response = await postCarePlanCancel(row.id, {
        cancellation_note: note,
      });
      if (response.status === 'error') {
        const fieldMessage = response.errors?.cancellation_note;
        if (typeof fieldMessage === 'string' && fieldMessage.trim()) {
          throw new Error(fieldMessage.trim());
        }
        if (Array.isArray(fieldMessage)) {
          const first = fieldMessage.find(
            (entry) => typeof entry === 'string' && entry.trim(),
          );
          if (typeof first === 'string') throw new Error(first.trim());
        }
        throw new Error(response.message ?? 'Could not cancel care plan.');
      }
      return response.data;
    },
    onSuccess: () => {
      toast.success('The care plan has been cancelled successfully.');
      setCancelOpen(false);
      setCancellationNote('');
      setCancelNoteError(undefined);
      invalidateList();
    },
    onError: (error: Error) => {
      const msg = error.message ?? 'Could not cancel care plan.';
      if (
        msg.toLowerCase().includes('cancellation note') ||
        msg.toLowerCase().includes('cancellation_note')
      ) {
        setCancelNoteError(msg);
        return;
      }
      toast.error(msg);
    },
  });

  const handleConfirmCancel = () => {
    const note = cancellationNote.trim();
    if (!note) {
      setCancelNoteError('The cancellation note field is required.');
      return;
    }
    cancelPlan();
  };

  const handleCopyReference = () => {
    void (async () => {
      try {
        await navigator.clipboard.writeText(reference);
        toast.success('Reference copied to clipboard.');
      } catch {
        toast.error('Could not copy reference.');
      }
    })();
  };

  return (
    <>
      <div className='flex items-center justify-end gap-1.5'>
        <Button
          variant='outline'
          size='sm'
          className={viewDetailButtonClass}
          asChild
        >
          <Link
            href={ROUTES.ADMIN.MODULES.CARE_PLANS.DETAIL(String(row.id))}
            className='inline-flex items-center gap-1.5'
          >
            <EyeIcon className='size-3.5 shrink-0' />
            View Detail
          </Link>
        </Button>

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
                {canOpenPeriodReport ? (
                  <DropdownMenuItem asChild>
                    <Link
                      className='flex items-center gap-2 text-[13px]! font-medium'
                      href={ROUTES.ADMIN.MODULES.CARE_PLANS.REPORT(
                        String(row.id),
                      )}
                    >
                      <FileBarChartIcon className='size-3.5 shrink-0' />
                      Period report
                    </Link>
                  </DropdownMenuItem>
                ) : null}
                {canEdit ? (
                  <DropdownMenuItem asChild>
                    <Link
                      className='flex items-center gap-2 text-[13px]! font-medium'
                      href={ROUTES.ADMIN.MODULES.CARE_PLANS.WORKSPACE(
                        String(row.id),
                      )}
                    >
                      <FilePenLineIcon className='size-3.5 shrink-0' />
                      Edit care plan
                    </Link>
                  </DropdownMenuItem>
                ) : null}
                {canActivate ? (
                  <DropdownMenuItem
                    className='flex cursor-pointer items-center gap-2 text-[13px]! font-medium'
                    onClick={() => {
                      if (isProgramEnrollmentScheduled(row)) {
                        setEnrollmentPrerequisiteOpen(true);
                        return;
                      }
                      if (hasAnotherActivePlanOnEnrollment(row)) {
                        setActivePlanExistsOpen(true);
                        return;
                      }
                      setActivateOpen(true);
                    }}
                  >
                    <CheckCircle2Icon className='size-3.5 shrink-0' />
                    Activate care plan
                  </DropdownMenuItem>
                ) : null}
                {canCreateRevision ? (
                  <DropdownMenuItem
                    disabled={revisionPending}
                    className='flex cursor-pointer items-center gap-2 text-[13px]! font-medium'
                    onClick={() => setRevisionOpen(true)}
                  >
                    <GitBranchPlusIcon className='size-3.5 shrink-0' />
                    {revisionPending ? 'Creating revision…' : 'Create revision'}
                  </DropdownMenuItem>
                ) : null}
                {canCancel ? (
                  <DropdownMenuItem
                    className='text-destructive focus:text-destructive flex cursor-pointer items-center gap-2 text-[13px]! font-medium'
                    onClick={() => {
                      setCancelOpen(true);
                      setCancelNoteError(undefined);
                    }}
                  >
                    <XCircleIcon className='text-destructive size-3.5 shrink-0' />
                    Cancel care plan
                  </DropdownMenuItem>
                ) : null}
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CarePlanActivateEnrollmentPrerequisiteDialog
        open={enrollmentPrerequisiteOpen}
        onOpenChange={setEnrollmentPrerequisiteOpen}
        carePlanReference={reference}
        enrollmentReference={enrollmentRefLabel || undefined}
        enrollmentId={enrollmentId}
      />

      <CarePlanActivateActivePlanExistsDialog
        open={activePlanExistsOpen}
        onOpenChange={setActivePlanExistsOpen}
        draftCarePlanReference={reference}
        activePlan={row.enrollment?.current_active_plan ?? null}
        enrollmentReference={enrollmentRefLabel || undefined}
      />

      <CarePlanActivateConfirmation
        open={activateOpen}
        isSubmitting={activatePending}
        carePlanReference={reference}
        onOpenChange={setActivateOpen}
        onConfirm={() => activatePlan()}
      />

      <CarePlanRevisionConfirmation
        open={revisionOpen}
        isSubmitting={revisionPending}
        carePlanReference={reference}
        onOpenChange={setRevisionOpen}
        onConfirm={() => createRevision()}
      />

      <CarePlanCancelConfirmation
        open={cancelOpen}
        onOpenChange={(open) => {
          setCancelOpen(open);
          if (!open) {
            setCancelNoteError(undefined);
            setCancellationNote('');
          }
        }}
        isSubmitting={cancelPending}
        carePlanReference={reference}
        isActivePlan={status === 'active'}
        cancellationNote={cancellationNote}
        onCancellationNoteChange={(value) => {
          setCancellationNote(value);
          if (cancelNoteError) setCancelNoteError(undefined);
        }}
        noteError={cancelNoteError}
        onConfirmCancel={handleConfirmCancel}
      />
    </>
  );
}
