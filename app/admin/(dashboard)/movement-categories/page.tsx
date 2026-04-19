import type { Metadata } from 'next';
import { Suspense } from 'react';

import PageHeader from '@/components/admin/layout/PageHeader';
import MovementCategoryListTable from '@/components/admin/modules/movement-categories/CategoryListTable';
import MovementCategorySheet from '@/components/admin/modules/movement-categories/CategorySheet';

export const metadata: Metadata = {
  title: 'Movement Categories | SaKyi Admin',
  description:
    'Maintain movement categories for the movement library: names, descriptions, and parent relationships for organizing exercises.',
};

export default function MovementCategoryListPage() {
  return (
    <div className='min-w-0 space-y-8'>
      <PageHeader
        title='Movement Categories'
        description='Review this list, search by name or parent, and add or edit movement categories so exercises stay grouped consistently in the movement library.'
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
