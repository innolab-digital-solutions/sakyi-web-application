import type { Metadata } from 'next';
import { Suspense } from 'react';

import PageHeader from '@/components/admin/layout/PageHeader';
import NutritionCategoryListTable from '@/components/admin/modules/nutrition-categories/CategoryListTable';
import NutritionCategorySheet from '@/components/admin/modules/nutrition-categories/CategorySheet';

export const metadata: Metadata = {
  title: 'Food Categories | SaKyi Admin',
  description:
    'Manage standardized food categories for the nutrition library so items remain organized and searchable across planning workflows.',
};

export default function NutritionCategoryListPage() {
  return (
    <div className='min-w-0 space-y-8'>
      <PageHeader
        title='Food Categories'
        description='Manage shared food categories so nutrition items stay grouped consistently across planning workflows.'
        actions={<NutritionCategorySheet mode='create' />}
      />

      <Suspense
        fallback={
          <div className='text-muted-foreground rounded-md border border-dashed p-8 text-center text-sm'>
            Loading…
          </div>
        }
      >
        <NutritionCategoryListTable />
      </Suspense>
    </div>
  );
}
