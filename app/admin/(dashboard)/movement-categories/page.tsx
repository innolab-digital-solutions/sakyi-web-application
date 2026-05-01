import type { Metadata } from 'next';
import { Suspense } from 'react';

import { AdminTablePageSkeleton } from '@/components/admin/layout/AdminLoadingSkeletons';
import PageHeader from '@/components/admin/layout/PageHeader';
import MovementCategoryListTable from '@/components/admin/modules/movement-categories/CategoryListTable';
import MovementCategorySheet from '@/components/admin/modules/movement-categories/CategorySheet';

export const metadata: Metadata = {
  title: 'Movement Categories | SaKyi Admin',
  description:
    'Manage movement categories in a shared taxonomy so exercises stay organized consistently across planning, coaching, and program delivery.',
};

export default function MovementCategoryListPage() {
  return (
    <div className='min-w-0 space-y-8'>
      <PageHeader
        title='Movement Categories'
        description='Manage movement categories in a shared taxonomy so exercises stay organized consistently across planning, coaching, and program delivery.'
        actions={<MovementCategorySheet mode='create' />}
      />

      <Suspense fallback={<AdminTablePageSkeleton />}>
        <MovementCategoryListTable />
      </Suspense>
    </div>
  );
}
