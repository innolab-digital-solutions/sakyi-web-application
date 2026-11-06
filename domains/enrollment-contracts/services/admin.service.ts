import { ENDPOINTS } from '@/config/api/endpoints';
import type { ApiResponse } from '@/lib/api/client';
import { http } from '@/lib/api/client';

import type { EnrollmentContract } from '../types';

export async function getEnrollmentContractById(
  id: number,
): Promise<ApiResponse<EnrollmentContract>> {
  return http.get<EnrollmentContract>(
    ENDPOINTS.ADMIN.MODULES.ENROLLMENT_CONTRACTS.DETAIL(String(id)),
  );
}
