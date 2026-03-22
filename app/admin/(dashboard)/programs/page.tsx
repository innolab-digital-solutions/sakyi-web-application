import { PlusIcon } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import ProgramListTable from '@/components/admin/modules/programs/ProgramListTable';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';

export const metadata: Metadata = {
  title: 'Programs | SaKyi Admin',
  description:
    'Browse and manage wellness programs with bilingual English and Myanmar content.',
};

export default function ProgramListsPage() {
  return (
    <div className='min-w-0 space-y-8'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
        <div className='flex max-w-2xl flex-col space-y-1.5'>
          <h1 className='text-foreground text-md font-bold'>Programs</h1>
          <p className='text-muted-foreground text-sm font-medium'>
            People-centered health and wellness tracks. Review bilingual names,
            status, and enrollment at a glance—then open a program to edit
            details or translations.
          </p>
        </div>
        <Button asChild className='shrink-0'>
          <Link href={ROUTES.ADMIN.MODULES.PROGRAMS.CREATE}>
            <PlusIcon className='size-4' />
            Create program
          </Link>
        </Button>
      </div>

      <ProgramListTable />
    </div>
  );
}
