'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ClipboardCopyIcon,
  FileTextIcon,
  MoreHorizontalIcon,
  NotebookPenIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { toast } from 'sonner';

import OperationalLogDraftConfirmation from '@/components/admin/modules/operational-logs/OperationalLogDraftConfirmation';
import { buildOperationalLogWorkspaceHref } from '@/components/admin/modules/operational-logs/reportRunListHelpers';
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
  type CarePlanLogSummary,
  postCarePlanOperationalLogDraft,
} from '@/domains/care-plans/services';

const viewDetailButtonClass =
  'normal-case bg-background hover:bg-muted text-foreground h-9 shrink-0 gap-1.5 rounded-md border-neutral-300 px-2.5 text-[13px]! font-semibold';
const moreTriggerClass =
  'bg-background hover:bg-muted text-foreground/80 size-9 shrink-0 rounded-md border-neutral-300';

const LIST_QUERY_KEY = [
  'table',
  ENDPOINTS.ADMIN.MODULES.CARE_PLAN_LOGS.LIST,
] as const;

type CarePlanLogRowActionsProps = {
  row: CarePlanLogSummary;
};

function normalizeCarePlanStatus(value: string | null | undefined): string {
  return (value ?? '').trim().toLowerCase();
}

export default function CarePlanLogRowActions({
  row,
}: CarePlanLogRowActionsProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [opLogDraftOpen, setOpLogDraftOpen] = React.useState(false);
  const reference = row.code?.trim() || `#${row.id}`;
  const planStatus = normalizeCarePlanStatus(row.status);
  const canUseOperationalLogs =
    planStatus === 'active' || planStatus === 'completed';
  const embeddedOpLog = row.operational_log;
  const hasExistingOperationalLog =
    embeddedOpLog != null && Number.isFinite(embeddedOpLog.id);

  const { mutate: createOpLogDraft, isPending: opLogDraftPending } =
    useMutation({
      mutationFn: async () => {
        const res = await postCarePlanOperationalLogDraft(row.id, {});
        if (res.status === 'error') {
          throw new Error(
            res.message ?? 'Could not create draft operational log.',
          );
        }
        if (res.data?.id == null) {
          throw new Error('Invalid response from server.');
        }
        return res.data;
      },
      onSuccess: (data) => {
        setOpLogDraftOpen(false);
        router.push(buildOperationalLogWorkspaceHref(row.id, data.id));
        void queryClient.invalidateQueries({ queryKey: [...LIST_QUERY_KEY] });
        toast.success('The operational log has been created successfully.');
      },
      onError: (e: Error) => {
        toast.error(e.message);
      },
    });

  const goToExistingOperationalLog = () => {
    if (!hasExistingOperationalLog || embeddedOpLog == null) return;
    router.push(buildOperationalLogWorkspaceHref(row.id, embeddedOpLog.id));
  };

  const onOperationalLogMenuAction = () => {
    if (hasExistingOperationalLog) {
      goToExistingOperationalLog();
      return;
    }
    setOpLogDraftOpen(true);
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
  const hasMenuAfterCopy = canUseOperationalLogs;

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
            href={ROUTES.ADMIN.MODULES.CARE_PLAN_LOGS.DETAIL(String(row.id))}
            className='inline-flex items-center gap-1.5'
          >
            <FileTextIcon className='size-3.5 shrink-0' />
            Open Overview
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
                <DropdownMenuItem
                  className='flex cursor-pointer items-center gap-2 text-[13px]! font-medium'
                  onClick={onOperationalLogMenuAction}
                >
                  <NotebookPenIcon className='size-3.5 shrink-0' />
                  {hasExistingOperationalLog
                    ? 'Open Operational Log'
                    : 'Create Operational Log'}
                </DropdownMenuItem>
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <OperationalLogDraftConfirmation
        open={opLogDraftOpen}
        isSubmitting={opLogDraftPending}
        carePlanReference={reference}
        onOpenChange={setOpLogDraftOpen}
        onConfirm={() => createOpLogDraft()}
      />
    </>
  );
}
