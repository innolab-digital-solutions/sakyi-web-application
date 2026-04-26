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
    ENROLLMENT_REQUESTS: {
      LIST: `${BASE}/enrollment-requests`,
      DETAIL: (id: string) => `${BASE}/enrollment-requests/${id}`,
    },
    ENROLLMENT_CONTRACTS: {
      LIST: `${BASE}/enrollment-contracts`,
      DETAIL: (id: string) => `${BASE}/enrollment-contracts/${id}`,
    },
    ENROLLMENT_RECORDS: {
      LIST: `${BASE}/enrollments`,
      DETAIL: (id: string) => `${BASE}/enrollments/${id}`,
    },
    BLOG_POSTS: {
      LIST: `${BASE}/blog-posts`,
      CREATE: `${BASE}/blog-posts/create`,
      EDIT: (id: string) => `${BASE}/blog-posts/${id}/edit`,
      DETAIL: (id: string) => `${BASE}/blog-posts/${id}`,
    },
    INTAKE_ASSESSMENTS: {
      LIST: `${BASE}/intake-assessments`,
      CREATE: `${BASE}/intake-assessments/create`,
      INTERVIEW: (id: string) =>
        `${BASE}/intake-assessments/${id}?view=interview`,
      DETAIL: (id: string) => `${BASE}/intake-assessments/${id}`,
    },
    CLIENT_PROFILES: {
      LIST: `${BASE}/client-profiles`,
      DETAIL: (id: string) => `${BASE}/client-profiles/${id}`,
    },
    CARE_PLANS: {
      LIST: `${BASE}/care-plans`,
      CREATE: `${BASE}/care-plans/create`,
      WORKSPACE: (id: string) => `${BASE}/care-plans/${id}/workspace`,
      REPORT: (id: string) => `${BASE}/care-plans/${id}/report`,
      DETAIL: (id: string) => `${BASE}/care-plans/${id}`,
    },
    CARE_PLAN_LOGS: {
      LIST: `${BASE}/care-plan-logs`,
      DETAIL: (id: string) => `${BASE}/care-plan-logs/${id}`,
    },
    USERS: {
      LIST: `${BASE}/users`,
      CREATE: `${BASE}/users/create`,
      EDIT: (id: string) => `${BASE}/users/${id}/edit`,
    },
  },
} as const;
