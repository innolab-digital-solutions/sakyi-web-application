export type Program = {
  id: number;
  title: string;
  slug: string;
  tagline: string;
  excerpt: string;
  about: string;
  /** Publication state for listing filters. */
  status: 'draft' | 'published' | 'archived';
  features: string[];
  ideals: string[];
  expectations: { title: string; description: string }[];
  structures: {
    period: string;
    title: string;
    description: string;
  }[];
  thumbnail_url: string;
  duration: string;
  price: {
    amount: number;
    currency: string;
  };
};
