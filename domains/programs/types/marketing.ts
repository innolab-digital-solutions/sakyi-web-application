export type Program = {
  id: number;
  title: string;
  slug: string;
  tagline: string;
  excerpt: string;
  about: string;
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
