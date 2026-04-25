import { ENDPOINTS } from '@/config/api/endpoints';
import type { ApiResponse } from '@/lib/api/client';
import { http } from '@/lib/api/client';

import type {
  CreateCarePlanReportRunPayload,
  CarePlanReportRun,
  CarePlanReportWorkspace,
  ListCarePlanReportRunsData,
  PublishCarePlanReportRunPayload,
  UpdateCarePlanReportRunPayload,
} from '../types/care-plan-report';
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
  replace_strategy?: 'preserve_overlap' | 'full';
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

export async function getCarePlanById(
  id: number,
): Promise<ApiResponse<AdminCarePlan>> {
  return http.get<AdminCarePlan>(
    ENDPOINTS.ADMIN.MODULES.CARE_PLANS.DETAIL(String(id)),
    { throwOnError: false },
  );
}

export type GetReportWorkspaceParams =
  | { reportRunId: number; periodStartsOn?: never; periodEndsOn?: never }
  | { reportRunId?: never; periodStartsOn: string; periodEndsOn: string };

function buildReportWorkspaceQuery(params: GetReportWorkspaceParams): string {
  const search = new URLSearchParams();
  if ('reportRunId' in params && params.reportRunId != null) {
    search.set('report_run_id', String(params.reportRunId));
  } else if (
    'periodStartsOn' in params &&
    'periodEndsOn' in params &&
    params.periodStartsOn &&
    params.periodEndsOn
  ) {
    search.set('period_starts_on', params.periodStartsOn);
    search.set('period_ends_on', params.periodEndsOn);
  }
  const q = search.toString();
  return q ? `?${q}` : '';
}

export async function getCarePlanReportWorkspace(
  carePlanId: number,
  params: GetReportWorkspaceParams,
): Promise<ApiResponse<CarePlanReportWorkspace>> {
  const path =
    ENDPOINTS.ADMIN.MODULES.CARE_PLANS.REPORT_WORKSPACE(String(carePlanId)) +
    buildReportWorkspaceQuery(params);
  return http.get<CarePlanReportWorkspace>(path, { throwOnError: false });
}

export async function listCarePlanReportRuns(
  carePlanId: number,
): Promise<ApiResponse<ListCarePlanReportRunsData>> {
  return http.get<ListCarePlanReportRunsData>(
    ENDPOINTS.ADMIN.MODULES.CARE_PLANS.REPORT_RUNS(String(carePlanId)),
    { throwOnError: false },
  );
}

export async function getCarePlanReportRun(
  carePlanId: number,
  reportRunId: number,
): Promise<ApiResponse<CarePlanReportRun>> {
  return http.get<CarePlanReportRun>(
    ENDPOINTS.ADMIN.MODULES.CARE_PLANS.REPORT_RUN(
      String(carePlanId),
      String(reportRunId),
    ),
    { throwOnError: false },
  );
}

export async function postCarePlanReportRun(
  carePlanId: number,
  body: CreateCarePlanReportRunPayload,
): Promise<ApiResponse<CarePlanReportRun>> {
  return http.post<CarePlanReportRun>(
    ENDPOINTS.ADMIN.MODULES.CARE_PLANS.REPORT_RUNS(String(carePlanId)),
    body,
    { throwOnError: false },
  );
}

export async function putCarePlanReportRun(
  carePlanId: number,
  reportRunId: number,
  body: UpdateCarePlanReportRunPayload,
): Promise<ApiResponse<CarePlanReportRun>> {
  return http.put<CarePlanReportRun>(
    ENDPOINTS.ADMIN.MODULES.CARE_PLANS.REPORT_RUN(
      String(carePlanId),
      String(reportRunId),
    ),
    body,
    { throwOnError: false },
  );
}

export async function postCarePlanReportRunPublish(
  carePlanId: number,
  reportRunId: number,
  body?: PublishCarePlanReportRunPayload,
): Promise<ApiResponse<CarePlanReportRun>> {
  return http.post<CarePlanReportRun>(
    ENDPOINTS.ADMIN.MODULES.CARE_PLANS.REPORT_RUN_PUBLISH(
      String(carePlanId),
      String(reportRunId),
    ),
    body ?? {},
    { throwOnError: false },
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
