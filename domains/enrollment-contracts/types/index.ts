export type EnrollmentContractStatus = 'assigned' | 'signed' | 'voided';

export interface EnrollmentContractTimestamps {
  sent_at: string | null;
  signed_at: string | null;
  voided_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface EnrollmentContractClient {
  id: number;
  client_code: string | null;
  name: string;
  email: string;
  picture_url: string | null;
}

export interface EnrollmentContractEnrollmentRequestRef {
  id: number;
  code: string;
}

export interface EnrollmentContractOnboardingIntake {
  id: number;
  code: string;
  enrollment_request?: EnrollmentContractEnrollmentRequestRef | null;
  client?: EnrollmentContractClient | null;
}

/** Linked program enrollment when one already exists for this contract. */
export interface EnrollmentContractEnrollment {
  id: number;
  code: string;
}

export interface EnrollmentContract {
  id: number;
  code: string;
  status: EnrollmentContractStatus;
  signed_by_name: string | null;
  signature_url: string | null;
  accepted_terms: boolean;
  void_reason?: string | null;
  enrollment?: EnrollmentContractEnrollment | null;
  onboarding_intake?: EnrollmentContractOnboardingIntake | null;
  timestamps: EnrollmentContractTimestamps;
}

/** Whether a program enrollment is already linked (hides “Create enrollment” in admin). */
export function contractHasLinkedEnrollment(
  contract: EnrollmentContract,
): boolean {
  const e = contract.enrollment;
  return e != null && Number.isFinite(e.id) && e.id > 0;
}
