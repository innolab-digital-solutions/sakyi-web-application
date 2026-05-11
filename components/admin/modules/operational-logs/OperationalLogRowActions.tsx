'use client';

import {
  ClipboardCopyIcon,
  MoreHorizontalIcon,
  NotebookPenIcon,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

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
import type { OperationalLogListRow } from '@/domains/care-plans/types/operational-log-list';

const viewPrimaryClass =
  'normal-case bg-background hover:bg-muted text-foreground h-9 shrink-0 gap-1.5 rounded-md border-neutral-300 px-2.5 text-[13px]! font-semibold';
const moreTriggerClass =
  'bg-background hover:bg-muted text-foreground/80 size-9 shrink-0 rounded-md border-neutral-300';

type Props = {
  row: OperationalLogListRow;
};

export default function OperationalLogRowActions({ row }: Props) {
  const carePlanId = row.care_plan?.id;
  const reference = row.code?.trim() || `#${row.id}`;
  const href =
    carePlanId != null
      ? buildOperationalLogWorkspaceHref(carePlanId, row.id)
      : null;

  const copyReference = () => {
    void (async () => {
      try {
        await navigator.clipboard.writeText(reference);
        toast.success('Reference copied to clipboard.');
      } catch {
        toast.error('Could not copy reference.');
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
      <Button variant='outline' size='sm' className={viewPrimaryClass} asChild>
        <Link href={href} className='inline-flex items-center gap-1.5'>
          <NotebookPenIcon className='size-3.5 shrink-0' />
          Open Workspace
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
            onClick={copyReference}
          >
            <ClipboardCopyIcon className='size-3.5 shrink-0' />
            Copy reference
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
