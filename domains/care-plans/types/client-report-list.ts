/**
 * `GET /period-reports` rows — client report lifecycle only.
 * @see operational-logs-and-reports.md §5.2
 */
import type {
  OperationalLogListCarePlan,
  OperationalLogListClient,
} from './operational-log-list';

export type ClientReportListPeriod = {
  starts_on: string | null;
  ends_on: string | null;
};

export type ClientReportListOperationalLogRef = {
  id: number;
  code: string | null;
} | null;

export type ClientReportListTimestamps = {
  submitted_for_review_at: string | null;
  published_at: string | null;
  locked_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type ClientReportListGeneratedBy = {
  id: number | null;
  name: string | null;
};

export type ClientReportListRow = {
  id: number;
  code: string | null;
  status: 'in_review' | 'published' | 'archived' | string;
  is_editable: boolean;
  adherence_percentage: number | null;
  period: ClientReportListPeriod;
  operational_log: ClientReportListOperationalLogRef;
  care_plan: OperationalLogListCarePlan | null;
  client: OperationalLogListClient | null;
  generated_by: ClientReportListGeneratedBy | null;
  timestamps: ClientReportListTimestamps | null;
};
