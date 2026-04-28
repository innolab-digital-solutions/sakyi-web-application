import { STATUS } from '../constants';

/** One timeline / phase block within a program translation. */
export type ProgramStructureItem = {
  period: string;
  title: string;
  description: string;
};

/** Per-locale content for admin forms and translation save step. */
export type ProgramTranslation = {
  locale: 'en' | 'my';
  title: string;
  /** Present when loaded from API; generated server-side — not sent on save. */
  slug?: string | null;
  tagline: string;
  excerpt: string;
  about: string;
  features: string[];
  ideals: string[];
  expectations: string[];
  structures: ProgramStructureItem[];
};

export type Program = {
  id: number;
  code: string;
  title?: string | null;
  slug?: string | null;
  tagline?: string | null;
  excerpt: string;
  about: string;
  features: string[];
  ideals: string[];
  expectations: string[];
  structures: {
    period: string;
    title: string;
    description: string;
  }[];
  thumbnail_url?: string | null;
  duration?: string | null;
  price:
    | number
    | {
        amount: number;
        currency: string;
      };
  status: (typeof STATUS)[keyof typeof STATUS];
  actions: {
    deletable: boolean;
    delete_block_reason?: string | null;
  };
  timestamps: {
    published_at: string | null;
    archived_at: string | null;
    created_at: string;
    updated_at: string;
  };
  goals?: { id: number | string; name: string; slug: string }[];
  enrolled_count?: number;
};
