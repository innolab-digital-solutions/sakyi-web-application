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

// -------------------------------------
// Onboarding Template resource
// -------------------------------------
export type OnboardingTemplateQuestion = {
  id: number;
  question: string;
  key: string;
  type: OnboardingQuestionType;
  options: unknown[] | null; // backend currently returns question options as mixed array/null
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
  type: OnboardingQuestionType;
  required: boolean;
  options: unknown[] | null;
  answer: Record<string, unknown> | null; // e.g. { value: "..."} / { values: [...] } / file meta object
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

export type OnboardingIntakeData = {
  id: number;
  status: OnboardingStatus;
  notes: string | null;
  user?: UserLite; // whenLoaded in resource => optional at type level
  handler?: UserLite; // whenLoaded in resource => optional
  template?: OnboardingIntakeTemplate; // whenLoaded in resource => optional
  timestamps: {
    created_at: string | null; // ISO string
    updated_at: string | null; // ISO string
  };
};

export type OnboardingProgressMeta = {
  progress: {
    answered_required: number;
    total_required: number;
    completion_rate: number;
  };
};

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
