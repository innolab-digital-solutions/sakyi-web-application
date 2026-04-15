'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowLeftIcon } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import PageHeader from '@/components/admin/layout/PageHeader';
import BlogPostForm from '@/components/admin/modules/blog-posts/PostForm';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ENDPOINTS } from '@/config/api/endpoints';
import { ROUTES } from '@/config/routes';
import { getAdminBlogPostById } from '@/domains/blogs/services';

export default function BlogPostEditPage() {
  const params = useParams<{ id: string }>();
  const idParam = params.id;
  const id = Number.parseInt(idParam, 10);

  const { data, isPending, isError, error } = useQuery({
    queryKey: [ENDPOINTS.ADMIN.MODULES.BLOG_POSTS.DETAIL(idParam), id],
    queryFn: async () => {
      const response = await getAdminBlogPostById(id);
      if (response.status === 'error') throw new Error(response.message);
      return response.data;
    },
    enabled: !Number.isNaN(id),
  });

  return (
    <div className='space-y-8'>
      <div className='flex items-center gap-4'>
        <Button asChild variant='ghost' size='icon' className='cursor-pointer'>
          <Link href={ROUTES.ADMIN.MODULES.BLOG_POSTS.LIST}>
            <ArrowLeftIcon className='size-4' />
          </Link>
        </Button>
        <PageHeader
          title='Edit Blog Post'
          description='Update post content, translations, and settings.'
        />
      </div>

      {isPending && (
        <div className='space-y-4'>
          <Skeleton className='h-10 w-full' />
          <Skeleton className='h-10 w-full' />
          <Skeleton className='h-64 w-full' />
        </div>
      )}

      {isError && (
        <p className='text-destructive text-sm'>
          {error instanceof Error ? error.message : 'Failed to load post.'}
        </p>
      )}

      {data && <BlogPostForm mode='edit' post={data} />}
    </div>
  );
}
