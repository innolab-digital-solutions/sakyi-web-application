'use client';

import { useParams } from 'next/navigation';

import PageHeader from '@/components/admin/layout/PageHeader';
import BlogPostForm from '@/components/admin/modules/blog-posts/PostForm';

export default function BlogPostEditPage() {
  const params = useParams<{ id: string }>();
  const id = Number.parseInt(params.id ?? '', 10);

  return (
    <div className='space-y-8'>
      <PageHeader
        title='Edit blog post'
        description='Adjust English and Myanmar titles, excerpts, and body copy; update category, thumbnail, and publish status. Save your changes when the post should reflect the latest content and settings in the library.'
      />

      {Number.isNaN(id) ? (
        <p className='text-destructive text-sm'>Invalid post.</p>
      ) : (
        <BlogPostForm mode='edit' postId={id} />
      )}
    </div>
  );
}
