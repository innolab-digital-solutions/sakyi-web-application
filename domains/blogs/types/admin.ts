export type BlogPostStatus = 'draft' | 'published' | 'archived';

export type AdminBlogPost = {
  id: number;
  status: BlogPostStatus;
  thumbnail: string | null;
  blog_category: { id: number; name: string } | null;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  actions: {
    deletable: boolean;
    delete_block_reason?: string | null;
  };
  timestamps: {
    published_at: string | null;
    archived_at: string | null;
    created_at: string;
    updated_at: string;
  };
};
