import type { Metadata } from 'next';
import { Suspense } from 'react';

import { AdminTablePageSkeleton } from '@/components/admin/layout/AdminLoadingSkeletons';
import PageHeader from '@/components/admin/layout/PageHeader';
import NutritionItemListTable from '@/components/admin/modules/nutrition-items/ItemListTable';
import NutritionItemSheet from '@/components/admin/modules/nutrition-items/ItemSheet';

export const metadata: Metadata = {
  title: 'Food Items | SaKyi Admin',
  description:
    'Manage a shared food item library with consistent category and measurement references so nutrition planning and tracking remain accurate.',
};

export default function NutritionItemListPage() {
  return (
    <div className='min-w-0 space-y-8'>
      <PageHeader
        title='Food Items'
        description='Manage a shared food item library with consistent category and measurement references so nutrition planning and tracking remain accurate.'
        actions={<NutritionItemSheet mode='create' />}
      />

      <Suspense fallback={<AdminTablePageSkeleton />}>
        <NutritionItemListTable />
      </Suspense>
    </div>
  );
}
