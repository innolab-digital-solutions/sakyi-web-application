export type EnrollmentRequestStatus =
  | 'pending'
  | 'contacted'
  | 'cancelled'
  | 'completed';

export type EnrollmentRequestResource = {
  id: number;
  code: string;
  phone: string;
  status: EnrollmentRequestStatus;
  notes: string | null;
  contacted_at: string | null; // ISO 8601
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
    thumbnail_url: string;
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
  timestamps: {
    created_at: string | null; // ISO 8601
    updated_at: string | null; // ISO 8601
  };
};
