import type { Metadata } from 'next';
import { Suspense } from 'react';

import PageHeader from '@/components/admin/layout/PageHeader';
import NutritionCategoryListTable from '@/components/admin/modules/nutrition-categories/CategoryListTable';
import NutritionCategorySheet from '@/components/admin/modules/nutrition-categories/CategorySheet';

export const metadata: Metadata = {
  title: 'Food Categories | SaKyi Admin',
  description:
    'Maintain food categories for the nutrition library: names, descriptions, and parent relationships for organizing food items.',
};

export default function NutritionCategoryListPage() {
  return (
    <div className='min-w-0 space-y-8'>
      <PageHeader
        title='Food Categories'
        description='Review this list, search by category or description, and add or edit categories so food items stay grouped consistently in the nutrition library.'
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
