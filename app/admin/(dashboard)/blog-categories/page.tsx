import type { Metadata } from 'next';
import { Suspense } from 'react';

import PageHeader from '@/components/admin/layout/PageHeader';
import BlogCategoryListTable from '@/components/admin/modules/blog-categories/CategoryListTable';
import BlogCategorySheet from '@/components/admin/modules/blog-categories/CategorySheet';

export const metadata: Metadata = {
  title: 'Blog Categories | SaKyi Admin',
  description:
    'Manage standardized blog categories with bilingual labels so articles stay organized across admin and public views.',
};

export default function BlogCategoryListPage() {
  return (
    <div className='min-w-0 space-y-8'>
      <PageHeader
        title='Blog Categories'
        description='Manage shared blog categories with English and Myanmar labels so article grouping stays consistent.'
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
