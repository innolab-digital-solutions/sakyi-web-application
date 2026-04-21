import { PlusIcon } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

import PageHeader from '@/components/admin/layout/PageHeader';
import BlogPostListTable from '@/components/admin/modules/blog-posts/PostListTable';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';

export const metadata: Metadata = {
  title: 'Blog Posts | SaKyi Admin',
  description:
    'Manage bilingual blog posts with consistent category, thumbnail, and publish status controls.',
};

export default function BlogPostListPage() {
  return (
    <div className='min-w-0 space-y-8'>
      <PageHeader
        title='Blog Posts'
        description='Manage shared blog posts with bilingual content, category, thumbnail, and publish settings.'
        actions={
          <Button
            asChild
            className='h-10 shrink-0 gap-1.5 rounded-md px-3 text-[13px]! font-semibold'
          >
            <Link href={ROUTES.ADMIN.MODULES.BLOG_POSTS.CREATE}>
              <PlusIcon className='size-3.5' />
              Add blog post
            </Link>
          </Button>
        }
      />

      <Suspense
        fallback={
          <div className='text-muted-foreground rounded-md border border-dashed p-8 text-center text-sm'>
            Loading posts…
          </div>
        }
      >
        <BlogPostListTable />
      </Suspense>
    </div>
  );
}
