import type {
  EnrollmentRequestEnrollmentSummary,
  EnrollmentRequestResource,
} from '@/domains/enrollment-requests/types';

/**
 * Normalizes `enrollments` from an API payload — defaults when the key is missing.
 */
export function getEnrollmentSummariesFromRequest(
  resource: EnrollmentRequestResource,
): EnrollmentRequestEnrollmentSummary[] {
  const raw = resource.enrollments;
  if (!Array.isArray(raw)) return [];
  return raw;
}

/**
 * Picks a primary enrollment row for summary UI: active → scheduled → first (newest-first list).
 */
export function pickPrimaryEnrollment(
  items: readonly EnrollmentRequestEnrollmentSummary[],
): EnrollmentRequestEnrollmentSummary | null {
  if (items.length === 0) return null;
  const active = items.find((e) => e.status === 'active');
  if (active) return active;
  const scheduled = items.find((e) => e.status === 'scheduled');
  if (scheduled) return scheduled;
  return items[0];
}
