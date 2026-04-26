export type EnrollmentRequestStatus =
  | 'pending'
  | 'contacted'
  | 'cancelled'
  | 'completed';

export type EnrollmentRequestResource = {
  id: number;
  code: string;
  phone: string;
  /** Free-form notes when returned by the admin API. */
  notes?: string | null;
  status: EnrollmentRequestStatus;
  cancellation_note: string | null;
  contacted_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  client?: {
    id: number;
    name: string;
    email: string;
    picture_url?: string;
  };
  program?: {
    id: number;
    code?: string;
    duration: number | string; // depends on backend cast
    price: number | string; // depends on backend cast
    thumbnail_url?: string | null;
    title?: string;
    slug?: string;
  };
  handler?: {
    id: number;
    name: string;
    email: string;
    picture_url?: string;
    role: string;
  };
  onboarding_intake?: {
    id: number;
    code: string;
    status: 'draft' | 'in_progress' | 'completed' | 'cancelled';
  } | null;
  timestamps: {
    created_at: string | null; // ISO 8601
    updated_at: string | null; // ISO 8601
  };
};
