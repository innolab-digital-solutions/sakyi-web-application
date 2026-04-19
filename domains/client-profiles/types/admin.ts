import type { AdminEnrollment } from '@/domains/enrollment-records/types/admin';

export type { AdminEnrollment };

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
