import { ENDPOINTS } from '@/config/api/endpoints';
import type { ApiResponse } from '@/lib/api/client';
import { http } from '@/lib/api/client';

import type { Program } from '../types/admin';

/**
 * Fetches a single program for admin edit/detail views.
 */
export async function getProgramById(
  id: number,
): Promise<ApiResponse<Program>> {
  return http.get<Program>(ENDPOINTS.ADMIN.MODULES.PROGRAMS.DETAIL(String(id)));
}
