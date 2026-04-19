'use client';

import { EyeIcon } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';
import type { ClientProfile } from '@/domains/client-profiles/types/admin';

const viewDetailButtonClass =
  'normal-case bg-background hover:bg-muted text-foreground h-9 shrink-0 gap-1.5 rounded-md border-neutral-300 px-2.5 text-[13px]! font-semibold';

export type ClientProfileRowActionsProps = {
  row: ClientProfile;
};

export default function ClientProfileRowActions({
  row,
}: ClientProfileRowActionsProps) {
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
          View detail
        </Link>
      </Button>
    </div>
  );
}
