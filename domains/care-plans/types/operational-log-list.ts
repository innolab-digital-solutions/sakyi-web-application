/**
 * `GET /operational-logs` rows — internal operational logs only.
 * @see operational-logs-and-reports.md §5.1
 */
export type OperationalLogListPeriod = {
  starts_on: string | null;
  ends_on: string | null;
};

export type OperationalLogListCarePlan = {
  id: number;
  code: string | null;
  status: string | null;
  starts_on: string | null;
  ends_on: string | null;
};

export type OperationalLogListClient = {
  id: number | null;
  name: string | null;
  client_code: string | null;
  email: string | null;
  picture_url: string | null;
};

export type OperationalLogListActor = {
  id: number | null;
  name: string | null;
};

/** Linked client report after submit-for-review; null until then. */
export type OperationalLogListClientReportRef = {
  id: number;
  code: string | null;
  status: string | null;
} | null;

export type OperationalLogListTimestamps = {
  locked_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type OperationalLogListRow = {
  id: number;
  code: string | null;
  status: 'in_progress' | 'locked' | string;
  is_editable: boolean;
  adherence_percentage: number | null;
  period: OperationalLogListPeriod;
  client_report: OperationalLogListClientReportRef;
  care_plan: OperationalLogListCarePlan | null;
  client: OperationalLogListClient | null;
  created_by: OperationalLogListActor | null;
  timestamps: OperationalLogListTimestamps | null;
};
