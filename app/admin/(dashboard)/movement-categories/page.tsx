import type { Metadata } from 'next';
import { Suspense } from 'react';

import PageHeader from '@/components/admin/layout/PageHeader';
import MovementCategoryListTable from '@/components/admin/modules/movement-categories/CategoryListTable';
import MovementCategorySheet from '@/components/admin/modules/movement-categories/CategorySheet';

export const metadata: Metadata = {
  title: 'Movement Categories | SaKyi Admin',
  description:
    'Manage movement categories used to organize exercises and movement patterns across wellness programs.',
};

export default function MovementCategoryListPage() {
  return (
    <div className='min-w-0 space-y-8'>
      <PageHeader
        title='Movement Categories'
        description='Organize and manage movement categories used to classify exercises and movement patterns. Control category hierarchy, descriptions, and active status from one place.'
        actions={<MovementCategorySheet mode='create' />}
      />

      <Suspense
        fallback={
          <div className='text-muted-foreground rounded-md border border-dashed p-8 text-center text-sm'>
            Loading categories…
          </div>
        }
      >
        <MovementCategoryListTable />
      </Suspense>
    </div>
  );
}
