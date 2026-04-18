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
    },
    ENROLLMENT_CONTRACTS: {
      LIST: `${BASE}/enrollment-contracts`,
      DETAIL: (id: string) => `${BASE}/enrollment-contracts/${id}`,
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
