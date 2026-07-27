import type { CarePlanEmbeddedOperationalLog } from './operational-log-embed';

export type CarePlanLogSection =
  | 'nutrition'
  | 'movement'
  | 'activity'
  | 'hydration'
  | 'sleep'
  | 'recovery';

export type CarePlanLogCompletionSignal = {
  window_days_total: number | null;
  window_elapsed_days: number | null;
  window_progress_percentage: number | null;
  logged_days_count: number;
  logging_progress_percentage: number | null;
  is_logging_recent: boolean | null;
};

export type CarePlanLogEnrollmentContext = {
  id: number;
  code: string | null;
  status: string | null;
  client: {
    id: number | null;
    client_code: string | null;
    name: string | null;
    email: string | null;
    picture_url: string | null;
  } | null;
  program: {
    id: number | null;
    code: string | null;
    thumbnail_url: string | null;
    title: string | null;
  } | null;
} | null;

export type CarePlanLogSummary = {
  id: number;
  code: string | null;
  cycle_number: number | null;
  status: string | null;
  starts_on: string | null;
  ends_on: string | null;
  last_logged_at: string | null;
  days_count: number | null;
  completion_signal: CarePlanLogCompletionSignal | null;
  enrollment: CarePlanLogEnrollmentContext;
  /** Present when loaded; at most one per care plan. */
  operational_log?: CarePlanEmbeddedOperationalLog | null;
  timestamps: {
    created_at: string | null;
    updated_at: string | null;
  } | null;
};

export type CarePlanLogEntry = {
  id: number;
  logged_at: string | null;
  is_completed: boolean | null;
  section: CarePlanLogSection | null;
  item_title: string | null;
  day_number: number | null;
  target_date: string | null;
  target:
    | {
        value: number | string | null;
        unit: string | null;
      }
    | null
    | undefined;
  actual:
    | {
        value: number | string | null;
        unit: string | null;
      }
    | null
    | undefined;
  notes: string | null;
  meta?: unknown;
  media_count: number | null;
  media?: Array<{
    id: number;
    url: string;
    original_name: string | null;
  }> | null;
};

export type ListCarePlanLogEntriesParams = {
  section?: CarePlanLogSection;
  is_completed?: boolean;
  date_from?: string;
  date_to?: string;
  search?: string;
  page?: number;
  per_page?: number;
};
