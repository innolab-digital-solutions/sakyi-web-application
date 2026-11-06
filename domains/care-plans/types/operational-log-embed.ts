/**
 * `operational_log` embedded on care plan list and care-plan-log list/show payloads.
 * At most one operational log per care plan.
 *
 * @see operational-logs-and-reports.md §4.5.4 (care plan logging), §1 (one row per plan)
 */
export type CarePlanEmbeddedOperationalLog = {
  id: number;
  code: string | null;
  status?: string | null;
  is_editable?: boolean;
  period?: {
    starts_on: string | null;
    ends_on: string | null;
  };
};
