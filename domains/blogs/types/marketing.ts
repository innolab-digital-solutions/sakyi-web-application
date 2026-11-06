export type BlogCategory = {
  id: string;
  name: string;
  slug: string;
};

export type BlogPost = {
  id: string;
  status: 'draft' | 'published' | 'archived';
  thumbnail_url: string | null;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  category: BlogCategory;
  timestamps?: {
    published_at: string | null;
    archived_at: string | null;
    created_at: string;
    updated_at: string;
  };
};
