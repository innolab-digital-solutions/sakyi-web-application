import type { ReportRunStatus } from '@/domains/care-plans/types/care-plan-report';

type OperationalLogGating = {
  status?: string | null;
  is_editable?: boolean;
} | null;

type ClientReportGating = {
  status?: string | null;
  is_editable?: boolean;
} | null;

function normalizeStatus(status: string | null | undefined): string {
  return (status ?? '').trim().toLowerCase();
}

/**
 * True when the client report is archived and must stay read-only.
 */
export function isArchivedClientReportStatus(
  status: string | null | undefined,
): boolean {
  return normalizeStatus(status) === 'archived';
}

/**
 * True when the client report is live on mobile (`published`).
 */
export function isPublishedClientReportStatus(
  status: string | null | undefined,
): boolean {
  return normalizeStatus(status) === 'published';
}

export function isInReviewClientReportStatus(
  status: string | null | undefined,
): boolean {
  return normalizeStatus(status) === 'in_review';
}

/**
 * Whether metrics, daily points, and nutrition actuals can be saved.
 *
 * Locked operational logs and published client reports stay editable so staff
 * can correct human error in place. Archived reports (or `is_editable: false`)
 * remain read-only. When no log exists yet, editing is allowed only if there
 * is also no client report (create-first flow).
 */
export function canEditReportWorkspaceMetrics(args: {
  operationalLog: OperationalLogGating;
  clientReport: ClientReportGating;
}): boolean {
  const { operationalLog, clientReport } = args;

  if (isArchivedClientReportStatus(clientReport?.status)) return false;
  if (clientReport?.is_editable === false) return false;

  if (operationalLog != null) {
    return operationalLog.is_editable !== false;
  }

  return clientReport == null;
}

/**
 * Submit-for-review / generate-report is only for the first publish cycle.
 * After publish the API returns 422; corrections use PUT instead.
 */
export function canShowSubmitOperationalLogForReview(args: {
  operationalLog: OperationalLogGating;
  clientReport: ClientReportGating;
}): boolean {
  const { operationalLog, clientReport } = args;
  if (operationalLog == null) return false;
  if (operationalLog.is_editable === false) return false;
  if (normalizeStatus(operationalLog.status) === 'locked') return false;
  if (isPublishedClientReportStatus(clientReport?.status)) return false;
  if (isArchivedClientReportStatus(clientReport?.status)) return false;
  return true;
}

export function clientReportStatusForGating(
  status: string | null | undefined,
): ReportRunStatus | null {
  const normalized = normalizeStatus(status);
  if (
    normalized === 'in_review' ||
    normalized === 'published' ||
    normalized === 'archived'
  ) {
    return normalized;
  }
  return null;
}
