import { ENDPOINTS } from '@/config/api/endpoints';
import type { ApiResponse } from '@/lib/api/client';
import { http } from '@/lib/api/client';

import { buildSaveSectionFormData } from '../mappers/admin';
import type {
  CancelOnboardingIntakePayload,
  CreateOnboardingIntakePayload,
  OnboardingIntakeData,
  OnboardingIntakeListResponse,
  OnboardingIntakeResponse,
  OnboardingListIntakesParams,
  OnboardingTemplateData,
  SaveOnboardingSectionPayload,
} from '../types/admin';

/**
 * Fetches onboarding template details by version.
 */
export async function getOnboardingTemplateByVersion(
  version: number,
): Promise<ApiResponse<OnboardingTemplateData>> {
  return http.get<OnboardingTemplateData>(
    ENDPOINTS.ADMIN.MODULES.ONBOARDING.TEMPLATE(version),
  );
}

/**
 * Fetches paginated onboarding intakes for admin queue/list UI.
 */
export async function getOnboardingIntakes(
  params: OnboardingListIntakesParams = {},
): Promise<OnboardingIntakeListResponse | ApiResponse<OnboardingIntakeData[]>> {
  const searchParams = new URLSearchParams();
  if (params.status) searchParams.set('status', params.status);
  if (params.per_page != null) searchParams.set('per_page', String(params.per_page));
  if (params.page != null) searchParams.set('page', String(params.page));

  const query = searchParams.toString();
  const endpoint = query
    ? `${ENDPOINTS.ADMIN.MODULES.ONBOARDING.INTAKES.LIST}?${query}`
    : ENDPOINTS.ADMIN.MODULES.ONBOARDING.INTAKES.LIST;

  return http.get<OnboardingIntakeData[]>(endpoint);
}

/**
 * Creates a new onboarding intake.
 */
export async function createOnboardingIntake(
  payload: CreateOnboardingIntakePayload,
): Promise<ApiResponse<OnboardingIntakeData>> {
  return http.post<OnboardingIntakeData>(
    ENDPOINTS.ADMIN.MODULES.ONBOARDING.INTAKES.CREATE,
    payload,
  );
}

/**
 * Fetches one onboarding intake including progress metadata when present.
 */
export async function getOnboardingIntakeById(
  intakeId: number,
): Promise<OnboardingIntakeResponse | ApiResponse<OnboardingIntakeData>> {
  return http.get<OnboardingIntakeData>(
    ENDPOINTS.ADMIN.MODULES.ONBOARDING.INTAKES.DETAIL(String(intakeId)),
  );
}

/**
 * Saves one section's answers for an intake.
 *
 * Uses `multipart/form-data` so real {@link File} uploads are accepted by Laravel and `file` is
 * not sent for questions without a new upload (avoids invalid nested JSON file placeholders).
 */
export async function saveOnboardingIntakeSection(
  intakeId: number,
  sectionId: number,
  payload: SaveOnboardingSectionPayload,
): Promise<OnboardingIntakeResponse | ApiResponse<OnboardingIntakeData>> {
  const body = buildSaveSectionFormData(payload);
  return http.put<OnboardingIntakeData>(
    ENDPOINTS.ADMIN.MODULES.ONBOARDING.INTAKES.SAVE_SECTION_ANSWERS(
      String(intakeId),
      String(sectionId),
    ),
    body,
  );
}

/**
 * Completes an onboarding intake after required questions are answered.
 */
export async function completeOnboardingIntake(
  intakeId: number,
): Promise<OnboardingIntakeResponse | ApiResponse<OnboardingIntakeData>> {
  return http.post<OnboardingIntakeData>(
    ENDPOINTS.ADMIN.MODULES.ONBOARDING.INTAKES.COMPLETE(String(intakeId)),
  );
}

/**
 * Cancels an onboarding intake.
 */
export async function cancelOnboardingIntake(
  intakeId: number,
  payload: CancelOnboardingIntakePayload = {},
): Promise<OnboardingIntakeResponse | ApiResponse<OnboardingIntakeData>> {
  return http.post<OnboardingIntakeData>(
    ENDPOINTS.ADMIN.MODULES.ONBOARDING.INTAKES.CANCEL(String(intakeId)),
    payload,
  );
}
