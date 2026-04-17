export type EnrollmentContractStatus = 'assigned' | 'signed';

export type EnrollmentContract = {
  id: number;
  code: string;
  status: EnrollmentContractStatus;
  sent_at: string | null;
  signed_at: string | null;
  signed_by_name: string | null;
  accepted_terms: boolean;
  enrollment_request_id: number;
  onboarding_intake_id: number;
  client?: {
    id: number;
    name: string;
    email: string;
  } | null;
  timestamps: {
    created_at: string | null;
    updated_at: string | null;
  };
};
