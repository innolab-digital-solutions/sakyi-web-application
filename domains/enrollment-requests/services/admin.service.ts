import { ENDPOINTS } from '@/config/api/endpoints';
import type { ApiResponse } from '@/lib/api/client';
import { http } from '@/lib/api/client';

import type {
  EnrollmentRequestResource,
  EnrollmentRequestStatus,
} from '../types';

export async function getEnrollmentRequestById(
  id: number,
): Promise<ApiResponse<EnrollmentRequestResource>> {
  return http.get<EnrollmentRequestResource>(
    ENDPOINTS.ADMIN.MODULES.ENROLLMENT_REQUESTS.DETAIL(String(id)),
  );
}

export type UpdateEnrollmentRequestStatusPayload = {
  status: EnrollmentRequestStatus;
};

/**
 * Assigns an enrollment contract to a completed enrollment request.
 */
export async function assignEnrollmentRequestContract(
  id: number,
): Promise<ApiResponse<EnrollmentRequestResource>> {
  return http.post<EnrollmentRequestResource>(
    ENDPOINTS.ADMIN.MODULES.ENROLLMENT_REQUESTS.ASSIGN_CONTRACT(String(id)),
  );
}

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
