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
  description: 'Manage blog posts with bilingual content.',
};

export default function BlogPostListPage() {
  return (
    <div className='min-w-0 space-y-8'>
      <PageHeader
        title='Blog Posts'
        description='Create and manage blog posts with English and Myanmar translations. Control status and content from one place.'
        actions={
          <Button asChild size='lg'>
            <Link href={ROUTES.ADMIN.MODULES.BLOG_POSTS.CREATE}>
              <PlusIcon className='size-4' />
              Create Post
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
