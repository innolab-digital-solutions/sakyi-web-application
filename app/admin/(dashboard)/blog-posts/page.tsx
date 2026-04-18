import { PlusIcon } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

import PageHeader from '@/components/admin/layout/PageHeader';
import BlogPostListTable from '@/components/admin/modules/blog-posts/PostListTable';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';

export const metadata: Metadata = {
  title: 'Blog posts | SaKyi Admin',
  description:
    'Browse and maintain blog articles with bilingual English and Myanmar content, categories, thumbnails, and publish status.',
};

export default function BlogPostListPage() {
  return (
    <div className='min-w-0 space-y-8'>
      <PageHeader
        title='Blog posts'
        description='Articles in this library feed your public blog. Review status and dates at a glance, switch list language to check bilingual titles, then open a post to adjust copy, category, thumbnail, or publish settings.'
        actions={
          <Button
            asChild
            className='h-10 shrink-0 gap-1.5 rounded-md px-2.5 text-[13px]! font-semibold'
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
