import { ENDPOINTS } from '@/config/api/endpoints';
import type { ApiResponse } from '@/lib/api/client';
import { http } from '@/lib/api/client';

import type { AdminEnrollment } from '../types/admin';

/** Body for `POST /web/admin/enrollments` (Laravel `StoreEnrollmentRequest`). */
export type CreateEnrollmentPayload = {
  enrollment_contract_id: number;
  starts_at: string;
  ends_at: string | null;
  notes?: string | null;
  team_members: Array<{ user_id: number; position: string }>;
};

export async function createEnrollment(
  body: CreateEnrollmentPayload,
): Promise<ApiResponse<AdminEnrollment>> {
  return http.post<AdminEnrollment>(
    ENDPOINTS.ADMIN.MODULES.ENROLLMENT_RECORDS.CREATE,
    body,
  );
}

export async function getEnrollmentRecordById(
  id: number,
): Promise<ApiResponse<AdminEnrollment>> {
  return http.get<AdminEnrollment>(
    ENDPOINTS.ADMIN.MODULES.ENROLLMENT_RECORDS.DETAIL(String(id)),
  );
}
