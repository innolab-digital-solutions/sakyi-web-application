export type EnrollmentRequestStatus =
  | 'pending'
  | 'contacted'
  | 'cancelled'
  | 'completed';

export type EnrollmentRequestResource = {
  id: number;
  phone: string;
  status: EnrollmentRequestStatus;
  notes: string | null;
  contacted_at: string | null; // ISO 8601
  client?: {
    id: number;
    name: string;
    email: string;
  };
  program?: {
    id: number;
    duration: number | string; // depends on backend cast
    price: number | string; // depends on backend cast
    title?: string;
    slug?: string;
  };
  handler?: {
    id: number;
    name: string;
    email: string;
  };
  timestamps: {
    created_at: string | null; // ISO 8601
    updated_at: string | null; // ISO 8601
  };
};
