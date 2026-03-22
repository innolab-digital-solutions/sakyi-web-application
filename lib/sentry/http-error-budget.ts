/**
 * Rules for which HTTP statuses should create Sentry events under a tight quota.
 * Skips common auth, validation, and not-found noise; keeps server, network,
 * timeout, and throttling signals.
 */
const QUIET_CLIENT_ERROR_STATUSES = new Set([
  400, 401, 403, 404, 419, 422,
]);

export const shouldReportHttpStatusForBudget = (httpStatus: number): boolean => {
  if (httpStatus === 0) return true;
  // Laravel (and similar) may return HTTP 200 with a JSON `status: "error"` body.
  if (httpStatus === 200) return false;
  if (httpStatus >= 500) return true;
  if (httpStatus === 408 || httpStatus === 429) return true;
  if (QUIET_CLIENT_ERROR_STATUSES.has(httpStatus)) return false;
  if (httpStatus >= 400 && httpStatus < 500) return false;
  return true;
};
