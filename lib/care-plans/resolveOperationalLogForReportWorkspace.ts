import type { AdminCarePlan } from '@/domains/care-plans/types/admin';
import type {
  CarePlanReportWorkspace,
  OperationalLogSnapshot,
} from '@/domains/care-plans/types/care-plan-report';

import { carePlanEmbedToOperationalLogSnapshot } from './carePlanEmbedToOperationalLogSnapshot';

/**
 * Resolves the operational log the UI should use for **edit gating**, **active id**
 * (PUT), and read-only copy. The report-workspace `GET` may return a light
 * `operational_log` (e.g. evidence only) with missing `status` / `is_editable`;
 * the care plan `GET` is the **source of truth** for those fields and should be
 * overlaid when present. `locked` still allows saves when `is_editable` is true.
 */
export function resolveOperationalLogForReportWorkspace(
  workspace: CarePlanReportWorkspace | null | undefined,
  carePlan: AdminCarePlan | null | undefined,
): OperationalLogSnapshot | null {
  const w = workspace?.operational_log ?? null;
  const embed = carePlan?.operational_log ?? null;
  const fromCarePlan = embed
    ? carePlanEmbedToOperationalLogSnapshot(embed)
    : null;

  if (w == null) {
    return fromCarePlan;
  }

  if (fromCarePlan == null) {
    return {
      ...w,
      is_editable: w.is_editable !== false,
    };
  }

  return {
    ...w,
    id: fromCarePlan.id,
    code: fromCarePlan.code ?? w.code,
    status: fromCarePlan.status,
    is_editable: fromCarePlan.is_editable,
    metrics:
      w.metrics && w.metrics.length > 0 ? w.metrics : fromCarePlan.metrics,
  };
}
