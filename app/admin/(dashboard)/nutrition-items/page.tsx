import type { Metadata } from 'next';
import { Suspense } from 'react';

import PageHeader from '@/components/admin/layout/PageHeader';
import NutritionItemListTable from '@/components/admin/modules/nutrition-items/ItemListTable';
import NutritionItemSheet from '@/components/admin/modules/nutrition-items/ItemSheet';

export const metadata: Metadata = {
  title: 'Food Items | SaKyi Admin',
  description:
    'Maintain food items for the nutrition library: names, categories, optional descriptions, and optional default measurements from the reference catalog.',
};

export default function NutritionItemListPage() {
  return (
    <div className='min-w-0 space-y-8'>
      <PageHeader
        title='Food Items'
        description='Review this list, search by name or description, and add or edit items so ingredients and foods stay organized under food categories with consistent default measurements.'
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
