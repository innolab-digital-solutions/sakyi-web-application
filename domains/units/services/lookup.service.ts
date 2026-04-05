import { LOOKUP_ENDPOINTS } from '@/config/api/endpoints';
import type { ApiResponse } from '@/lib/api/client';
import { http } from '@/lib/api/client';

export type UnitLookup = {
  id: number;
  name: string;
  abbreviation: string;
};

/**
 * Fetches a minimal list of active units for use in dropdowns and comboboxes.
 */
export async function getUnitsLookup(): Promise<ApiResponse<UnitLookup[]>> {
  return http.get<UnitLookup[]>(LOOKUP_ENDPOINTS.UNITS);
}
