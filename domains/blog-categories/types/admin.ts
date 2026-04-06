export type BlogCategoryTranslation = {
  locale: 'en' | 'my';
  name: string;
  slug: string;
  description: string | null;
};

export type BlogCategory = {
  id: number;
  is_active: boolean;
  translations: BlogCategoryTranslation[];
  timestamps: {
    created_at: string;
    updated_at: string;
  };
};
