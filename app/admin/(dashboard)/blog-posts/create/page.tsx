import { ArrowLeftIcon } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import PageHeader from '@/components/admin/layout/PageHeader';
import BlogPostForm from '@/components/admin/modules/blog-posts/PostForm';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';

export const metadata: Metadata = {
  title: 'Create Blog Post | SaKyi Admin',
  description:
    'Create a bilingual blog post with category, thumbnail, and publish controls for consistent editorial workflow.',
};

export default function BlogPostCreatePage() {
  return (
    <div className='space-y-8'>
      <PageHeader
        title='Create Blog Post'
        description='Create a new bilingual blog post and set category, thumbnail, and publish status before publishing.'
        actions={
          <Button
            asChild
            type='button'
            variant='outline'
            className='text-foreground bg-background hover:bg-muted h-10 shrink-0 gap-1.5 rounded-md border-neutral-300 px-3 text-[13px]! font-semibold'
          >
            <Link href={ROUTES.ADMIN.MODULES.BLOG_POSTS.LIST}>
              <ArrowLeftIcon className='size-3.5' />
              Back to Blog Posts
            </Link>
          </Button>
        }
      />

      <BlogPostForm mode='create' />
    </div>
  );
}
