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
    'Review wellness program catalog entries: reference codes, bilingual titles, duration and price, publish dates, enrollment counts, and status—filter by language and visibility before opening a program to edit.',
};

export default function ProgramListsPage() {
  return (
    <div className='min-w-0 space-y-8'>
      <PageHeader
        title='Care Programs'
        description='Maintain the program catalog your clients and enrollment flows rely on. Scan codes, pricing, and publication state at a glance; switch list language to verify copy, then open a row to edit overview, translations, or goals.'
        actions={
          <Button
            asChild
            className='h-10 shrink-0 gap-1.5 rounded-md px-2.5 text-[13px]! font-semibold'
          >
            <Link href={ROUTES.ADMIN.MODULES.PROGRAMS.CREATE}>
              <PlusIcon className='size-3.5' />
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
