/** Lifecycle values from admin API (`enrollment-mutation-logic.md`). */
export const ENROLLMENT_LIFECYCLE_STATUSES = [
  'scheduled',
  'active',
  'completed',
  'cancelled',
] as const;

export type EnrollmentLifecycleStatus =
  (typeof ENROLLMENT_LIFECYCLE_STATUSES)[number];

/** Care team row as returned on show / accepted on PATCH care-team. */
export type EnrollmentTeamMemberPayload = {
  user_id: number;
  position: string;
};

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
  /** Present on detail; used for care-team PATCH (full roster). */
  team_members?: EnrollmentTeamMemberPayload[];
}
