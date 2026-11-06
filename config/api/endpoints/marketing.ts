/**
 * Centralized API endpoint definitions for marketing-related server routes.
 *
 * This object contains all public marketing-facing API endpoints, grouped by resource type.
 * Grouping endpoints this way ensures maintainability and clarity as the application expands and accommodates future resources.
 *
 * @example
 * import { MARKETING_ENDPOINTS } from '@/config/api/endpoints/marketing';
 *
 * MARKETING_ENDPOINTS.PROGRAMS; // "/web/marketing/programs"
 */
const BASE = '/web/marketing';

export const MARKETING_ENDPOINTS = {
  PROGRAMS: {
    LIST: `${BASE}/programs`,
    DETAIL: (id: string) => `${BASE}/programs/${id}`,
  },
  BLOGS: {
    LIST: `${BASE}/blog-posts`,
    DETAIL: (id: string) => `${BASE}/blog-posts/${id}`,
    CATEGORIES: `${BASE}/blog-categories`,
  },
  CONTACT: `${BASE}/contact`,
} as const;
