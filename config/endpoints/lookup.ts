/**
 * API endpoints for shared lookup data (e.g. dropdown options, reference data).
 *
 * These endpoints are generally read-only and used by both site and admin
 * surfaces to populate selects, filters, and other reference UI.
 */
export const LOOKUP_ENDPOINTS = {
  GOALS: '/lookup/goals',
} as const;
