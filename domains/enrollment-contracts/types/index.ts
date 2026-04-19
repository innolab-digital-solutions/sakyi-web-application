export type EnrollmentContractStatus = 'assigned' | 'signed';

export interface EnrollmentContractTimestamps {
  sent_at: string | null;
  signed_at: string | null;
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

export interface EnrollmentContract {
  id: number;
  code: string;
  status: EnrollmentContractStatus;
  signed_by_name: string | null;
  signature_url: string | null;
  accepted_terms: boolean;
  /** When present, an enrollment already exists for this contract (unique `enrollment_contract_id`). */
  enrollment_id?: number | null;
  onboarding_intake?: EnrollmentContractOnboardingIntake | null;
  timestamps: EnrollmentContractTimestamps;
}