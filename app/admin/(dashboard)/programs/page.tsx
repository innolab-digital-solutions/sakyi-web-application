import { PlusIcon } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

import PageHeader from '@/components/admin/layout/PageHeader';
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
      <PageHeader
        title='Programs'
        description='People-centered health and wellness tracks. Review bilingual names, status, and enrollment at a glance—then open a program to edit details or translations.'
        actions={
          <Button asChild>
            <Link href={ROUTES.ADMIN.MODULES.PROGRAMS.CREATE}>
              <PlusIcon className='size-4' />
              Create program
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
