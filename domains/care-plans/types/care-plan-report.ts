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
};

export type CarePlanReportEvidenceDay = {
  day_index: number;
  day_number: number;
  target_date: string;
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

/** `PUT` client report: feedback only (object required; fields may be null). */
export type UpdateCarePlanReportRunPayload = {
  feedback: ReportRunFeedback;
};

export type PublishCarePlanReportRunPayload = {
  adherence_percentage?: number | null;
};
