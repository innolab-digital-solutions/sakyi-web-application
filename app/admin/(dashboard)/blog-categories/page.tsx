import type { Metadata } from 'next';
import { Suspense } from 'react';

import PageHeader from '@/components/admin/layout/PageHeader';
import BlogCategoryListTable from '@/components/admin/modules/blog-categories/CategoryListTable';
import BlogCategorySheet from '@/components/admin/modules/blog-categories/CategorySheet';

export const metadata: Metadata = {
  title: 'Blog categories | SaKyi Admin',
  description:
    'Create and edit blog categories with English and Myanmar labels for organising articles.',
};

export default function BlogCategoryListPage() {
  return (
    <div className='min-w-0 space-y-8'>
      <PageHeader
        title='Blog categories'
        description='Categories group posts in the library and on the site. Switch list language to review English or Myanmar labels before editing.'
        actions={<BlogCategorySheet mode='create' />}
      />

      <Suspense
        fallback={
          <div className='text-muted-foreground rounded-md border border-dashed p-8 text-center text-sm'>
            Loading categories…
          </div>
        }
      >
        <BlogCategoryListTable />
      </Suspense>
    </div>
  );
}
