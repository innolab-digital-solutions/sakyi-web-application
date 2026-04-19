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

/** `PATCH …/schedule` — send at least one of `starts_at`, `ends_at` (see enrollment-mutation-logic.md). */
export type PatchEnrollmentSchedulePayload = {
  starts_at?: string | null;
  ends_at?: string | null;
};

export async function patchEnrollmentSchedule(
  id: number,
  body: PatchEnrollmentSchedulePayload,
): Promise<ApiResponse<AdminEnrollment>> {
  return http.patch<AdminEnrollment>(
    ENDPOINTS.ADMIN.MODULES.ENROLLMENT_RECORDS.SCHEDULE_UPDATE(String(id)),
    body,
  );
}

/** `notes` must be present in JSON (value may be `null`). */
export async function patchEnrollmentNotes(
  id: number,
  body: { notes: string | null },
): Promise<ApiResponse<AdminEnrollment>> {
  return http.patch<AdminEnrollment>(
    ENDPOINTS.ADMIN.MODULES.ENROLLMENT_RECORDS.NOTES_UPDATE(String(id)),
    body,
  );
}

/** Full roster replacement. */
export async function patchEnrollmentCareTeam(
  id: number,
  body: { team_members: Array<{ user_id: number; position: string }> },
): Promise<ApiResponse<AdminEnrollment>> {
  return http.patch<AdminEnrollment>(
    ENDPOINTS.ADMIN.MODULES.ENROLLMENT_RECORDS.CARE_TEAM_UPDATE(String(id)),
    body,
  );
}

export async function postEnrollmentActivate(
  id: number,
): Promise<ApiResponse<AdminEnrollment>> {
  return http.post<AdminEnrollment>(
    ENDPOINTS.ADMIN.MODULES.ENROLLMENT_RECORDS.ACTIVATE(String(id)),
    {},
  );
}

export async function postEnrollmentComplete(
  id: number,
): Promise<ApiResponse<AdminEnrollment>> {
  return http.post<AdminEnrollment>(
    ENDPOINTS.ADMIN.MODULES.ENROLLMENT_RECORDS.COMPLETE(String(id)),
    {},
  );
}

export async function postEnrollmentCancel(
  id: number,
): Promise<ApiResponse<AdminEnrollment>> {
  return http.post<AdminEnrollment>(
    ENDPOINTS.ADMIN.MODULES.ENROLLMENT_RECORDS.CANCEL(String(id)),
    {},
  );
}
