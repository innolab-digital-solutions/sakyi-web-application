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
  id: number;
  position: string;
  user: {
    id: number;
    name: string;
    email: string;
    picture_url: string | null;
  };
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
  current_active_plan?: {
    id: number;
    code: string;
    starts_on: string | null;
    ends_on: string | null;
  } | null;
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
  /** From linked intake (`onboarding_intake`); omitted when intake/request not eager-loaded or missing. */
  enrollment_request?: { id: number; code: string } | null;
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
  team_members?: EnrollmentTeamMemberPayload[];
}
