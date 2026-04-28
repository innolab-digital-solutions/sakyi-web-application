'use client';

import {
  ClipboardCopyIcon,
  EyeIcon,
  MoreHorizontalIcon,
  PaperclipIcon,
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
import type { ClientProfile } from '@/domains/client-profiles/types/admin';

const viewDetailButtonClass =
  'normal-case bg-background hover:bg-muted text-foreground h-9 shrink-0 gap-1.5 rounded-md border-neutral-300 px-2.5 text-[13px]! font-semibold';

const moreTriggerClass =
  'bg-background hover:bg-muted text-foreground/80 size-9 shrink-0 rounded-md border-neutral-300';

function getClientProfileReference(row: ClientProfile): string {
  const code = row.client_code?.trim();
  if (code) return code;
  return `#${row.id}`;
}

export type ClientProfileRowActionsProps = {
  row: ClientProfile;
  onUploadMedia: () => void;
};

export default function ClientProfileRowActions({
  row,
  onUploadMedia,
}: ClientProfileRowActionsProps) {
  const referenceText = getClientProfileReference(row);

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
      <Button
        variant='outline'
        size='sm'
        className={viewDetailButtonClass}
        asChild
      >
        <Link
          href={ROUTES.ADMIN.MODULES.CLIENT_PROFILES.DETAIL(String(row.id))}
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
          <DropdownMenuItem
            className='flex cursor-pointer items-center gap-2 text-[13px]! font-medium'
            onClick={onUploadMedia}
          >
            <PaperclipIcon className='size-3.5 shrink-0' />
            Save files & documents
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
