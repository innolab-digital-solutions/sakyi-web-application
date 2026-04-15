import { ArrowLeftIcon } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import PageHeader from '@/components/admin/layout/PageHeader';
import BlogPostForm from '@/components/admin/modules/blog-posts/PostForm';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';

export const metadata: Metadata = {
  title: 'Create Blog Post | SaKyi Admin',
};

export default function BlogPostCreatePage() {
  return (
    <div className='space-y-8'>
      <div className='flex items-center gap-4'>
        <Button asChild variant='ghost' size='icon' className='cursor-pointer'>
          <Link href={ROUTES.ADMIN.MODULES.BLOG_POSTS.LIST}>
            <ArrowLeftIcon className='size-4' />
          </Link>
        </Button>
        <PageHeader
          title='Create Blog Post'
          description='Write a new post with bilingual content in English and Myanmar.'
        />
      </div>
      <BlogPostForm mode='create' />
    </div>
  );
}
