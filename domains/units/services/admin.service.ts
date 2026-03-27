import { ENDPOINTS } from '@/config/api/endpoints';
import type { ApiResponse } from '@/lib/api/client';
import { http } from '@/lib/api/client';

import type { Unit } from '../types/admin';

/**
 * Fetches a single program for admin edit/detail views.
 */
export async function getUnitById(id: number): Promise<ApiResponse<Unit>> {
  return http.get<Unit>(
    ENDPOINTS.ADMIN.MODULES.UNITS.DETAIL(String(id)),
  );
}

export async function getUnits(): Promise<ApiResponse<Unit[]>> {
  return http.get<Unit[]>(ENDPOINTS.ADMIN.MODULES.UNITS.LIST);
}
