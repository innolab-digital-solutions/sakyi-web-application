import { STATUS } from '../constants';

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
  status: (typeof STATUS)[keyof typeof STATUS];
  timestamps: {
    published_at: string | null;
    archived_at: string | null;
    created_at: string;
    updated_at: string;
  };
  goals?: { id: string; name: string; slug: string }[];
  /**
   * Enrollment count when the list API includes aggregate stats (Laravel often
   * exposes this as `enrolled_count`).
   */
  enrolled_count?: number;
};
