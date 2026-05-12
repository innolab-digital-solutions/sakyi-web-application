/**
 * Payload for `GET /web/admin/period-reports/{id}` (`id` = same as list row `id`).
 * @see period-report-overview.md §2
 */
import type { ReportRunFeedback, ReportRunMetric } from './care-plan-report';
import type {
  ClientReportListGeneratedBy,
  ClientReportListOperationalLogRef,
} from './client-report-list';
import type {
  OperationalLogListCarePlan,
  OperationalLogListClient,
} from './operational-log-list';

export type PeriodReportDetailTimestamps = {
  submitted_for_review_at: string | null;
  published_at: string | null;
  locked_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type PeriodReportDetail = {
  id: number;
  code: string | null;
  status: string;
  operational_log_id: number | null;
  adherence_percentage: number | null;
  period: { starts_on: string; ends_on: string };
  metrics: ReportRunMetric[];
  highlights?: unknown[] | null;
  feedback: ReportRunFeedback | null;
  timestamps: PeriodReportDetailTimestamps | null;
  is_editable: boolean;
  operational_log: ClientReportListOperationalLogRef;
  care_plan: OperationalLogListCarePlan | null;
  client: OperationalLogListClient | null;
  generated_by: ClientReportListGeneratedBy | null;
};
