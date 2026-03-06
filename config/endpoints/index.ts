import { ADMIN_ENDPOINTS } from './admin';
import { LOOKUP_ENDPOINTS } from './lookup';
import { SITE_ENDPOINTS } from './site';

/**
 * Aggregated API endpoint configuration used across the application.
 *
 * Structure:
 * - ADMIN: Endpoints for admin dashboard and related backend modules.
 * - LOOKUP: Shared lookup/reference data endpoints.
 * - SITE: Public site/marketing endpoints.
 *
 * These values are **path fragments** expected to be combined with the
 * base API URL by the HTTP client in `lib/api/client`.
 */
const ENDPOINTS = {
  ADMIN: ADMIN_ENDPOINTS,
  LOOKUP: LOOKUP_ENDPOINTS,
  SITE: SITE_ENDPOINTS,
} as const;

export { ENDPOINTS as default };

export { ADMIN_ENDPOINTS } from './admin';
export { LOOKUP_ENDPOINTS } from './lookup';
export { SITE_ENDPOINTS } from './site';
