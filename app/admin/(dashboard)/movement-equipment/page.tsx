import type { Metadata } from 'next';
import { Suspense } from 'react';

import PageHeader from '@/components/admin/layout/PageHeader';
import MovementEquipmentListTable from '@/components/admin/modules/movement-equipment/EquipmentListTable';
import MovementEquipmentSheet from '@/components/admin/modules/movement-equipment/EquipmentSheet';

export const metadata: Metadata = {
  title: 'Movement Equipment | SaKyi Admin',
  description:
    'Manage movement equipment used across exercises and wellness programs.',
};

export default function MovementEquipmentListPage() {
  return (
    <div className='min-w-0 space-y-8'>
      <PageHeader
        title='Movement Equipment'
        description='Organize and manage equipment used in movement exercises. Control equipment names, descriptions, and active status from one place.'
        actions={<MovementEquipmentSheet mode='create' />}
      />

      <Suspense
        fallback={
          <div className='text-muted-foreground rounded-md border border-dashed p-8 text-center text-sm'>
            Loading equipment…
          </div>
        }
      >
        <MovementEquipmentListTable />
      </Suspense>
    </div>
  );
}
