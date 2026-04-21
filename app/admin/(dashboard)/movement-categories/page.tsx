import type { Metadata } from 'next';
import { Suspense } from 'react';

import PageHeader from '@/components/admin/layout/PageHeader';
import MovementCategoryListTable from '@/components/admin/modules/movement-categories/CategoryListTable';
import MovementCategorySheet from '@/components/admin/modules/movement-categories/CategorySheet';

export const metadata: Metadata = {
  title: 'Movement Categories | SaKyi Admin',
  description:
    'Manage standardized movement categories so exercises are grouped consistently across movement programming.',
};

export default function MovementCategoryListPage() {
  return (
    <div className='min-w-0 space-y-8'>
      <PageHeader
        title='Movement Categories'
        description='Manage shared movement categories so exercise organization stays consistent across movement programming.'
        actions={<MovementCategorySheet mode='create' />}
      />

      <Suspense
        fallback={
          <div className='text-muted-foreground rounded-md border border-dashed p-8 text-center text-sm'>
            Loading…
          </div>
        }
      >
        <MovementCategoryListTable />
      </Suspense>
    </div>
  );
}
