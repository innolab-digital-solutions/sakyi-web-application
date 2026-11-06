import type { Metadata } from 'next';
import { Suspense } from 'react';

import { AdminTablePageSkeleton } from '@/components/admin/layout/AdminLoadingSkeletons';
import PageHeader from '@/components/admin/layout/PageHeader';
import UnitListTable from '@/components/admin/modules/units/UnitListTable';
import UnitSheet from '@/components/admin/modules/units/UnitSheet';

export const metadata: Metadata = {
  title: 'Measurement Reference | SaKyi Admin',
  description:
    'Manage shared measurement references used across care plans, operational logs, and reporting so quantities are recorded clearly and consistently.',
};

export default function UnitListPage() {
  return (
    <div className='min-w-0 space-y-8'>
      <PageHeader
        title='Measurement Reference'
        description='Manage shared measurement references used across care plans, operational logs, and reporting so quantities are recorded clearly and consistently.'
        actions={<UnitSheet mode='create' />}
      />
      <Suspense fallback={<AdminTablePageSkeleton />}>
        <UnitListTable />
      </Suspense>
    </div>
  );
}
