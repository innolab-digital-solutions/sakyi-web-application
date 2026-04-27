import { describe, expect, it } from 'vitest';

import type { AdminCarePlan } from '@/domains/care-plans/types/admin';
import type { CarePlanReportWorkspace } from '@/domains/care-plans/types/care-plan-report';
import { resolveOperationalLogForReportWorkspace } from '@/lib/care-plans/resolveOperationalLogForReportWorkspace';

const base: CarePlanReportWorkspace = {
  care_plan: {
    id: 1,
    code: 'c',
    status: 'active',
    starts_on: '2026-01-01',
    ends_on: '2026-01-07',
  },
  client: {
    id: 1,
    name: 'n',
    client_code: 'cc',
    email: 'e',
    picture_url: null,
  },
  period: { starts_on: '2026-01-01', ends_on: '2026-01-07' },
  evidence: [],
  suggested_metrics: [],
  client_report: null,
  report_run: null,
  operational_log: null,
};

describe('resolveOperationalLogForReportWorkspace', () => {
  it('uses care plan embed for status and is_editable when workspace row is a stub', () => {
    const workspace: CarePlanReportWorkspace = {
      ...base,
      operational_log: {
        id: 1,
        code: 'OL',
        status: 'locked',
        is_editable: false,
        adherence_percentage: null,
        metrics: [],
      },
    };
    const carePlan = {
      operational_log: {
        id: 1,
        code: 'OL',
        status: 'draft',
        is_editable: true,
      },
    } as AdminCarePlan;

    const r = resolveOperationalLogForReportWorkspace(workspace, carePlan);
    expect(r).not.toBeNull();
    expect(r?.status).toBe('draft');
    expect(r?.is_editable).toBe(true);
  });

  it('returns only care plan when workspace has no operational_log', () => {
    const carePlan = {
      operational_log: {
        id: 2,
        code: 'X',
        status: 'in_progress',
        is_editable: true,
      },
    } as AdminCarePlan;

    const r = resolveOperationalLogForReportWorkspace(base, carePlan);
    expect(r?.id).toBe(2);
    expect(r?.status).toBe('in_progress');
  });

  it('treats missing is_editable on workspace as editable when there is no care plan embed', () => {
    const operational_log: CarePlanReportWorkspace['operational_log'] = {
      id: 1,
      code: 'OL',
      status: 'draft',
      is_editable: true,
      adherence_percentage: null,
      metrics: [],
    };
    (operational_log as { is_editable: boolean | undefined }).is_editable =
      undefined;
    const workspace: CarePlanReportWorkspace = {
      ...base,
      operational_log,
    };

    const r = resolveOperationalLogForReportWorkspace(workspace, undefined);
    expect(r?.is_editable).toBe(true);
  });
});
