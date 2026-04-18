import type { Metadata } from 'next';

import PageHeader from '@/components/admin/layout/PageHeader';
import BlogPostForm from '@/components/admin/modules/blog-posts/PostForm';

export const metadata: Metadata = {
  title: 'Add blog post | SaKyi Admin',
  description:
    'Create a new article with English and Myanmar fields, optional thumbnail, category, and publish status before it appears in the blog library.',
};

export default function BlogPostCreatePage() {
  return (
    <div className='space-y-8'>
      <PageHeader
        title='Add blog post'
        description='Enter titles, excerpts, and rich text for each language, assign a category and image, and choose draft or published status. Save when you are ready to add this entry to the library.'
      />

      <BlogPostForm mode='create' />
    </div>
  );
}
