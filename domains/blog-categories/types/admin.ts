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
  actions: {
    deletable: boolean;
    delete_block_reason?: string | null;
  };
  timestamps: {
    created_at: string;
    updated_at: string;
  };
};
