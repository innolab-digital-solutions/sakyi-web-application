import { ENDPOINTS } from '@/config/api/endpoints';
import type { DashboardOverviewData } from '@/domains/dashboard-overview/types';
import { http } from '@/lib/api/client';
import type { ApiResponse } from '@/types/api';

/**
 * Loads operational metrics for the admin overview dashboard.
 */
export async function getDashboardOverview(): Promise<
  ApiResponse<DashboardOverviewData>
> {
  return http.get<DashboardOverviewData>(
    ENDPOINTS.ADMIN.MODULES.DASHBOARD.OVERVIEW,
    { throwOnError: false },
  );
}
