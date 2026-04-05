/**
 * Centralized route paths for admin dashboard pages.
 *
 * These objects contain all admin-facing route definitions, grouped thematically.
 * Grouping routes this way ensures maintainability and clarity as the application expands and accommodates future modules.
 *
 * @example
 * import { ADMIN_ROUTES } from '@/config/routes/admin';
 * ADMIN_ROUTES.MODULES.PROGRAMS.EDIT('123'); // "/admin/programs/123/edit"
 */
const BASE = '/admin';

export const ADMIN_ROUTES = {
  ROOT: BASE,
  AUTH: {
    LOGIN: `${BASE}/login`,
  },
  MODULES: {
    OVERVIEW: `${BASE}/overview`,
    PROGRAMS: {
      LIST: `${BASE}/programs`,
      CREATE: `${BASE}/programs/create`,
      EDIT: (id: string) => `${BASE}/programs/${id}/edit`,
      DETAIL: (id: string) => `${BASE}/programs/${id}`,
    },
    UNITS: {
      LIST: `${BASE}/units`,
      CREATE: `${BASE}/units/create`,
      EDIT: (id: string) => `${BASE}/units/${id}/edit`,
      DETAIL: (id: string) => `${BASE}/units/${id}`,
    },
    NUTRITION_CATEGORIES: {
      LIST: `${BASE}/nutrition-categories`,
      CREATE: `${BASE}/nutrition-categories/create`,
      EDIT: (id: string) => `${BASE}/nutrition-categories/${id}/edit`,
      DETAIL: (id: string) => `${BASE}/nutrition-categories/${id}`,
    },
    MOVEMENT_CATEGORIES: {
      LIST: `${BASE}/movement-categories`,
      CREATE: `${BASE}/movement-categories/create`,
      EDIT: (id: string) => `${BASE}/movement-categories/${id}/edit`,
      DETAIL: (id: string) => `${BASE}/movement-categories/${id}`,
    },
    ONBOARDING: {
      INTAKES: {
        LIST: `${BASE}/onboarding/intakes`,
        CREATE: `${BASE}/onboarding/intakes/create`,
        INTERVIEW: (id: string) => `${BASE}/onboarding/intakes/${id}/interview`,
        DETAIL: (id: string) => `${BASE}/onboarding/intakes/${id}`,
      },
    },
  },
} as const;
