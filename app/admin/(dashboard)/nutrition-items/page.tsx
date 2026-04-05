import type { Metadata } from 'next';
import { Suspense } from 'react';

import PageHeader from '@/components/admin/layout/PageHeader';
import NutritionItemListTable from '@/components/admin/modules/nutrition-items/ItemListTable';
import NutritionItemSheet from '@/components/admin/modules/nutrition-items/ItemSheet';

export const metadata: Metadata = {
  title: 'Nutrition Items | SaKyi Admin',
  description:
    'Manage nutrition items used to build meal plans and track dietary intake across wellness programs.',
};

export default function NutritionItemListPage() {
  return (
    <div className='min-w-0 space-y-8'>
      <PageHeader
        title='Nutrition Items'
        description='View and manage all nutrition items in the library. Assign categories, default units, and control availability from one place.'
        actions={<NutritionItemSheet mode='create' />}
      />

      <Suspense
        fallback={
          <div className='text-muted-foreground rounded-md border border-dashed p-8 text-center text-sm'>
            Loading items…
          </div>
        }
      >
        <NutritionItemListTable />
      </Suspense>
    </div>
  );
}
