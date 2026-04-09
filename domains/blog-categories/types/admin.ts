export type BlogCategoryTranslation = {
  locale: 'en' | 'my';
  name: string;
  slug: string;
  description: string | null;
};

export type BlogCategory = {
  id: number;
  is_active: boolean;
  name: string;
  slug: string;
  description: string;
  timestamps: {
    created_at: string;
    updated_at: string;
  };
};
