'use client';

import {
  ClipboardCopyIcon,
  EyeIcon,
  MoreHorizontalIcon,
  NotebookPenIcon,
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
import type { CarePlanLogSummary } from '@/domains/care-plans/services';

const viewDetailButtonClass =
  'normal-case bg-background hover:bg-muted text-foreground h-9 shrink-0 gap-1.5 rounded-md border-neutral-300 px-2.5 text-[13px]! font-semibold';
const moreTriggerClass =
  'bg-background hover:bg-muted text-foreground/80 size-9 shrink-0 rounded-md border-neutral-300';

type CarePlanLogRowActionsProps = {
  row: CarePlanLogSummary;
};

export default function CarePlanLogRowActions({
  row,
}: CarePlanLogRowActionsProps) {
  const reference = row.code?.trim() || `#${row.id}`;

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
    <div className='flex items-center justify-end gap-1.5'>
      <Button variant='outline' size='sm' className={viewDetailButtonClass} asChild>
        <Link
          href={ROUTES.ADMIN.MODULES.CARE_PLAN_LOGS.DETAIL(String(row.id))}
          className='inline-flex items-center gap-1.5'
        >
          <EyeIcon className='size-3.5 shrink-0' />
          View details
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
          <DropdownMenuItem asChild>
            <Link
              className='flex items-center gap-2 text-[13px]! font-medium'
              href={ROUTES.ADMIN.MODULES.OPERATIONAL_LOGS.WORKSPACE(
                String(row.id),
              )}
            >
              <NotebookPenIcon className='size-3.5 shrink-0' />
              Operational logs
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
