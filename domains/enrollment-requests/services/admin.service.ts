import { ENDPOINTS } from '@/config/api/endpoints';
import type { ApiResponse } from '@/lib/api/client';
import { http } from '@/lib/api/client';

import type {
  EnrollmentRequestResource,
  EnrollmentRequestStatus,
} from '../types';

export type UpdateEnrollmentRequestStatusPayload = {
  status: EnrollmentRequestStatus;
};

/**
 * Updates a single enrollment request status from the admin dashboard.
 */
export async function updateEnrollmentRequestStatus(
  id: number,
  payload: UpdateEnrollmentRequestStatusPayload,
): Promise<ApiResponse<EnrollmentRequestResource>> {
  return http.patch<EnrollmentRequestResource>(
    ENDPOINTS.ADMIN.MODULES.ENROLLMENT_REQUESTS.UPDATE(String(id)),
    payload,
  );
}
