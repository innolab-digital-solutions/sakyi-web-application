import type { Metadata } from 'next';

import PageHeader from '@/components/admin/layout/PageHeader';
import BlogPostForm from '@/components/admin/modules/blog-posts/PostForm';

export const metadata: Metadata = {
  title: 'Add blog post | SaKyi Admin',
  description:
    'Draft a new library article with English and Myanmar fields, optional thumbnail and category, and a published switch—so editors can prepare copy before it appears on the public blog.',
};

export default function BlogPostCreatePage() {
  return (
    <div className='space-y-8'>
      <PageHeader
        title='Add blog post'
        description='Compose titles, excerpts, and body copy per language; attach a category and optional thumbnail; use the published switch when the post should be live. Save to add the entry to the admin library and site feed according to your status choice.'
      />

      <BlogPostForm mode='create' />
    </div>
  );
}
