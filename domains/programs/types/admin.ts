import { STATUS } from '../constants';

/**
 * Per-locale translation data returned by the detail endpoint inside `translations[]`.
 */
export type ProgramTranslation = {
  locale: 'en' | 'my';
  title: string;
  tagline: string | null;
  excerpt: string | null;
  about: string | null;
  features: string[];
  ideals: string[];
  expectations: string[];
  structures: string[];
};

export type Program = {
  id: number;
  /**
   * Flat localized fields — merged at the top level by the list endpoint
   * (loads `translation` singular). Absent on the detail endpoint.
   */
  slug?: string | null;
  title?: string | null;
  tagline?: string | null;
  thumbnail_url?: string | null;
  duration?: string | null;
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
   * All locales — returned by the detail endpoint (loads `translations` plural).
   * Use this to pre-populate the wizard in edit mode.
   */
  translations?: ProgramTranslation[];
  enrolled_count?: number;
};
