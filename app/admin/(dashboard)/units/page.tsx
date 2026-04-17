import type { Metadata } from 'next';
import { Suspense } from 'react';

import PageHeader from '@/components/admin/layout/PageHeader';
import UnitListTable from '@/components/admin/modules/units/UnitListTable';
import UnitSheet from '@/components/admin/modules/units/UnitSheet';

export const metadata: Metadata = {
  title: 'Measurement Reference | SaKyi Admin',
  description:
    'Browse and maintain canonical measurements for nutrition and care workflows. Filter by type, add definitions, and remove entries you no longer need.',
};

export default function UnitListPage() {
  return (
    <div className='min-w-0 space-y-8'>
      <PageHeader
        title='Measurement Reference'
        description='Review this catalog, filter by type, and add or edit definitions so abbreviations and dimensions stay consistent across nutrition and care data.'
        actions={<UnitSheet mode='create' />}
      />

      <Suspense
        fallback={
          <div className='text-muted-foreground rounded-md border border-dashed p-8 text-center text-sm'>
            Loading…
          </div>
        }
      >
        <UnitListTable />
      </Suspense>
    </div>
  );
}
