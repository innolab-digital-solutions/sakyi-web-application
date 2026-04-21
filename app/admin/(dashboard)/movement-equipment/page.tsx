import type { Metadata } from 'next';
import { Suspense } from 'react';

import PageHeader from '@/components/admin/layout/PageHeader';
import MovementEquipmentListTable from '@/components/admin/modules/movement-equipment/EquipmentListTable';
import MovementEquipmentSheet from '@/components/admin/modules/movement-equipment/EquipmentSheet';

export const metadata: Metadata = {
  title: 'Equipment | SaKyi Admin',
  description:
    'Manage the standardized equipment catalog used across exercises and movement programs.',
};

export default function MovementEquipmentListPage() {
  return (
    <div className='min-w-0 space-y-8'>
      <PageHeader
        title='Equipment'
        description='Manage shared movement equipment so exercise instructions and program setup stay consistent.'
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
