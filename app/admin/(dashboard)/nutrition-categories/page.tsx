import type { Metadata } from 'next';
import { Suspense } from 'react';

import { AdminTablePageSkeleton } from '@/components/admin/layout/AdminLoadingSkeletons';
import PageHeader from '@/components/admin/layout/PageHeader';
import NutritionCategoryListTable from '@/components/admin/modules/nutrition-categories/CategoryListTable';
import NutritionCategorySheet from '@/components/admin/modules/nutrition-categories/CategorySheet';

export const metadata: Metadata = {
  title: 'Food Categories | SaKyi Admin',
  description:
    'Manage food categories in a shared nutrition taxonomy so items stay organized, searchable, and consistently grouped across planning workflows.',
};

export default function NutritionCategoryListPage() {
  return (
    <div className='min-w-0 space-y-8'>
      <PageHeader
        title='Food Categories'
        description='Manage food categories in a shared nutrition taxonomy so items stay organized, searchable, and consistently grouped across planning workflows.'
        actions={<NutritionCategorySheet mode='create' />}
      />

      <Suspense fallback={<AdminTablePageSkeleton />}>
        <NutritionCategoryListTable />
      </Suspense>
    </div>
  );
}
