import type { Metadata } from 'next';
import { Suspense } from 'react';

import PageHeader from '@/components/admin/layout/PageHeader';
import UnitListTable from '@/components/admin/modules/units/UnitListTable';
import UnitSheet from '@/components/admin/modules/units/UnitSheet';

export const metadata: Metadata = {
  title: 'Measurement Units | SaKyi Admin',
  description:
    'Manage measurement units used across nutrition and wellness tracking. Define unit types, abbreviations, and availability.',
};

export default function UnitListPage() {
  return (
    <div className='min-w-0 space-y-8'>
      <PageHeader
        title='Measurement Units'
        description='View and manage all measurement units used in nutrition profiles and items. Control unit types, abbreviations, and active status from one place.'
        actions={<UnitSheet mode='create' />}
      />

      <Suspense
        fallback={
          <div className='text-muted-foreground rounded-md border border-dashed p-8 text-center text-sm'>
            Loading units…
          </div>
        }
      >
        <UnitListTable />
      </Suspense>
    </div>
  );
}
