import type { Metadata } from 'next';
import { Suspense } from 'react';

import PageHeader from '@/components/admin/layout/PageHeader';
import NutritionCategoryListTable from '@/components/admin/modules/nutrition-categories/CategoryListTable';
import NutritionCategorySheet from '@/components/admin/modules/nutrition-categories/CategorySheet';

export const metadata: Metadata = {
  title: 'Nutrition Categories | SaKyi Admin',
  description:
    'Manage nutrition categories used to organize food items and supplements across wellness programs.',
};

export default function NutritionCategoryListPage() {
  return (
    <div className='min-w-0 space-y-8'>
      <PageHeader
        title='Nutrition Categories'
        description='Organize and manage nutrition categories used to classify food items, supplements, and nutrients. Control category hierarchy, descriptions, and active status from one place.'
        actions={<NutritionCategorySheet mode='create' />}
      />

      <Suspense
        fallback={
          <div className='text-muted-foreground rounded-md border border-dashed p-8 text-center text-sm'>
            Loading categories…
          </div>
        }
      >
        <NutritionCategoryListTable />
      </Suspense>
    </div>
  );
}
