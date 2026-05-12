import { describe, expect, it } from 'vitest';

import {
  buildOperationalLogWorkspaceHref,
  buildPeriodReportOverviewHref,
} from '@/components/admin/modules/operational-logs/reportRunListHelpers';
import { ROUTES } from '@/config/routes';

describe('report/link href builders', () => {
  it('routes period report detail under /period-reports/:id (list row id)', () => {
    expect(buildPeriodReportOverviewHref(3)).toBe(
      ROUTES.ADMIN.MODULES.PERIOD_REPORTS.DETAIL('3'),
    );
  });

  it('routes operational log workspace without optional second id for URL', () => {
    expect(buildOperationalLogWorkspaceHref(5, 99)).toBe(
      ROUTES.ADMIN.MODULES.OPERATIONAL_LOGS.WORKSPACE('5'),
    );
    expect(buildOperationalLogWorkspaceHref(5)).toBe(
      ROUTES.ADMIN.MODULES.OPERATIONAL_LOGS.WORKSPACE('5'),
    );
  });
});
