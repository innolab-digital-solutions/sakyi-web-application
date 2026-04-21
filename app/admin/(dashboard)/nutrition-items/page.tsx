import type { Metadata } from 'next';
import { Suspense } from 'react';

import PageHeader from '@/components/admin/layout/PageHeader';
import NutritionItemListTable from '@/components/admin/modules/nutrition-items/ItemListTable';
import NutritionItemSheet from '@/components/admin/modules/nutrition-items/ItemSheet';

export const metadata: Metadata = {
  title: 'Food Items | SaKyi Admin',
  description:
    'Manage standardized food items used in nutrition planning with consistent category and measurement assignments.',
};

export default function NutritionItemListPage() {
  return (
    <div className='min-w-0 space-y-8'>
      <PageHeader
        title='Food Items'
        description='Manage shared food items so nutrition entries stay consistent with the right category and optional measurement defaults.'
        actions={<NutritionItemSheet mode='create' />}
      />

      <Suspense
        fallback={
          <div className='text-muted-foreground rounded-md border border-dashed p-8 text-center text-sm'>
            Loading…
          </div>
        }
      >
        <NutritionItemListTable />
      </Suspense>
    </div>
  );
}
