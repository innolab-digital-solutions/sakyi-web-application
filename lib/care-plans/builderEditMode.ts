import type { CarePlanStatus } from '@/domains/care-plans/types/admin';

/**
 * True when the API reports client logging is paused for an ACTIVE care plan
 * (admin edit mode). Treats only strict `true` as paused.
 */
export function isClientLoggingPaused(
  value: boolean | null | undefined,
): boolean {
  return value === true;
}

/**
 * Whether day section content, notes, and motivation may be edited in the
 * builder. ACTIVE plans require `client_logging_paused` (enter-edit-mode).
 * Draft/scheduled stay editable without that gate. Detail mode is always read-only.
 */
export function canEditCarePlanDayContent(args: {
  mode: 'edit' | 'detail';
  status: CarePlanStatus | null;
  clientLoggingPaused?: boolean | null;
}): boolean {
  if (args.mode === 'detail') return false;
  if (args.status === 'draft' || args.status === 'scheduled') return true;
  if (args.status === 'active') {
    return isClientLoggingPaused(args.clientLoggingPaused);
  }
  return false;
}

/**
 * Whether start/end dates and day regeneration may change. Always blocked for
 * ACTIVE plans — even while logging is paused — use revision instead.
 */
export function canEditCarePlanTimeline(args: {
  mode: 'edit' | 'detail';
  status: CarePlanStatus | null;
}): boolean {
  if (args.mode === 'detail') return false;
  return args.status === 'draft' || args.status === 'scheduled';
}

/**
 * First human-readable message from a Laravel-style `care_plan` error field.
 */
export function firstCarePlanFieldErrorMessage(
  errors: Record<string, unknown> | undefined,
): string | undefined {
  if (!errors) return undefined;
  const raw = errors.care_plan;
  if (typeof raw === 'string' && raw.trim()) return raw.trim();
  if (Array.isArray(raw)) {
    for (const entry of raw) {
      if (typeof entry === 'string' && entry.trim()) return entry.trim();
    }
  }
  return undefined;
}

/**
 * Detects the backend 422 that requires enter-edit-mode before content saves
 * on an ACTIVE plan.
 */
export function isEnterEditModeRequiredError(input: {
  errors?: Record<string, unknown>;
  message?: string | null;
}): boolean {
  const field = firstCarePlanFieldErrorMessage(input.errors) ?? '';
  const message = (input.message ?? '').trim();
  const haystack = `${field} ${message}`.toLowerCase();
  return haystack.includes('enter edit mode');
}
