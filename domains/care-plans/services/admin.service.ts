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
import type {
  CarePlanLogEntry,
  CarePlanLogSummary,
  ListCarePlanLogEntriesParams,
} from '../types/care-plan-log';
import type {
  CarePlanReportRun,
  CarePlanReportRunSummary,
  CarePlanReportWorkspace,
  CreateCarePlanReportRunPayload,
  CreateOperationalLogDraftPayload,
  CreateOperationalLogPayload,
  ListCarePlanReportRunsData,
  OperationalLogSnapshot,
  PublishCarePlanReportRunPayload,
  SubmitOperationalLogForReviewPayload,
  UpdateCarePlanReportRunPayload,
  UpdateOperationalLogPayload,
} from '../types/care-plan-report';

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
  | {
      carePlanDefault: true;
      reportRunId?: never;
      operationalLogId?: never;
      periodStartsOn?: never;
      periodEndsOn?: never;
    }
  | {
      reportRunId: number;
      operationalLogId?: never;
      periodStartsOn?: never;
      periodEndsOn?: never;
    }
  | {
      operationalLogId: number;
      reportRunId?: never;
      periodStartsOn?: never;
      periodEndsOn?: never;
    }
  | {
      reportRunId?: never;
      operationalLogId?: never;
      carePlanDefault?: never;
      periodStartsOn: string;
      periodEndsOn: string;
    };

function buildReportWorkspaceQuery(params: GetReportWorkspaceParams): string {
  if ('carePlanDefault' in params && params.carePlanDefault === true) {
    return '';
  }
  const search = new URLSearchParams();
  if ('reportRunId' in params && params.reportRunId != null) {
    search.set('report_run_id', String(params.reportRunId));
  } else if ('operationalLogId' in params && params.operationalLogId != null) {
    search.set('operational_log_id', String(params.operationalLogId));
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

/** Resolves `client_reports` (new) or `report_runs` (legacy) from the list payload. */
export function getClientReportsFromListPayload(
  data:
    | ListCarePlanReportRunsData
    | CarePlanReportRunSummary[]
    | null
    | undefined,
) {
  if (data == null) return [];
  if (Array.isArray(data)) return data;
  return data.client_reports ?? data.report_runs ?? [];
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

/**
 * Creates a **draft** operational log (`POST .../operational-logs/draft`). Period defaults to the
 * care plan’s full date range unless `period_starts_on` / `period_ends_on` are sent together.
 */
export async function postCarePlanOperationalLogDraft(
  carePlanId: number,
  body?: CreateOperationalLogDraftPayload,
): Promise<ApiResponse<OperationalLogSnapshot>> {
  return http.post<OperationalLogSnapshot>(
    ENDPOINTS.ADMIN.MODULES.CARE_PLANS.OPERATIONAL_LOG_DRAFT(
      String(carePlanId),
    ),
    body ?? {},
    { throwOnError: false },
  );
}

/**
 * Creates an operational log **with metrics** (`in_progress`). For an empty worksheet first, use
 * {@link postCarePlanOperationalLogDraft} then the workspace.
 */
export async function postCarePlanOperationalLog(
  carePlanId: number,
  body: CreateOperationalLogPayload,
): Promise<ApiResponse<OperationalLogSnapshot>> {
  return http.post<OperationalLogSnapshot>(
    ENDPOINTS.ADMIN.MODULES.CARE_PLANS.OPERATIONAL_LOGS(String(carePlanId)),
    body,
    { throwOnError: false },
  );
}

/** @deprecated Same handler as `postCarePlanOperationalLog`; use that for new UI. */
export async function postCarePlanReportRun(
  carePlanId: number,
  body: CreateCarePlanReportRunPayload,
): Promise<ApiResponse<OperationalLogSnapshot>> {
  return http.post<OperationalLogSnapshot>(
    ENDPOINTS.ADMIN.MODULES.CARE_PLANS.REPORT_RUNS(String(carePlanId)),
    body,
    { throwOnError: false },
  );
}

export async function putCarePlanOperationalLog(
  carePlanId: number,
  operationalLogId: number,
  body: UpdateOperationalLogPayload,
): Promise<ApiResponse<OperationalLogSnapshot>> {
  return http.put<OperationalLogSnapshot>(
    ENDPOINTS.ADMIN.MODULES.CARE_PLANS.OPERATIONAL_LOG(
      String(carePlanId),
      String(operationalLogId),
    ),
    body,
    { throwOnError: false },
  );
}

export async function postOperationalLogSubmitForReview(
  carePlanId: number,
  operationalLogId: number,
  body?: SubmitOperationalLogForReviewPayload,
): Promise<ApiResponse<CarePlanReportRun>> {
  return http.post<CarePlanReportRun>(
    ENDPOINTS.ADMIN.MODULES.CARE_PLANS.OPERATIONAL_LOG_SUBMIT_FOR_REVIEW(
      String(carePlanId),
      String(operationalLogId),
    ),
    body ?? {},
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

function buildCarePlanLogEntriesQuery(
  params: ListCarePlanLogEntriesParams = {},
): string {
  const search = new URLSearchParams();

  if (params.section) search.set('section', params.section);
  if (typeof params.is_completed === 'boolean') {
    search.set('is_completed', params.is_completed ? '1' : '0');
  }
  if (params.date_from?.trim())
    search.set('date_from', params.date_from.trim());
  if (params.date_to?.trim()) search.set('date_to', params.date_to.trim());
  if (params.search?.trim()) search.set('search', params.search.trim());
  if (typeof params.page === 'number') search.set('page', String(params.page));
  if (typeof params.per_page === 'number') {
    search.set('per_page', String(params.per_page));
  }

  const queryString = search.toString();
  return queryString ? `?${queryString}` : '';
}

export async function listCarePlanLogs(): Promise<
  ApiResponse<CarePlanLogSummary[]>
> {
  return http.get<CarePlanLogSummary[]>(
    ENDPOINTS.ADMIN.MODULES.CARE_PLAN_LOGS.LIST,
    {
      throwOnError: false,
    },
  );
}

export async function getCarePlanLogSummary(
  id: number,
): Promise<ApiResponse<CarePlanLogSummary>> {
  return http.get<CarePlanLogSummary>(
    ENDPOINTS.ADMIN.MODULES.CARE_PLAN_LOGS.DETAIL(String(id)),
    { throwOnError: false },
  );
}

export async function listCarePlanLogEntries(
  carePlanId: number,
  params: ListCarePlanLogEntriesParams = {},
): Promise<ApiResponse<CarePlanLogEntry[]>> {
  return http.get<CarePlanLogEntry[]>(
    ENDPOINTS.ADMIN.MODULES.CARE_PLAN_LOGS.ENTRIES(String(carePlanId)) +
      buildCarePlanLogEntriesQuery(params),
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
