import type { Metadata } from 'next';
import { Suspense } from 'react';

import PageHeader from '@/components/admin/layout/PageHeader';
import BlogCategoryListTable from '@/components/admin/modules/blog-categories/CategoryListTable';
import BlogCategorySheet from '@/components/admin/modules/blog-categories/CategorySheet';

export const metadata: Metadata = {
  title: 'Blog Categories | SaKyi Admin',
  description:
    'Manage blog categories used to organise articles and posts across the SaKyi platform.',
};

export default function BlogCategoryListPage() {
  return (
    <div className='min-w-0 space-y-8'>
      <PageHeader
        title='Blog Categories'
        description='Organise and manage blog categories used to classify articles and posts. Each category supports both English and Myanmar translations.'
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
