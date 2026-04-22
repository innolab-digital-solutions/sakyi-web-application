import { ENDPOINTS } from '@/config/api/endpoints';
import type { ApiResponse } from '@/lib/api/client';
import { http } from '@/lib/api/client';

import type {
  AdminCarePlan,
  AdminCarePlanBuilder,
  CarePlanSectionItem,
  CarePlanSectionKey,
  CarePlanValidationResult,
} from '../types/admin';

export type PatchCarePlanBasicsPayload = {
  starts_on: string;
  ends_on: string;
};

export type CreateCarePlanPayload = {
  enrollment_id: number;
};

export type GenerateCarePlanDaysPayload = {
  starts_on: string;
  ends_on: string;
  replace_existing?: boolean;
};

export type UpdateCarePlanDayNotesPayload = {
  general_notes: string | null;
};

export type CancelCarePlanPayload = {
  cancellation_note: string;
};

export async function postCarePlanActivate(
  id: number,
): Promise<ApiResponse<AdminCarePlan>> {
  return http.post<AdminCarePlan>(
    ENDPOINTS.ADMIN.MODULES.CARE_PLANS.ACTIVATE(String(id)),
    {},
  );
}

export async function postCarePlanRevision(
  id: number,
): Promise<ApiResponse<AdminCarePlan>> {
  return http.post<AdminCarePlan>(
    ENDPOINTS.ADMIN.MODULES.CARE_PLANS.REVISION(String(id)),
    {},
  );
}

export async function postCarePlanCancel(
  id: number,
  body: CancelCarePlanPayload,
): Promise<ApiResponse<AdminCarePlan>> {
  return http.post<AdminCarePlan>(
    ENDPOINTS.ADMIN.MODULES.CARE_PLANS.CANCEL(String(id)),
    body,
  );
}

export async function postCreateCarePlan(
  body: CreateCarePlanPayload,
): Promise<ApiResponse<AdminCarePlan>> {
  return http.post<AdminCarePlan>(
    ENDPOINTS.ADMIN.MODULES.CARE_PLANS.CREATE,
    body,
  );
}

export async function getCarePlanBuilderById(
  id: number,
): Promise<ApiResponse<AdminCarePlanBuilder>> {
  return http.get<AdminCarePlanBuilder>(
    ENDPOINTS.ADMIN.MODULES.CARE_PLANS.BUILDER(String(id)),
  );
}

export async function patchCarePlanBasics(
  id: number,
  body: PatchCarePlanBasicsPayload,
): Promise<ApiResponse<AdminCarePlan>> {
  return http.patch<AdminCarePlan>(
    ENDPOINTS.ADMIN.MODULES.CARE_PLANS.BASICS_UPDATE(String(id)),
    body,
  );
}

export async function postCarePlanGenerateDays(
  id: number,
  body: GenerateCarePlanDaysPayload,
): Promise<ApiResponse<AdminCarePlanBuilder>> {
  return http.post<AdminCarePlanBuilder>(
    ENDPOINTS.ADMIN.MODULES.CARE_PLANS.DAYS_GENERATE(String(id)),
    body,
  );
}

export async function putCarePlanSectionItems(
  carePlanId: number,
  dayId: number,
  section: CarePlanSectionKey,
  items: CarePlanSectionItem[],
): Promise<ApiResponse<AdminCarePlanBuilder>> {
  return http.put<AdminCarePlanBuilder>(
    ENDPOINTS.ADMIN.MODULES.CARE_PLANS.DAY_SECTION_ITEMS(
      String(carePlanId),
      String(dayId),
      section,
    ),
    { items },
  );
}

export async function postCarePlanValidate(
  id: number,
): Promise<ApiResponse<CarePlanValidationResult>> {
  return http.post<CarePlanValidationResult>(
    ENDPOINTS.ADMIN.MODULES.CARE_PLANS.VALIDATE(String(id)),
    {},
  );
}

export async function patchCarePlanDayNotes(
  carePlanId: number,
  dayId: number,
  body: UpdateCarePlanDayNotesPayload,
): Promise<ApiResponse<AdminCarePlanBuilder>> {
  return http.patch<AdminCarePlanBuilder>(
    ENDPOINTS.ADMIN.MODULES.CARE_PLANS.DAY_NOTES_UPDATE(
      String(carePlanId),
      String(dayId),
    ),
    body,
  );
}
