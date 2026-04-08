export type BlogPostStatus = 'draft' | 'published' | 'archived';

export type BlogPostTranslation = {
  locale: 'en' | 'my';
  title: string;
  excerpt: string | null;
  content: string;
};

export type AdminBlogPost = {
  id: number;
  status: BlogPostStatus;
  thumbnail: string | null;
  blog_category: { id: number; name: string } | null;
  translations: BlogPostTranslation[];
  timestamps: {
    published_at: string | null;
    archived_at: string | null;
    created_at: string;
    updated_at: string;
  };
};
