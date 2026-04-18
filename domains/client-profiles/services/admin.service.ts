import { ENDPOINTS } from '@/config/api/endpoints';
import type { ApiResponse } from '@/lib/api/client';
import { http } from '@/lib/api/client';

import type { ClientProfile } from '../types/admin';

export async function getClientProfileById(
  id: number,
): Promise<ApiResponse<ClientProfile>> {
  return http.get<ClientProfile>(
    ENDPOINTS.ADMIN.MODULES.CLIENT_PROFILES.DETAIL(String(id)),
  );
}
