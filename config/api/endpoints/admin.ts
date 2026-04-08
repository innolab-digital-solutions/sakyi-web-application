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
      CREATE: `${BASE}/programs`,
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
    BLOG_POSTS: {
      LIST: `${BASE}/blog-posts`,
      CREATE: `${BASE}/blog-posts`,
      UPDATE: (id: string) => `${BASE}/blog-posts/${id}`,
      DELETE: (id: string) => `${BASE}/blog-posts/${id}`,
      DETAIL: (id: string) => `${BASE}/blog-posts/${id}`,
    },
    ONBOARDING: {
      TEMPLATE: (version: number) => `${BASE}/onboarding/templates/${version}`,
      INTAKES: {
        LIST: `${BASE}/onboarding/intakes`,
        CREATE: `${BASE}/onboarding/intakes`,
        SAVE_SECTION_ANSWERS: (intakeId: string, sectionId: string) =>
          `${BASE}/onboarding/intakes/${intakeId}/sections/${sectionId}`,
        DETAIL: (id: string) => `${BASE}/onboarding/intakes/${id}`,
        CANCEL: (id: string) => `${BASE}/onboarding/intakes/${id}/cancel`,
        COMPLETE: (id: string) => `${BASE}/onboarding/intakes/${id}/complete`,
      },
    },
  },
} as const;
