import { PlusIcon } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

import PageHeader from '@/components/admin/layout/PageHeader';
import ProgramListTable from '@/components/admin/modules/programs/ProgramListTable';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';

export const metadata: Metadata = {
  title: 'Care Programs | SaKyi Admin',
  description:
    'Manage care programs with consistent pricing, goals, language content, and publication visibility across the catalog.',
};

export default function ProgramListsPage() {
  return (
    <div className='min-w-0 space-y-8'>
      <PageHeader
        title='Care Programs'
        description='Manage the care program catalog so pricing, goals, language content, and publication status stay accurate.'
        actions={
          <Button
            asChild
            className='h-10 shrink-0 gap-1.5 rounded-md px-2.5 text-[13px]! font-semibold'
          >
            <Link href={ROUTES.ADMIN.MODULES.PROGRAMS.CREATE}>
              <PlusIcon className='size-3.5' />
              Add Care Program
            </Link>
          </Button>
        }
      />

      <Suspense
        fallback={
          <div className='text-muted-foreground rounded-md border border-dashed p-8 text-center text-sm'>
            Loading programs…
          </div>
        }
      >
        <ProgramListTable />
      </Suspense>
    </div>
  );
}
