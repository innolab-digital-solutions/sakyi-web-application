export type EnrollmentRequestStatus =
  | 'pending'
  | 'contacted'
  | 'cancelled'
  | 'completed';

/** Summary row shipped on the enrollment request resource for pipeline context. */
export type EnrollmentRequestEnrollmentSummary = {
  id: number;
  code: string;
  /** e.g. `scheduled`, `active`, `completed`, `cancelled` */
  status: string;
  /** Date-only `YYYY-MM-DD` */
  starts_at: string | null;
  ends_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
};

export type EnrollmentRequestContractSummary = {
  id: number;
  code: string;
  status: string;
  sent_at: string | null;
  signed_at: string | null;
  voided_at: string | null;
  void_reason: string | null;
};

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
    client_code?: string | null;
    name?: string | null;
    email?: string | null;
    picture_url?: string | null;
    /** From client profile — may differ from top-level enrollment request fields */
    contact_phone?: string | null;
    contact_email?: string | null;
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
  contract?: EnrollmentRequestContractSummary | null;
  onboarding_intake?: {
    id: number;
    code: string;
    status: 'draft' | 'in_progress' | 'completed' | 'cancelled';
    cancellation_note: string | null;
    completed_at?: string | null;
    cancelled_at?: string | null;
  } | null;
  timestamps: {
    created_at: string | null; // ISO 8601
    updated_at: string | null; // ISO 8601
  };
  /**
   * Present when onboarding intake relation is eager-loaded; may be omitted
   * from some callers — treat as empty when absent.
   */
  enrollments?: EnrollmentRequestEnrollmentSummary[];
};
