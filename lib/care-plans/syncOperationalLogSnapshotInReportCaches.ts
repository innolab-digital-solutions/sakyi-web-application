import type { QueryClient } from '@tanstack/react-query';

import type { AdminCarePlan } from '@/domains/care-plans/types/admin';
import type {
  CarePlanReportWorkspace,
  OperationalLogSnapshot,
} from '@/domains/care-plans/types/care-plan-report';

const WORKSPACE_QUERY_KEY = 'care-plan-report-workspace' as const;

/** Stable reference for {@link useQuery} key hashing (must not be recreated each render). */
export const DEFAULT_REPORT_WORKSPACE_PARAMS = {
  carePlanDefault: true as const,
};

/**
 * React Query key for the care-plan report workspace payload.
 *
 * @param carePlanId - Care plan whose workspace is cached
 * @returns Stable query key tuple
 */
export function carePlanReportWorkspaceQueryKey(carePlanId: number) {
  return [
    WORKSPACE_QUERY_KEY,
    carePlanId,
    DEFAULT_REPORT_WORKSPACE_PARAMS,
  ] as const;
}

/**
 * React Query key for the admin care-plan brief used for operational-log gating.
 *
 * @param carePlanId - Care plan id
 * @returns Stable query key tuple
 */
export function adminCarePlanBriefQueryKey(carePlanId: number) {
  return ['admin-care-plan-brief', carePlanId] as const;
}

/**
 * Overlays an operational-log save/create snapshot onto report-workspace caches.
 *
 * Exists so generate-report gating and worksheet metrics stay aligned with the
 * mutation response: {@link resolveOperationalLogForReportWorkspace} prefers the
 * care-plan brief for `status` / `is_editable`, which otherwise stays stale until
 * a full page reload.
 *
 * Prefer snapshot metrics when the mutation returns them so the worksheet can
 * rehydrate from the server after save.
 *
 * @param queryClient - Active React Query client
 * @param carePlanId - Care plan owning the log
 * @param snapshot - Operational log returned by create/update APIs
 */
export function syncOperationalLogSnapshotInReportCaches(
  queryClient: QueryClient,
  carePlanId: number,
  snapshot: OperationalLogSnapshot,
) {
  queryClient.setQueryData<AdminCarePlan | undefined>(
    adminCarePlanBriefQueryKey(carePlanId),
    (old) => {
      if (!old) return old;
      const embed = old.operational_log;
      if (embed != null && embed.id !== snapshot.id) return old;
      return {
        ...old,
        operational_log: {
          id: snapshot.id,
          code: snapshot.code ?? embed?.code ?? null,
          status: snapshot.status,
          is_editable: snapshot.is_editable,
          period: embed?.period,
        },
      };
    },
  );

  queryClient.setQueryData<CarePlanReportWorkspace | undefined>(
    carePlanReportWorkspaceQueryKey(carePlanId),
    (old) => {
      if (!old) return old;
      const op = old.operational_log;
      if (op != null && op.id !== snapshot.id) return old;
      const snapshotMetrics = snapshot.metrics ?? [];
      const nextMetrics =
        snapshotMetrics.length > 0 ? snapshotMetrics : (op?.metrics ?? []);
      return {
        ...old,
        operational_log: {
          ...(op ?? {
            id: snapshot.id,
            code: snapshot.code,
            adherence_percentage: snapshot.adherence_percentage,
            client_report_id: snapshot.client_report_id,
            metrics: nextMetrics,
          }),
          id: snapshot.id,
          code: snapshot.code ?? op?.code ?? null,
          status: snapshot.status,
          is_editable: snapshot.is_editable,
          adherence_percentage:
            snapshot.adherence_percentage ?? op?.adherence_percentage ?? null,
          client_report_id:
            snapshot.client_report_id ?? op?.client_report_id ?? null,
          metrics: nextMetrics,
        },
      };
    },
  );
}

/**
 * Refetches active report-workspace and care-plan brief queries so the UI
 * reflects the latest server state after mutations.
 *
 * @param queryClient - Active React Query client
 * @param carePlanId - Care plan whose caches should refresh
 */
export async function invalidateReportWorkspaceCaches(
  queryClient: QueryClient,
  carePlanId: number,
) {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: carePlanReportWorkspaceQueryKey(carePlanId),
      refetchType: 'active',
    }),
    queryClient.invalidateQueries({
      queryKey: adminCarePlanBriefQueryKey(carePlanId),
      refetchType: 'active',
    }),
  ]);
}
