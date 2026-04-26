'use client';

import {
  ClipboardCopyIcon,
  EyeIcon,
  FilePenLineIcon,
  MoreHorizontalIcon,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

import { buildReportWorkspaceHref } from '@/components/admin/modules/operational-logs/reportRunListHelpers';
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
  const carePlanId = row.care_plan?.id;
  const reportCode = row.code?.trim() || `#${row.id}`;
  const carePlanCode = row.care_plan?.code?.trim() ?? '';
  const href =
    carePlanId != null
      ? buildReportWorkspaceHref(carePlanId, row.id)
      : null;

  const { label, Icon } = primaryLabelAndIcon(row);

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
      <Button variant='outline' size='sm' className={primaryButtonClass} asChild>
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
    </div>
  );
}
