import type { OperationalLogSnapshot } from '@/domains/care-plans/types/care-plan-report';
import type { CarePlanEmbeddedOperationalLog } from '@/domains/care-plans/types/operational-log-embed';

/**
 * When `GET` report-workspace returns `operational_log: null` but `getCarePlanById`
 * embeds the log (draft), synthesize a minimal {@link OperationalLogSnapshot} for
 * edit gating and `PUT` target id. Metrics still come from workspace suggested rows
 * or `client_report` in the effect that hydrates the form.
 */
export function carePlanEmbedToOperationalLogSnapshot(
  embed: CarePlanEmbeddedOperationalLog,
): OperationalLogSnapshot {
  const raw = (embed.status ?? 'draft').trim().toLowerCase();
  const status: OperationalLogSnapshot['status'] =
    raw === 'draft' || raw === 'in_progress' || raw === 'locked'
      ? raw
      : 'locked';
  return {
    id: embed.id,
    code: embed.code,
    status,
    is_editable: embed.is_editable !== false,
    adherence_percentage: null,
    metrics: [],
  };
}
