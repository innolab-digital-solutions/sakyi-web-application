import { ENDPOINTS } from '@/config/api/endpoints';
import type { ApiResponse } from '@/lib/api/client';
import { http } from '@/lib/api/client';

import type { AdminEnrollment } from '../types/admin';

export async function getEnrollmentRecordById(
  id: number,
): Promise<ApiResponse<AdminEnrollment>> {
  return http.get<AdminEnrollment>(
    ENDPOINTS.ADMIN.MODULES.ENROLLMENT_RECORDS.DETAIL(String(id)),
  );
}
