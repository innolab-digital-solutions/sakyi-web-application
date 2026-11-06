import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';

import type { AdminCarePlan } from '@/domains/care-plans/types/admin';
import type {
  CarePlanReportWorkspace,
  OperationalLogSnapshot,
  ReportRunMetric,
} from '@/domains/care-plans/types/care-plan-report';
import {
  adminCarePlanBriefQueryKey,
  carePlanReportWorkspaceQueryKey,
  syncOperationalLogSnapshotInReportCaches,
} from '@/lib/care-plans/syncOperationalLogSnapshotInReportCaches';

function metric(
  partial: Partial<ReportRunMetric> & Pick<ReportRunMetric, 'metric_key'>,
): ReportRunMetric {
  return {
    label: partial.metric_key,
    section: 'nutrition',
    unit: null,
    target_value: null,
    actual_value: null,
    days_on_target: 0,
    days_total: 0,
    display_order: 0,
    daily_points: [],
    ...partial,
  };
}

function baseWorkspace(
  operational_log: CarePlanReportWorkspace['operational_log'],
): CarePlanReportWorkspace {
  return {
    care_plan: {
      id: 10,
      code: 'CP-10',
      status: 'active',
      starts_on: '2026-01-01',
      ends_on: '2026-01-07',
    },
    client: {
      id: 1,
      name: 'Client',
      client_code: 'C1',
      email: 'c@example.com',
      picture_url: null,
    },
    period: { starts_on: '2026-01-01', ends_on: '2026-01-07' },
    evidence: [],
    suggested_metrics: [],
    client_report: null,
    report_run: null,
    operational_log,
  };
}

function baseCarePlan(
  operational_log: AdminCarePlan['operational_log'],
): AdminCarePlan {
  return {
    id: 10,
    code: 'CP-10',
    status: 'active',
    starts_on: '2026-01-01',
    ends_on: '2026-01-07',
    operational_log,
  } as AdminCarePlan;
}

function snapshot(
  overrides: Partial<OperationalLogSnapshot> = {},
): OperationalLogSnapshot {
  return {
    id: 42,
    code: 'OL-42',
    status: 'in_progress',
    is_editable: true,
    adherence_percentage: 80,
    metrics: [
      metric({
        metric_key: 'calories',
        actual_value: 2000,
        target_value: 1800,
      }),
    ],
    client_report_id: null,
    ...overrides,
  };
}

describe('syncOperationalLogSnapshotInReportCaches', () => {
  it('updates brief status and workspace metrics from the save snapshot', () => {
    const queryClient = new QueryClient();
    const carePlanId = 10;

    queryClient.setQueryData(
      adminCarePlanBriefQueryKey(carePlanId),
      baseCarePlan({
        id: 42,
        code: 'OL-42',
        status: 'draft',
        is_editable: true,
      }),
    );
    queryClient.setQueryData(
      carePlanReportWorkspaceQueryKey(carePlanId),
      baseWorkspace({
        id: 42,
        code: 'OL-42',
        status: 'draft',
        is_editable: true,
        adherence_percentage: null,
        metrics: [
          metric({
            metric_key: 'calories',
            actual_value: 1000,
            target_value: 1800,
          }),
        ],
      }),
    );

    syncOperationalLogSnapshotInReportCaches(
      queryClient,
      carePlanId,
      snapshot(),
    );

    const brief = queryClient.getQueryData<AdminCarePlan>(
      adminCarePlanBriefQueryKey(carePlanId),
    );
    const workspace = queryClient.getQueryData<CarePlanReportWorkspace>(
      carePlanReportWorkspaceQueryKey(carePlanId),
    );

    expect(brief?.operational_log?.status).toBe('in_progress');
    expect(brief?.operational_log?.is_editable).toBe(true);
    expect(workspace?.operational_log?.status).toBe('in_progress');
    expect(workspace?.operational_log?.metrics[0]?.actual_value).toBe(2000);
    expect(workspace?.operational_log?.adherence_percentage).toBe(80);
  });

  it('does not overwrite a different operational log id in either cache', () => {
    const queryClient = new QueryClient();
    const carePlanId = 10;

    queryClient.setQueryData(
      adminCarePlanBriefQueryKey(carePlanId),
      baseCarePlan({
        id: 99,
        code: 'OL-99',
        status: 'draft',
        is_editable: true,
      }),
    );
    queryClient.setQueryData(
      carePlanReportWorkspaceQueryKey(carePlanId),
      baseWorkspace({
        id: 99,
        code: 'OL-99',
        status: 'draft',
        is_editable: true,
        adherence_percentage: null,
        metrics: [metric({ metric_key: 'steps', actual_value: 5 })],
      }),
    );

    syncOperationalLogSnapshotInReportCaches(
      queryClient,
      carePlanId,
      snapshot({ id: 42 }),
    );

    const brief = queryClient.getQueryData<AdminCarePlan>(
      adminCarePlanBriefQueryKey(carePlanId),
    );
    const workspace = queryClient.getQueryData<CarePlanReportWorkspace>(
      carePlanReportWorkspaceQueryKey(carePlanId),
    );

    expect(brief?.operational_log?.id).toBe(99);
    expect(brief?.operational_log?.status).toBe('draft');
    expect(workspace?.operational_log?.id).toBe(99);
    expect(workspace?.operational_log?.metrics[0]?.metric_key).toBe('steps');
  });

  it('keeps existing workspace metrics when the snapshot has an empty metrics list', () => {
    const queryClient = new QueryClient();
    const carePlanId = 10;
    const existing = [
      metric({ metric_key: 'steps', actual_value: 9000, target_value: 8000 }),
    ];

    queryClient.setQueryData(
      carePlanReportWorkspaceQueryKey(carePlanId),
      baseWorkspace({
        id: 42,
        code: 'OL-42',
        status: 'draft',
        is_editable: true,
        adherence_percentage: null,
        metrics: existing,
      }),
    );

    syncOperationalLogSnapshotInReportCaches(
      queryClient,
      carePlanId,
      snapshot({ status: 'in_progress', metrics: [] }),
    );

    const workspace = queryClient.getQueryData<CarePlanReportWorkspace>(
      carePlanReportWorkspaceQueryKey(carePlanId),
    );

    expect(workspace?.operational_log?.status).toBe('in_progress');
    expect(workspace?.operational_log?.metrics).toEqual(existing);
  });

  it('leaves caches unchanged when no prior query data exists', () => {
    const queryClient = new QueryClient();
    const carePlanId = 10;

    syncOperationalLogSnapshotInReportCaches(
      queryClient,
      carePlanId,
      snapshot(),
    );

    expect(
      queryClient.getQueryData(adminCarePlanBriefQueryKey(carePlanId)),
    ).toBeUndefined();
    expect(
      queryClient.getQueryData(carePlanReportWorkspaceQueryKey(carePlanId)),
    ).toBeUndefined();
  });
});
