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
    NUTRITION_ITEMS: {
      LIST: `${BASE}/nutrition-items`,
      CREATE: `${BASE}/nutrition-items/create`,
      EDIT: (id: string) => `${BASE}/nutrition-items/${id}/edit`,
      DETAIL: (id: string) => `${BASE}/nutrition-items/${id}`,
    },
    MOVEMENT_CATEGORIES: {
      LIST: `${BASE}/movement-categories`,
      CREATE: `${BASE}/movement-categories/create`,
      EDIT: (id: string) => `${BASE}/movement-categories/${id}/edit`,
      DETAIL: (id: string) => `${BASE}/movement-categories/${id}`,
    },
    MOVEMENT_EXERCISES: {
      LIST: `${BASE}/movement-exercises`,
      CREATE: `${BASE}/movement-exercises/create`,
      EDIT: (id: string) => `${BASE}/movement-exercises/${id}/edit`,
      DETAIL: (id: string) => `${BASE}/movement-exercises/${id}`,
    },
    MOVEMENT_EQUIPMENT: {
      LIST: `${BASE}/movement-equipment`,
      CREATE: `${BASE}/movement-equipment/create`,
      EDIT: (id: string) => `${BASE}/movement-equipment/${id}/edit`,
      DETAIL: (id: string) => `${BASE}/movement-equipment/${id}`,
    },
    BLOG_CATEGORIES: {
      LIST: `${BASE}/blog-categories`,
      CREATE: `${BASE}/blog-categories/create`,
      EDIT: (id: string) => `${BASE}/blog-categories/${id}/edit`,
      DETAIL: (id: string) => `${BASE}/blog-categories/${id}`,
    },
    BLOG_POSTS: {
      LIST: `${BASE}/blog-posts`,
      CREATE: `${BASE}/blog-posts/create`,
      EDIT: (id: string) => `${BASE}/blog-posts/${id}/edit`,
      DETAIL: (id: string) => `${BASE}/blog-posts/${id}`,
    },
    TEAMS: {
      LIST: `${BASE}/teams`,
      CREATE: `${BASE}/teams/create`,
      EDIT: (id: string) => `${BASE}/teams/${id}/edit`,
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
