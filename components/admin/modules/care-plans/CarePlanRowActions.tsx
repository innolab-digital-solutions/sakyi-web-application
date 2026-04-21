'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle2Icon,
  CircleQuestionMark,
  ClipboardCopyIcon,
  EyeIcon,
  FilePenLineIcon,
  GitBranchPlusIcon,
  MoreHorizontalIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
  postCarePlanRevision,
} from '@/domains/care-plans/services';
import type { AdminCarePlan, CarePlanStatus } from '@/domains/care-plans/types/admin';

const LIST_QUERY_KEY = ['table', ENDPOINTS.ADMIN.MODULES.CARE_PLANS.LIST] as const;

const viewDetailButtonClass =
  'normal-case bg-background hover:bg-muted text-foreground h-9 shrink-0 gap-1.5 rounded-md border-neutral-300 px-2.5 text-[13px]! font-semibold';

const moreTriggerClass =
  'bg-background hover:bg-muted text-foreground/80 size-9 shrink-0 rounded-md border-neutral-300';

function normalizeStatus(status: string | null | undefined): CarePlanStatus | null {
  const value = (status ?? '').trim().toLowerCase();
  if (
    value === 'draft' ||
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

export type CarePlanRowActionsProps = {
  row: AdminCarePlan;
};

export default function CarePlanRowActions({ row }: CarePlanRowActionsProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activateOpen, setActivateOpen] = React.useState(false);
  const status = normalizeStatus(row.status);
  const reference = getReference(row);

  const invalidateList = React.useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: [...LIST_QUERY_KEY] });
  }, [queryClient]);

  const canEdit = status === 'draft';
  const canActivate = status === 'draft';
  const canCreateRevision = status === 'active' || status === 'completed' || status === 'cancelled';

  const { mutate: activatePlan, isPending: activatePending } = useMutation({
    mutationFn: async () => {
      const response = await postCarePlanActivate(row.id);
      if (response.status === 'error') {
        throw new Error(response.message ?? 'Could not activate care plan.');
      }
      return response.data;
    },
    onSuccess: () => {
      toast.success('Care plan activated successfully.');
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
      toast.success('Care plan revision created successfully.');
      invalidateList();
      if (nextPlan?.id != null) {
        router.push(ROUTES.ADMIN.MODULES.CARE_PLANS.BUILDER(String(nextPlan.id)));
      }
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Could not create revision.');
    },
  });

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
            View detail
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
            {canEdit ? (
              <DropdownMenuItem asChild>
                <Link
                  className='flex items-center gap-2 text-[13px]! font-medium'
                  href={ROUTES.ADMIN.MODULES.CARE_PLANS.BUILDER(String(row.id))}
                >
                  <FilePenLineIcon className='size-3.5 shrink-0' />
                  Edit care plan
                </Link>
              </DropdownMenuItem>
            ) : null}
            {canActivate ? (
              <DropdownMenuItem
                className='flex cursor-pointer items-center gap-2 text-[13px]! font-medium'
                onClick={() => setActivateOpen(true)}
              >
                <CheckCircle2Icon className='size-3.5 shrink-0' />
                Activate care plan
              </DropdownMenuItem>
            ) : null}
            {canCreateRevision ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  disabled={revisionPending}
                  className='flex cursor-pointer items-center gap-2 text-[13px]! font-medium'
                  onClick={() => createRevision()}
                >
                  <GitBranchPlusIcon className='size-3.5 shrink-0' />
                  {revisionPending ? 'Creating revision…' : 'Create revision'}
                </DropdownMenuItem>
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={activateOpen} onOpenChange={setActivateOpen}>
        <AlertDialogContent className='gap-0 overflow-hidden p-0 sm:max-w-md'>
          <AlertDialogHeader className='border-border border-b p-6'>
            <div className='flex items-start gap-3'>
              <div className='bg-primary/10 border-primary/20 text-primary mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-md border'>
                <CircleQuestionMark className='size-5' aria-hidden />
              </div>
              <div className='space-y-1.5'>
                <AlertDialogTitle className='text-foreground/90 text-sm font-bold capitalize'>
                  Activate care plan?
                </AlertDialogTitle>
                <AlertDialogDescription className='text-muted-foreground text-[13px] font-medium'>
                  This moves{' '}
                  <span className='text-primary text-xs font-semibold'>
                    {reference}
                  </span>{' '}
                  to active. After activation, major changes should be done through revision mode.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className='bg-muted/30 border-border gap-2 border-t p-4 sm:justify-end'>
            <AlertDialogCancel
              disabled={activatePending}
              className='text-foreground bg-background hover:bg-muted h-10 gap-1.5 rounded-md border-neutral-300 px-3 text-[13px]! font-semibold'
            >
              Not now
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={activatePending}
              className='h-10 gap-1.5 rounded-md px-3 text-[13px]! font-semibold'
              onClick={(event) => {
                event.preventDefault();
                activatePlan();
              }}
            >
              <CheckCircle2Icon className='size-3.5' aria-hidden />
              {activatePending ? 'Activating…' : 'Activate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
