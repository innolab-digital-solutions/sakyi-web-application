export interface AdminEnrollment {
  id: number;
  code: string;
  status: string;
  starts_at: string | null;
  ends_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  cancellation_note: string | null;
  notes: string | null;
  client?: {
    id: number;
    client_code: string | null;
    name: string;
    email: string;
    picture_url: string | null;
  };
  program?: {
    id: number;
    code: string;
    duration: string | null;
    price: number;
    thumbnail_url: string | null;
    title?: string;
    slug?: string;
  };
  onboarding_intake?: { id: number; code: string } | null;
  enrollment_contract?: {
    id: number;
    code: string;
    status: string;
    signed_at: string | null;
  } | null;
  timestamps: {
    created_at: string | null;
    updated_at: string | null;
  };
}

/** `profile` on list: only `picture_url`. On show: full shape below. */
export interface ClientProfileUserProfile {
  picture_url: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  dob?: string | null;
  gender?: string | null;
  address?: string | null;
  focus?: { id: number; name: string | null } | null;
}

export interface ClientProfile {
  id: number;
  client_code: string | null;
  name: string;
  email: string;
  enrollments_count: number;
  profile: ClientProfileUserProfile | null;
  /** Often included on index for sorting and “last activity” columns. */
  timestamps?: {
    created_at: string | null;
    updated_at: string | null;
  };
  /** Present on show (`GET .../client-profiles/:id`), omitted on index. */
  enrollments?: AdminEnrollment[];
}
