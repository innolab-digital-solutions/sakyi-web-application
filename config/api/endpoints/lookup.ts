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
  NUTRITION_ITEMS: `${BASE}/nutrition-items`,
  UNITS: `${BASE}/units`,
  MOVEMENT_CATEGORIES: `${BASE}/movement-categories`,
  MOVEMENT_EQUIPMENT: `${BASE}/movement-equipment`,
  MOVEMENT_EXERCISES: `${BASE}/movement-exercises`,
  MOVEMENT_PRESCRIPTION_PROFILES: `${BASE}/movement-prescription-profiles`,
  MOVEMENT_PRESCRIPTION_INTENSITIES: `${BASE}/movement-prescription-intensities`,
  BLOG_CATEGORIES: `${BASE}/blog-categories`,
  TEAM_MEMBERS: `${BASE}/team-members`,
  ENROLLMENTS: `${BASE}/enrollments`,
} as const;
