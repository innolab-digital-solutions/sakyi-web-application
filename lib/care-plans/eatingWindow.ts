import { format, parse } from 'date-fns';

import type { CarePlanLogEvidence } from '@/domains/care-plans/types/care-plan-report';

/** 24-hour `HH:mm` clock time for nutrition eating window / eaten_at. */
const HH_MM_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

/**
 * Normalizes a clock time to `HH:mm`, or returns empty string when absent /
 * invalid. Accepts `HH:mm` and `HH:mm:ss` (seconds are dropped).
 */
export function normalizeEatingWindowHHmm(
  value: unknown,
): string {
  if (value == null) return '';
  const raw = String(value).trim();
  if (!raw) return '';

  const withSeconds = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.exec(raw);
  if (withSeconds) {
    return `${withSeconds[1]}:${withSeconds[2]}`;
  }

  if (HH_MM_PATTERN.test(raw)) return raw;
  return '';
}

/**
 * Whether the value is a valid `HH:mm` string (or empty / null, which clears).
 */
export function isValidEatingWindowInput(value: unknown): boolean {
  if (value == null) return true;
  const raw = String(value).trim();
  if (!raw) return true;
  return normalizeEatingWindowHHmm(raw) !== '';
}

/**
 * Formats `HH:mm` for admin display (e.g. `13:00` → `1:00 PM`).
 * Returns null when the value is missing or invalid — never invents a default.
 */
export function formatClockTimeLabel(
  value: unknown,
): string | null {
  const hhmm = normalizeEatingWindowHHmm(value);
  if (!hhmm) return null;
  const parsed = parse(hhmm, 'HH:mm', new Date(2000, 0, 1));
  if (Number.isNaN(parsed.getTime())) return null;
  return format(parsed, 'h:mm a');
}

/**
 * Payload value for nutrition upsert: `HH:mm` or `null` to clear.
 */
export function eatingWindowForSavePayload(
  value: unknown,
): string | null {
  const hhmm = normalizeEatingWindowHHmm(value);
  return hhmm || null;
}

/**
 * Resolves client-logged eat time from a log, preferring `log.eaten_at` over
 * `log.meta.eaten_at`. Returns null when absent or unrecognized.
 */
export function resolveEatenAtFromLog(
  log: CarePlanLogEvidence | null | undefined,
): string | null {
  if (!log) return null;
  const fromField = normalizeEatingWindowHHmm(log.eaten_at);
  if (fromField) return fromField;
  const fromMeta = normalizeEatingWindowHHmm(log.meta?.eaten_at);
  return fromMeta || null;
}

/**
 * Whether an evidence / log item is a nutrition task.
 */
export function isNutritionEvidenceItem(item: {
  section?: string | null;
  morph?: string | null;
}): boolean {
  return item.section === 'nutrition' || item.morph === 'nutrition';
}

/**
 * Admin copy for planned eating window on evidence cards.
 */
export function formatPlannedEatingWindowLabel(
  eatingWindow: unknown,
): string | null {
  const label = formatClockTimeLabel(eatingWindow);
  return label ? `Eat at ${label}` : null;
}

/**
 * Admin copy for client-logged eat time on evidence cards.
 */
export function formatLoggedEatenAtLabel(eatenAt: unknown): string | null {
  const label = formatClockTimeLabel(eatenAt);
  return label ? `Logged at ${label}` : null;
}
