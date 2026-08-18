import type { CarePlanSectionKey } from './admin';

/** Client report row (`care_plan_report_runs`). */
export type ReportRunStatus = 'in_review' | 'published' | 'archived';

export type CarePlanReportMediaRef = {
  id?: number;
  url: string;
  [key: string]: unknown;
};

export type CarePlanLogEvidence = {
  id: number;
  is_completed?: boolean;
  actual_value: number | string | null;
  unit: string | null;
  notes: string | null;
  meta?: Record<string, unknown> | null;
  media?: CarePlanReportMediaRef[];
};

/**
 * Sticky note left by the enrolled client on a care-plan task.
 * Shown only on report-workspace evidence; never counts as a log.
 */
export type CarePlanTaskClientNote = {
  id: number;
  body: string;
  updated_at: string | null;
};

export type CarePlanReportEvidenceItem = {
  section: CarePlanSectionKey;
  morph: string;
  item_id: number;
  title: string;
  guidance: string | null;
  target: {
    value: number | string | null;
    unit: string | null;
    unit_id: number | null;
  } | null;
  log: CarePlanLogEvidence | null;
  /** Sticky client note for this task; independent of daily progress logs. */
  client_note?: CarePlanTaskClientNote | null;
};

/** Day-level photo attached directly to a care-plan day (not to a specific log item). */
export type CarePlanReportDayPhoto = {
  id: number;
  url: string;
  mime_type: string;
  size_bytes: number;
  original_name: string;
  created_at: string;
};

export type CarePlanReportEvidenceDay = {
  day_index: number;
  day_number: number;
  target_date: string;
  photos: CarePlanReportDayPhoto[] | null;
  items: CarePlanReportEvidenceItem[];
};

export type ReportMetricDailyPoint = {
  day_number: number;
  target_value: number | null;
  actual_value: number | null;
  on_target: boolean;
  meta?: Record<string, unknown> | null;
};

export type ReportRunMetric = {
  section: CarePlanSectionKey;
  metric_key: string;
  label: string;
  target_value: number | null;
  actual_value: number | null;
  /** Short token for payloads (e.g. `kcal`, `steps`); use {@link unit_name} when present. */
  unit: string | null;
  /**
   * Full display label for the unit when the API provides it; preferred over
   * {@link unit} in read-only UI when both exist.
   */
  unit_name?: string | null;
  days_on_target: number;
  days_total: number;
  display_order: number;
  meta?: Record<string, unknown> | null;
  daily_points: ReportMetricDailyPoint[];
};

export type ReportRunFeedback = {
  summary: string | null;
  focus_next_period: string | null;
  notes: string | null;
};

/** Internal operational log snapshot in the workspace (metrics only; no feedback). */
export type OperationalLogSnapshot = {
  id: number;
  code: string | null;
  status: 'draft' | 'in_progress' | 'locked';
  is_editable: boolean;
  adherence_percentage: number | null;
  metrics: ReportRunMetric[];
  client_report_id?: number | null;
};

export type CarePlanReportRunSummary = {
  id: number;
  code: string | null;
  status: ReportRunStatus;
  adherence_percentage: number | null;
  period?: { starts_on: string; ends_on: string } | null;
  period_starts_on?: string;
  period_ends_on?: string;
  is_editable?: boolean;
  timestamps?: {
    submitted_for_review_at?: string | null;
    published_at?: string | null;
    locked_at?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
  };
  generated_by?: { id: number; name?: string | null } | null;
};

export type CarePlanReportRun = CarePlanReportRunSummary & {
  metrics: ReportRunMetric[];
  feedback: ReportRunFeedback | null;
};

export type CarePlanReportWorkspace = {
  care_plan: {
    id: number;
    code: string | null;
    status: string;
    starts_on: string | null;
    ends_on: string | null;
  };
  client: {
    id: number;
    name: string | null;
    client_code: string | null;
    email: string | null;
    picture_url: string | null;
  };
  period: { starts_on: string; ends_on: string };
  evidence: CarePlanReportEvidenceDay[];
  suggested_metrics: ReportRunMetric[];
  /** Internal worksheet; null until created for the range. */
  operational_log: OperationalLogSnapshot | null;
  /** Client report (narrative + lifecycle); null until submit-for-review. */
  client_report: CarePlanReportRun | null;
  /** @deprecated Server alias for `client_report`. */
  report_run: CarePlanReportRun | null;
  report_generation_defaults?: {
    average_inputs?: {
      avg_intake?: { value: number | null; unit: string | null } | null;
      avg_burn?: { value: number | null; unit: string | null } | null;
      avg_steps?: { value: number | null; unit: string | null } | null;
      avg_training_time?: { value: number | null; unit: string | null } | null;
    } | null;
  } | null;
};

export type ListCarePlanReportRunsData = {
  client_reports?: CarePlanReportRunSummary[];
  /** @deprecated Use `client_reports`. */
  report_runs?: CarePlanReportRunSummary[];
};

/** `POST .../operational-logs/draft` — body usually empty; period defaults to the care plan’s full range. */
export type CreateOperationalLogDraftPayload = {
  period_starts_on?: string;
  period_ends_on?: string;
};

/**
 * `POST .../operational-logs` (with metrics) — creates **`in_progress`**, not a draft.
 * Use {@link CreateOperationalLogDraftPayload} and `postCarePlanOperationalLogDraft` for a draft.
 */
export type CreateOperationalLogPayload = {
  /** Omitted: server defaults the period to the care plan’s `starts_on` / `ends_on`. */
  period_starts_on?: string;
  period_ends_on?: string;
  /** Required; at least one item. */
  metrics: ReportRunMetric[];
  adherence_percentage?: number | null;
};

/** Legacy `POST /report-runs` uses the same body as `POST /operational-logs`. */
export type CreateCarePlanReportRunPayload = CreateOperationalLogPayload;

export type UpdateOperationalLogPayload = {
  metrics?: ReportRunMetric[];
  adherence_percentage?: number | null;
};

export type SubmitForReviewManualHighlightPayload = {
  metric_key: string;
  label: string;
  value: number;
  unit: string | null;
  is_visible_to_client: boolean;
};

export type SubmitOperationalLogForReviewPayload = {
  feedback?: ReportRunFeedback;
  average_inputs?: {
    avg_intake?: number;
    avg_burn?: number;
    avg_steps?: number;
    avg_training_time?: number;
  };
  included_metric_keys?: string[];
  manual_highlights?: SubmitForReviewManualHighlightPayload[];
};

/** `PUT` client report: feedback required; highlights replace the full list when sent. */
export type UpdateCarePlanReportHighlightPayload = {
  metric_key: string;
  label: string;
  value: number;
  unit: string | null;
  source?: string;
  is_visible_to_client: boolean;
  display_order?: number;
};

export type UpdateCarePlanReportRunPayload = {
  feedback: ReportRunFeedback;
  highlights?: UpdateCarePlanReportHighlightPayload[];
};

export type PublishCarePlanReportRunPayload = {
  adherence_percentage?: number | null;
};

/** `PUT …/days/{day}/nutritions/{nutrition}/actual-calories` body. */
export type PutNutritionActualCaloriesPayload = {
  /** Required key; `null` clears the value. */
  actual_value: number | null;
};

export type NutritionActualCaloriesDayRollup = {
  day_number: number;
  target_value: number | null;
  actual_value: number | null;
  on_target: boolean;
};

export type NutritionActualCaloriesMealsTotalKcal = {
  metric_key: string;
  label: string;
  target_value: number | null;
  actual_value: number | null;
  days_on_target: number;
  days_total: number;
  daily_point: ReportMetricDailyPoint;
};

/**
 * Success `data` from nutrition actual-calories PUT.
 * When `meals_total_kcal` is null (typical for draft before metrics are
 * persisted on the op log), only the task log + `day_rollup` are returned;
 * the UI still applies `day_rollup` to All Nutrition Meals locally.
 */
export type NutritionActualCaloriesResult = {
  log: CarePlanLogEvidence;
  day_rollup: NutritionActualCaloriesDayRollup;
  meals_total_kcal: NutritionActualCaloriesMealsTotalKcal | null;
};
