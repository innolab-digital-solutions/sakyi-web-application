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
 * Whether the generate / regenerate / update-client-report dialog can open.
 * Published reports stay available (same UI as in review). Archived is hidden.
 */
export function canShowSubmitOperationalLogForReview(args: {
  operationalLog: OperationalLogGating;
  clientReport: ClientReportGating;
}): boolean {
  const { operationalLog, clientReport } = args;
  if (operationalLog == null) return false;
  if (operationalLog.is_editable === false) return false;
  if (isArchivedClientReportStatus(clientReport?.status)) return false;
  if (clientReport?.is_editable === false) return false;
  if (isPublishedClientReportStatus(clientReport?.status)) return true;
  if (normalizeStatus(operationalLog.status) === 'locked') return false;
  return true;
}

/**
 * Whether the dialog confirm action is enabled.
 * Draft logs must be saved to `in_progress` first. Published logs stay enabled.
 */
export function canConfirmClientReportAuthoring(args: {
  operationalLog: OperationalLogGating;
  clientReport: ClientReportGating;
}): boolean {
  if (!canShowSubmitOperationalLogForReview(args)) return false;
  if (isPublishedClientReportStatus(args.clientReport?.status)) return true;
  return normalizeStatus(args.operationalLog?.status) === 'in_progress';
}
