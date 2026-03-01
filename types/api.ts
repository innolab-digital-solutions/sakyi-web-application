/**
 * Shared API response contract used by both domain types and the HTTP client.
 *
 * This module defines the minimal success/error response shape so that types
 * (e.g. admin program response) do not depend on infrastructure (lib/api/client).
 * The HTTP client in lib/api/client re-exports these for implementation use.
 */

/**
 * Successful API response payload.
 *
 * @template T - Type of the response data.
 */
export type ApiSuccess<T> = {
  status: 'success';
  message: string;
  data: T;
  meta?: Record<string, unknown>;
};

/**
 * Error API response payload.
 */
export type ApiError = {
  status: 'error';
  message: string;
  errors?: Record<string, unknown>;
  data?: unknown;
};

/**
 * Generic API response: either success or error.
 *
 * @template T - Type of the success response data.
 */
export type ApiResponse<T> = ApiSuccess<T> | ApiError;

/**
 * HTTP methods used for API requests. Shared so application code (e.g. form hook)
 * can type submissions without depending on the HTTP client module.
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
