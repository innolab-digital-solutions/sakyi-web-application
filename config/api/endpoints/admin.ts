/**
 * Centralized API endpoint definitions for admin-related server routes.
 *
 * These objects contain all admin-facing API endpoint definitions, grouped thematically.
 * Grouping endpoints this way ensures maintainability and clarity as the application expands and accommodates future modules.
 *
 * @example
 * import { ADMIN_ENDPOINTS } from '@/config/api/endpoints/admin';
 *
 * ADMIN_ENDPOINTS.MODULES.PROGRAMS.UPDATE('123'); // "/web/admin/programs/123"
 */
const BASE = '/web/admin';

export const ADMIN_ENDPOINTS = {
  AUTH: {
    ME: `${BASE}/auth/me`,
    LOGIN: `${BASE}/auth/login`,
    LOGOUT: `${BASE}/auth/logout`,
  },
  MODULES: {
    PROGRAMS: {
      LIST: `${BASE}/programs`,
      /** Full JSON create (`id` omitted). */
      CREATE: `${BASE}/programs`,
      /** Full JSON update (same body shape as create, including `id`). */
      UPDATE: (id: string) => `${BASE}/programs/${id}`,
      DELETE: (id: string) => `${BASE}/programs/${id}`,
      DETAIL: (id: string) => `${BASE}/programs/${id}`,
    },
    UNITS: {
      LIST: `${BASE}/units`,
      CREATE: `${BASE}/units`,
      UPDATE: (id: string) => `${BASE}/units/${id}`,
      DELETE: (id: string) => `${BASE}/units/${id}`,
      DETAIL: (id: string) => `${BASE}/units/${id}`,
    },
    NUTRITION_CATEGORIES: {
      LIST: `${BASE}/nutrition-categories`,
      CREATE: `${BASE}/nutrition-categories`,
      UPDATE: (id: string) => `${BASE}/nutrition-categories/${id}`,
      DELETE: (id: string) => `${BASE}/nutrition-categories/${id}`,
      DETAIL: (id: string) => `${BASE}/nutrition-categories/${id}`,
    },
    NUTRITION_ITEMS: {
      LIST: `${BASE}/nutrition-items`,
      CREATE: `${BASE}/nutrition-items`,
      UPDATE: (id: string) => `${BASE}/nutrition-items/${id}`,
      DELETE: (id: string) => `${BASE}/nutrition-items/${id}`,
      DETAIL: (id: string) => `${BASE}/nutrition-items/${id}`,
    },
    MOVEMENT_CATEGORIES: {
      LIST: `${BASE}/movement-categories`,
      CREATE: `${BASE}/movement-categories`,
      UPDATE: (id: string) => `${BASE}/movement-categories/${id}`,
      DELETE: (id: string) => `${BASE}/movement-categories/${id}`,
      DETAIL: (id: string) => `${BASE}/movement-categories/${id}`,
    },
    MOVEMENT_EXERCISES: {
      LIST: `${BASE}/movement-exercises`,
      CREATE: `${BASE}/movement-exercises`,
      UPDATE: (id: string) => `${BASE}/movement-exercises/${id}`,
      DELETE: (id: string) => `${BASE}/movement-exercises/${id}`,
      DETAIL: (id: string) => `${BASE}/movement-exercises/${id}`,
    },
    MOVEMENT_EQUIPMENT: {
      LIST: `${BASE}/movement-equipment`,
      CREATE: `${BASE}/movement-equipment`,
      UPDATE: (id: string) => `${BASE}/movement-equipment/${id}`,
      DELETE: (id: string) => `${BASE}/movement-equipment/${id}`,
      DETAIL: (id: string) => `${BASE}/movement-equipment/${id}`,
    },
    BLOG_CATEGORIES: {
      LIST: `${BASE}/blog-categories`,
      CREATE: `${BASE}/blog-categories`,
      UPDATE: (id: string) => `${BASE}/blog-categories/${id}`,
      DELETE: (id: string) => `${BASE}/blog-categories/${id}`,
      DETAIL: (id: string) => `${BASE}/blog-categories/${id}`,
    },
    ENROLLMENT_REQUESTS: {
      LIST: `${BASE}/enrollment-requests`,
      UPDATE: (id: string) => `${BASE}/enrollment-requests/${id}`,
      DETAIL: (id: string) => `${BASE}/enrollment-requests/${id}`,
      ASSIGN_CONTRACT: (id: string) =>
        `${BASE}/enrollment-requests/${id}/assign-contract`,
      CANCEL: (id: string) => `${BASE}/enrollment-requests/${id}/cancel`,
    },
    ENROLLMENT_CONTRACTS: {
      LIST: `${BASE}/enrollment-contracts`,
      DETAIL: (id: string) => `${BASE}/enrollment-contracts/${id}`,
    },
    ENROLLMENT_RECORDS: {
      LIST: `${BASE}/enrollments`,
      CREATE: `${BASE}/enrollments`,
      DETAIL: (id: string) => `${BASE}/enrollments/${id}`,
      SCHEDULE_UPDATE: (id: string) => `${BASE}/enrollments/${id}/schedule`,
      NOTES_UPDATE: (id: string) => `${BASE}/enrollments/${id}/notes`,
      CARE_TEAM_UPDATE: (id: string) => `${BASE}/enrollments/${id}/care-team`,
      ACTIVATE: (id: string) => `${BASE}/enrollments/${id}/activate`,
      COMPLETE: (id: string) => `${BASE}/enrollments/${id}/complete`,
      CANCEL: (id: string) => `${BASE}/enrollments/${id}/cancel`,
    },
    BLOG_POSTS: {
      LIST: `${BASE}/blog-posts`,
      CREATE: `${BASE}/blog-posts`,
      UPDATE: (id: string) => `${BASE}/blog-posts/${id}`,
      DELETE: (id: string) => `${BASE}/blog-posts/${id}`,
      DETAIL: (id: string) => `${BASE}/blog-posts/${id}`,
    },
    CLIENT_PROFILES: {
      LIST: `${BASE}/client-profiles`,
      DETAIL: (id: string) => `${BASE}/client-profiles/${id}`,
      MEDIA_UPLOAD: (id: string) => `${BASE}/client-profiles/${id}/media`,
    },
    CARE_PLANS: {
      LIST: `${BASE}/care-plans`,
      CREATE: `${BASE}/care-plans`,
      DETAIL: (id: string) => `${BASE}/care-plans/${id}`,
      BASICS_UPDATE: (id: string) => `${BASE}/care-plans/${id}/basics`,
      DAYS_GENERATE: (id: string) => `${BASE}/care-plans/${id}/days/generate`,
      BUILDER: (id: string) => `${BASE}/care-plans/${id}/builder`,
      DAY_SECTION_ITEMS: (id: string, dayId: string, section: string) =>
        `${BASE}/care-plans/${id}/days/${dayId}/sections/${section}/items`,
      VALIDATE: (id: string) => `${BASE}/care-plans/${id}/validate`,
      ACTIVATE: (id: string) => `${BASE}/care-plans/${id}/activate`,
      CANCEL: (id: string) => `${BASE}/care-plans/${id}/cancel`,
      REVISION: (id: string) => `${BASE}/care-plans/${id}/revision`,
      DAY_NOTES_UPDATE: (id: string, dayId: string) =>
        `${BASE}/care-plans/${id}/days/${dayId}/notes`,
      REPORT_WORKSPACE: (id: string) => `${BASE}/care-plans/${id}/report-workspace`,
      REPORT_RUNS: (id: string) => `${BASE}/care-plans/${id}/report-runs`,
      REPORT_RUN: (carePlanId: string, runId: string) =>
        `${BASE}/care-plans/${carePlanId}/report-runs/${runId}`,
      REPORT_RUN_PUBLISH: (carePlanId: string, runId: string) =>
        `${BASE}/care-plans/${carePlanId}/report-runs/${runId}/publish`,
      /** Preferred: create / update internal metrics (same body as legacy `report-runs` store). */
      OPERATIONAL_LOGS: (carePlanId: string) =>
        `${BASE}/care-plans/${carePlanId}/operational-logs`,
      /** Create a `draft` row (period defaults to the care plan window; optional sub-range in the body). */
      OPERATIONAL_LOG_DRAFT: (carePlanId: string) =>
        `${BASE}/care-plans/${carePlanId}/operational-logs/draft`,
      OPERATIONAL_LOG: (carePlanId: string, operationalLogId: string) =>
        `${BASE}/care-plans/${carePlanId}/operational-logs/${operationalLogId}`,
      OPERATIONAL_LOG_SUBMIT_FOR_REVIEW: (
        carePlanId: string,
        operationalLogId: string,
      ) =>
        `${BASE}/care-plans/${carePlanId}/operational-logs/${operationalLogId}/submit-for-review`,
    },
    CARE_PLAN_LOGS: {
      LIST: `${BASE}/care-plan-logs`,
      DETAIL: (id: string) => `${BASE}/care-plan-logs/${id}`,
      ENTRIES: (id: string) => `${BASE}/care-plan-logs/${id}/entries`,
    },
    /** Internal operational logs (`CarePlanOperationalLog` rows). */
    OPERATIONAL_LOGS: {
      LIST: `${BASE}/operational-logs`,
    },
    /** Client-facing period report runs (`care_plan_report_runs`). */
    PERIOD_REPORTS: {
      LIST: `${BASE}/period-reports`,
    },
    USERS: {
      LIST: `${BASE}/users`,
      CREATE: `${BASE}/users`,
      DETAIL: (id: string) => `${BASE}/users/${id}`,
      UPDATE: (id: string) => `${BASE}/users/${id}`,
      DELETE: (id: string) => `${BASE}/users/${id}`,
    },
    INTAKE_ASSESSMENTS: {
      TEMPLATE: (version: number) => `${BASE}/onboarding/templates/${version}`,
      LIST: `${BASE}/onboarding/intakes`,
      CREATE: `${BASE}/onboarding/intakes`,
      SAVE_SECTION_ANSWERS: (intakeId: string, sectionId: string) =>
        `${BASE}/onboarding/intakes/${intakeId}/sections/${sectionId}`,
      DETAIL: (id: string) => `${BASE}/onboarding/intakes/${id}`,
      CANCEL: (id: string) => `${BASE}/onboarding/intakes/${id}/cancel`,
      COMPLETE: (id: string) => `${BASE}/onboarding/intakes/${id}/complete`,
    },
    NOTIFICATIONS: {
      LIST: `${BASE}/notifications`,
      MARK_AS_READ: (id: string) => `${BASE}/notifications/${id}/read`,
      MARK_ALL_AS_READ: `${BASE}/notifications/read-all`,
    },
  },
} as const;
