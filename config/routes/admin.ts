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
  },
} as const;
