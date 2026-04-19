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
        description='Updates both language versions of this post. Revise titles, excerpts, and rich text; change category, thumbnail, or published switch as needed. Save when the library and public blog should show the latest content and visibility.'
      />

      {Number.isNaN(id) ? (
        <p className='text-destructive text-sm'>Invalid post.</p>
      ) : (
        <BlogPostForm mode='edit' postId={id} />
      )}
    </div>
  );
}
