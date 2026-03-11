export type Program = {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  overview: string;
  description: string;
  features: string[];
  ideals: string[];
  expectations: string[];
  structures: string[];
  thumbnail_url: string;
  duration: string;
  price: string;
  status: string;
  timestamps: {
    published_at: string | null;
    archived_at: string | null;
    created_at: string;
    updated_at: string;
  };
  goals?: {
    id: string;
    name: string;
    slug: string;
  }[];
};
