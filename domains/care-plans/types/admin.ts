export const CARE_PLAN_STATUSES = [
  'draft',
  'active',
  'completed',
  'cancelled',
] as const;

export type CarePlanStatus = (typeof CARE_PLAN_STATUSES)[number];

export interface AdminCarePlan {
  id: number;
  code: string | null;
  enrollment_id: number | null;
  cycle_number: number | null;
  status: string;
  starts_on: string | null;
  ends_on: string | null;
  counts?: {
    days?: number | null;
  };
  enrollment?: {
    id: number;
    code: string | null;
    client?: {
      id: number;
      name: string | null;
      email: string | null;
      picture_url: string | null;
    } | null;
    program?: {
      id: number;
      code: string | null;
      title: string | null;
      thumbnail_url?: string | null;
    } | null;
  } | null;
  timestamps?: {
    created_at: string | null;
    updated_at: string | null;
    activated_at?: string | null;
    completed_at?: string | null;
  };
}

export type CarePlanSectionKey =
  | 'nutrition'
  | 'movement'
  | 'activity'
  | 'recovery';

export type CarePlanSectionItem = {
  id?: number | string;
  title?: string | null;
  guidance?: string | null;
  notes?: string | null;
  target_value?: number | string | null;
  target_unit?: string | null;
  movement_exercise_id?: number | string | null;
  exercise_id?: number | string | null;
  exercises?: Array<{
    movement_exercise_id: number | string;
    sets?: number | string | null;
    reps?: number | string | null;
    rest_seconds?: number | string | null;
  }> | null;
  [key: string]: unknown;
};

export interface AdminCarePlanDay {
  id: number;
  day_number: number;
  target_date: string | null;
  general_notes: string | null;
  sections: Record<CarePlanSectionKey, CarePlanSectionItem[]>;
}

export interface AdminCarePlanBuilder {
  id: number;
  code: string | null;
  status: string;
  enrollment_id: number | null;
  cycle_number: number | null;
  starts_on: string | null;
  ends_on: string | null;
  days: AdminCarePlanDay[];
}

export type CarePlanValidationIssue = {
  field: string;
  message: string;
};

export type CarePlanValidationResult = {
  is_valid: boolean;
  issues: CarePlanValidationIssue[];
};
