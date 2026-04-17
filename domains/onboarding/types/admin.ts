import type { ApiSuccess } from '@/types/api';

// -------------------------------------
// Shared onboarding value types
// -------------------------------------
export type OnboardingQuestionType =
  | 'text'
  | 'number'
  | 'select'
  | 'multiselect'
  | 'date'
  | 'file';

export type OnboardingStatus =
  | 'draft'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type UserLite = {
  id: number;
  name: string;
  email: string;
};

export type OnboardingQuestionOption =
  | string
  | {
      label: string;
      value: string;
    };

// -------------------------------------
// Onboarding Template resource
// -------------------------------------
export type OnboardingTemplateQuestion = {
  id: number;
  question: string;
  key: string;
  type: OnboardingQuestionType;
  options: OnboardingQuestionOption[] | null;
  required: boolean;
  sort_order: number;
};

export type OnboardingTemplateSection = {
  id: number;
  title: string;
  description: string | null;
  sort_order: number;
  questions: OnboardingTemplateQuestion[];
};

export type OnboardingTemplateData = {
  id: number;
  title: string;
  description: string | null;
  version: number;
  sections: OnboardingTemplateSection[];
};

// endpoint: GET /onboarding/templates/{version}
export type OnboardingTemplateResponse = ApiSuccess<OnboardingTemplateData>;

// -------------------------------------
// Onboarding Intake resource
// -------------------------------------
export type OnboardingIntakeQuestion = {
  id: number;
  question: string;
  key: string;
  type: OnboardingQuestionType | string;
  required: boolean;
  options: OnboardingQuestionOption[] | unknown | null;
  answer: Record<string, unknown> | unknown | null; // e.g. { value: "..."} / { values: [...] } / file meta object
};

export type OnboardingIntakeSection = {
  id: number;
  title: string;
  description: string | null;
  sort_order: number;
  questions: OnboardingIntakeQuestion[];
};

export type OnboardingIntakeTemplate = {
  id: number;
  title: string;
  version: number;
  sections: OnboardingIntakeSection[];
};

export type OnboardingIntake = {
  id: number;
  code: string;
  status: string;
  notes: string | null;
  cancellation_note: string | null;
  enrollment_request?: {
    id: number;
    code: string;
  } | null;
  client?: {
    id: number;
    client_code: string | null;
    name: string;
    email: string;
    picture_url: string | null;
  };
  handler?: {
    id: number;
    name: string;
    email: string;
    picture_url: string | null;
    role: string | null;
  };
  program?: {
    id: number;
    code: string;
    thumbnail_url: string | null;
    title?: string;
    slug?: string;
  } | null;
  template?: OnboardingIntakeTemplate;
  timestamps: {
    created_at: string | null; // ISO string
    updated_at: string | null; // ISO string
  };
};

export type OnboardingIntakeData = OnboardingIntake;

export type OnboardingProgressMeta = {
  progress: {
    answered_required: number;
    total_required: number;
    completion_rate: number;
  };
};

export type OnboardingProgress = OnboardingProgressMeta['progress'];

// endpoint: GET /onboarding/intakes/{id}, PUT section save, POST complete, POST cancel
export type OnboardingIntakeResponse = ApiSuccess<
  OnboardingIntakeData,
  Partial<OnboardingProgressMeta>
>;

// -------------------------------------
// Intake list response (index)
// -------------------------------------
export type PaginationMeta = {
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number | null;
    to: number | null;
    has_more_pages: boolean;
    path: string;
    next_page_url: string | null;
    prev_page_url: string | null;
  };
};

// endpoint: GET /onboarding/intakes
export type OnboardingIntakeListResponse = ApiSuccess<
  OnboardingIntakeData[],
  PaginationMeta
>;

export type OnboardingIntakeListStatusFilter = Extract<
  OnboardingStatus,
  'draft' | 'in_progress' | 'completed' | 'cancelled'
>;

export type OnboardingListIntakesParams = {
  status?: OnboardingIntakeListStatusFilter;
  per_page?: number;
  page?: number;
};

export type CreateOnboardingIntakePayload = {
  enrollment_request_id: number;
  onboarding_template_id: number;
  notes?: string;
};

export type CancelOnboardingIntakePayload = {
  cancellation_note?: string;
};

export type OnboardingQuestionAnswerValue =
  | string
  | number
  | null
  | string[]
  | number[];

export type SaveOnboardingSectionAnswerInput = {
  question_id: number;
  answer?: OnboardingQuestionAnswerValue;
  file?: File | null;
};

export type SaveOnboardingSectionPayload = {
  answers: SaveOnboardingSectionAnswerInput[];
};
