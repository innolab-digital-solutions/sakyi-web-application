import type { Metadata } from 'next';
import { Suspense } from 'react';

import PageHeader from '@/components/admin/layout/PageHeader';
import MovementEquipmentListTable from '@/components/admin/modules/movement-equipment/EquipmentListTable';
import MovementEquipmentSheet from '@/components/admin/modules/movement-equipment/EquipmentSheet';

export const metadata: Metadata = {
  title: 'Exercise equipment | SaKyi Admin',
  description:
    'Maintain the shared catalog of exercise equipment used when building movement programs and exercise libraries.',
};

export default function MovementEquipmentListPage() {
  return (
    <div className='min-w-0 space-y-8'>
      <PageHeader
        title='Exercise equipment'
        description='Search and curate the catalog of gear referenced across exercises. Add or edit names so coaches and content stay consistent; remove items only when nothing in the library should reference them.'
        actions={<MovementEquipmentSheet mode='create' />}
      />

      <Suspense
        fallback={
          <div className='text-muted-foreground rounded-md border border-dashed p-8 text-center text-sm'>
            Loading…
          </div>
        }
      >
        <MovementEquipmentListTable />
      </Suspense>
    </div>
  );
}
