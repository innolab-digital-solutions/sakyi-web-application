/**
 * Public API surface for the HTTP client utilities.
 *
 * Import from this barrel module instead of deep paths to keep call sites
 * consistent and to allow the underlying implementation to evolve.
 */
export { api as apiConfig } from './config';
export { client } from './core';
export { ensureCsrfCookie, getCsrfToken } from './csrf';
export { ApiClientError } from './errors';
export { http } from './http';
export type {
  ApiError,
  ApiResponse,
  ApiSuccess,
  ClientOptions,
  ClientRequestInit,
  HttpMethod,
  NextFetchCache,
  NextFetchNext,
} from './types';
