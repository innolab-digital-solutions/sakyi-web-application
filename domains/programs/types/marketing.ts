export type Program = {
  id: number;
  title: string;
  slug: string;
  tagline: string;
  excerpt: string;
  about: string;
  /** Card / hero summary (API may mirror `excerpt`). */
  overview: string;
  /** Long-form copy (API may mirror `about`). */
  description: string;
  /** Publication state for listing filters. */
  status: 'draft' | 'published' | 'archived';
  features: string[];
  ideals: string[];
  expectations: string[];
  structures: string[];
  thumbnail_url: string;
  duration: string;
  price: {
    amount: number;
    currency: string;
  };
};
