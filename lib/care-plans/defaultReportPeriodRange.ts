import { format, isValid, parse } from 'date-fns';

function parseYmdLocal(s: string): Date | null {
  const d = parse(s.trim(), 'yyyy-MM-dd', new Date());
  return isValid(d) ? d : null;
}

/**
 * Suggests a 7-day window ending "today" (capped to plan end) for report workflow UIs.
 * Used when opening create-draft or defaulting the workspace period.
 */
export function defaultReportPeriodForCarePlan(
  carePlanStartsOn: string | null,
  carePlanEndsOn: string | null,
): { periodStartsOn: string; periodEndsOn: string } | null {
  if (!carePlanStartsOn?.trim() || !carePlanEndsOn?.trim()) return null;
  const start = parseYmdLocal(carePlanStartsOn);
  const end = parseYmdLocal(carePlanEndsOn);
  if (!start || !end) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let periodEnd = end.getTime() < today.getTime() ? end : today;
  if (periodEnd.getTime() < start.getTime()) periodEnd = end;
  const periodStart = new Date(periodEnd);
  periodStart.setDate(periodStart.getDate() - 6);
  if (periodStart.getTime() < start.getTime()) {
    return {
      periodStartsOn: format(start, 'yyyy-MM-dd'),
      periodEndsOn: format(periodEnd, 'yyyy-MM-dd'),
    };
  }
  return {
    periodStartsOn: format(periodStart, 'yyyy-MM-dd'),
    periodEndsOn: format(periodEnd, 'yyyy-MM-dd'),
  };
}
