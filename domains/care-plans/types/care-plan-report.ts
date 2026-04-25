import type { CarePlanSectionKey } from './admin';

export type ReportRunStatus = 'draft' | 'published' | 'generated';

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
  unit: string | null;
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

export type CarePlanReportRunSummary = {
  id: number;
  code: string | null;
  status: ReportRunStatus;
  adherence_percentage: number | null;
  period?: { starts_on: string; ends_on: string } | null;
  period_starts_on?: string;
  period_ends_on?: string;
  generated_at?: string | null;
  published_at?: string | null;
  locked_at?: string | null;
  generated_by?: { id: number; name?: string | null } | null;
  timestamps?: { created_at?: string | null; updated_at?: string | null };
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
  report_run: CarePlanReportRun | null;
};

export type ListCarePlanReportRunsData = {
  report_runs: CarePlanReportRunSummary[];
};

export type CreateCarePlanReportRunPayload = {
  period_starts_on: string;
  period_ends_on: string;
  metrics: ReportRunMetric[];
  adherence_percentage?: number | null;
  feedback?: ReportRunFeedback | null;
};

export type UpdateCarePlanReportRunPayload = {
  metrics?: ReportRunMetric[];
  feedback?: ReportRunFeedback | null;
  adherence_percentage?: number | null;
};

export type PublishCarePlanReportRunPayload = {
  adherence_percentage?: number | null;
};
