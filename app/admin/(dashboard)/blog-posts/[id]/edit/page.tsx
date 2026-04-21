'use client';

import { ArrowLeftIcon } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import PageHeader from '@/components/admin/layout/PageHeader';
import BlogPostForm from '@/components/admin/modules/blog-posts/PostForm';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';

export default function BlogPostEditPage() {
  const params = useParams<{ id: string }>();
  const id = Number.parseInt(params.id ?? '', 10);

  return (
    <div className='space-y-8'>
      <PageHeader
        title='Edit Blog Post'
        description='Edit bilingual blog content and update category, thumbnail, or publish status so the article remains accurate and aligned with editorial standards.'
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

      {Number.isNaN(id) ? (
        <p className='text-destructive text-sm'>Invalid post.</p>
      ) : (
        <BlogPostForm mode='edit' postId={id} />
      )}
    </div>
  );
}
