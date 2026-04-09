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
  FOCUSES: `${BASE}/focuses`,
  GOALS: `${BASE}/goals`,
  CLIENTS: `${BASE}/clients`,
  NUTRITION_CATEGORIES: `${BASE}/nutrition-categories`,
  UNITS: `${BASE}/units`,
  MOVEMENT_CATEGORIES: `${BASE}/movement-categories`,
  BLOG_CATEGORIES: `${BASE}/blog-categories`,
} as const;
