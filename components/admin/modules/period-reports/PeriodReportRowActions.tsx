'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { endOfDay, format, parseISO } from 'date-fns';
import {
  CheckCircle2Icon,
  ClipboardCopyIcon,
  EyeIcon,
  FilePenLineIcon,
  MoreHorizontalIcon,
} from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import { toast } from 'sonner';

import { buildReportWorkspaceHref } from '@/components/admin/modules/operational-logs/reportRunListHelpers';
import PeriodReportPublishBlockedAlert from '@/components/admin/modules/period-reports/PeriodReportPublishBlockedAlert';
import PeriodReportPublishConfirmation from '@/components/admin/modules/period-reports/PeriodReportPublishConfirmation';
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
import { postCarePlanReportRunPublish } from '@/domains/care-plans/services';
import type { ClientReportListRow } from '@/domains/care-plans/types/client-report-list';

const primaryButtonClass =
  'normal-case bg-background hover:bg-muted text-foreground h-9 shrink-0 gap-1.5 rounded-md border-neutral-300 px-2.5 text-[13px]! font-semibold';
const moreTriggerClass =
  'bg-background hover:bg-muted text-foreground/80 size-9 shrink-0 rounded-md border-neutral-300';

type Props = {
  row: ClientReportListRow;
};

function primaryLabelAndIcon(row: ClientReportListRow): {
  label: string;
  Icon: typeof EyeIcon;
} {
  if (row.status === 'in_review' && row.is_editable) {
    return { label: 'Review', Icon: FilePenLineIcon };
  }
  return { label: 'View details', Icon: EyeIcon };
}

export default function PeriodReportRowActions({ row }: Props) {
  const queryClient = useQueryClient();
  const [publishBlockedOpen, setPublishBlockedOpen] = React.useState(false);
  const [publishConfirmOpen, setPublishConfirmOpen] = React.useState(false);
  const carePlanId = row.care_plan?.id;
  const reportCode = row.code?.trim() || `#${row.id}`;
  const carePlanCode = row.care_plan?.code?.trim() ?? '';
  const carePlanEndsOn = row.care_plan?.ends_on?.trim() ?? '';
  const href =
    carePlanId != null ? buildReportWorkspaceHref(carePlanId, row.id) : null;

  const { label, Icon } = primaryLabelAndIcon(row);
  const canShowPublishAction = row.status === 'in_review';

  const hasReachedCarePlanEndDate = () => {
    if (!carePlanEndsOn) return false;
    try {
      const endDate = parseISO(carePlanEndsOn);
      if (Number.isNaN(endDate.getTime())) return false;
      return new Date().getTime() >= endOfDay(endDate).getTime();
    } catch {
      return false;
    }
  };

  const carePlanEndsOnLabel = React.useMemo(() => {
    if (!carePlanEndsOn) return 'the care plan end date';
    try {
      const d = parseISO(carePlanEndsOn);
      if (Number.isNaN(d.getTime())) return carePlanEndsOn;
      return format(d, 'dd-MMM-yyyy');
    } catch {
      return carePlanEndsOn;
    }
  }, [carePlanEndsOn]);

  const { mutate: publishReportRun, isPending: publishPending } = useMutation({
    mutationFn: async () => {
      if (carePlanId == null) throw new Error('Missing care plan id.');
      const res = await postCarePlanReportRunPublish(carePlanId, row.id);
      if (res.status === 'error') {
        throw new Error(res.message ?? 'Could not publish report.');
      }
      return res.data;
    },
    onSuccess: () => {
      setPublishConfirmOpen(false);
      void queryClient.invalidateQueries({
        queryKey: ['table', ENDPOINTS.ADMIN.MODULES.PERIOD_REPORTS.LIST],
      });
      toast.success('Report published successfully.');
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Could not publish report.');
    },
  });

  const copyReport = () => {
    void (async () => {
      try {
        await navigator.clipboard.writeText(reportCode);
        toast.success('Report code copied to clipboard.');
      } catch {
        toast.error('Could not copy report code.');
      }
    })();
  };

  const copyCarePlan = () => {
    void (async () => {
      if (!carePlanCode) {
        toast.error('No care plan code to copy.');
        return;
      }
      try {
        await navigator.clipboard.writeText(carePlanCode);
        toast.success('Care plan code copied to clipboard.');
      } catch {
        toast.error('Could not copy care plan code.');
      }
    })();
  };

  if (href == null) {
    return (
      <div className='flex justify-end'>
        <span className='text-muted-foreground text-sm'>—</span>
      </div>
    );
  }

  return (
    <div className='flex items-center justify-end gap-1.5'>
      <Button
        variant='outline'
        size='sm'
        className={primaryButtonClass}
        asChild
      >
        <Link href={href} className='inline-flex items-center gap-1.5'>
          <Icon className='size-3.5 shrink-0' />
          {label}
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
            onClick={copyReport}
          >
            <ClipboardCopyIcon className='size-3.5 shrink-0' />
            Copy report code
          </DropdownMenuItem>
          <DropdownMenuItem
            className='flex cursor-pointer items-center gap-2 text-[13px]! font-medium'
            onClick={copyCarePlan}
            disabled={!carePlanCode}
          >
            <ClipboardCopyIcon className='size-3.5 shrink-0' />
            Copy care plan code
          </DropdownMenuItem>
          {carePlanId != null ? (
            <>
              {canShowPublishAction ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className='flex cursor-pointer items-center gap-2 text-[13px]! font-medium'
                    disabled={publishPending}
                    onClick={() => {
                      if (!hasReachedCarePlanEndDate()) {
                        setPublishBlockedOpen(true);
                        return;
                      }
                      setPublishConfirmOpen(true);
                    }}
                  >
                    <CheckCircle2Icon className='size-3.5 shrink-0' />
                    {publishPending ? 'Publishing...' : 'Publish report'}
                  </DropdownMenuItem>
                </>
              ) : null}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  className='flex items-center gap-2 text-[13px]! font-medium'
                  href={ROUTES.ADMIN.MODULES.CARE_PLANS.DETAIL(
                    String(carePlanId),
                  )}
                >
                  <EyeIcon className='size-3.5 shrink-0' />
                  View care plan
                </Link>
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <PeriodReportPublishBlockedAlert
        open={publishBlockedOpen}
        onOpenChange={setPublishBlockedOpen}
        reportReference={reportCode}
        carePlanEndDateLabel={carePlanEndsOnLabel}
      />

      <PeriodReportPublishConfirmation
        open={publishConfirmOpen}
        onOpenChange={setPublishConfirmOpen}
        isSubmitting={publishPending}
        reportReference={reportCode}
        onConfirm={() => publishReportRun()}
      />
    </div>
  );
}
