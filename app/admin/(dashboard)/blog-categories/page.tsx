import type { Metadata } from 'next';
import { Suspense } from 'react';

import { AdminTablePageSkeleton } from '@/components/admin/layout/AdminLoadingSkeletons';
import PageHeader from '@/components/admin/layout/PageHeader';
import BlogCategoryListTable from '@/components/admin/modules/blog-categories/CategoryListTable';
import BlogCategorySheet from '@/components/admin/modules/blog-categories/CategorySheet';

export const metadata: Metadata = {
  title: 'Blog Categories | SaKyi Admin',
  description:
    'Manage bilingual blog categories in one shared library so editors can keep article grouping clear, consistent, and aligned across admin and public views.',
};

export default function BlogCategoryListPage() {
  return (
    <div className='min-w-0 space-y-8'>
      <PageHeader
        title='Blog Categories'
        description='Manage bilingual blog categories in one shared library so editors can keep article grouping clear, consistent, and aligned across admin and public views.'
        actions={<BlogCategorySheet mode='create' />}
      />

      <Suspense fallback={<AdminTablePageSkeleton />}>
        <BlogCategoryListTable />
      </Suspense>
    </div>
  );
}
