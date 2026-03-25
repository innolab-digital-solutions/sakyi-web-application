/**
 * Centralized API endpoint definitions for lookup-related server routes.
 *
 * This object contains all lookup-related API endpoints, grouped by resource type.
 * Grouping endpoints this way ensures maintainability and clarity as the application expands and accommodates future resources.
 *
 * @example
 * import { LOOKUP_ENDPOINTS } from '@/config/api/endpoints/lookup';
 *
 * LOOKUP_ENDPOINTS.GOALS; // "/lookup/goals"
 */
const BASE = '/lookup';

export const LOOKUP_ENDPOINTS = {
  GOALS: `${BASE}/goals`,
  CLIENTS: `${BASE}/clients`,
} as const;
