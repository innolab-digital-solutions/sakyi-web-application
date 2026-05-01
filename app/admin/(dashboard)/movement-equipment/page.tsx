import type { Metadata } from 'next';
import { Suspense } from 'react';

import { AdminTablePageSkeleton } from '@/components/admin/layout/AdminLoadingSkeletons';
import PageHeader from '@/components/admin/layout/PageHeader';
import MovementEquipmentListTable from '@/components/admin/modules/movement-equipment/EquipmentListTable';
import MovementEquipmentSheet from '@/components/admin/modules/movement-equipment/EquipmentSheet';

export const metadata: Metadata = {
  title: 'Equipment | SaKyi Admin',
  description:
    'Manage a shared movement equipment catalog so exercise instructions and program setup use clear, consistent terminology across the team.',
};

export default function MovementEquipmentListPage() {
  return (
    <div className='min-w-0 space-y-8'>
      <PageHeader
        title='Equipment'
        description='Manage a shared movement equipment catalog so exercise instructions and program setup use clear, consistent terminology across the team.'
        actions={<MovementEquipmentSheet mode='create' />}
      />

      <Suspense fallback={<AdminTablePageSkeleton />}>
        <MovementEquipmentListTable />
      </Suspense>
    </div>
  );
}
