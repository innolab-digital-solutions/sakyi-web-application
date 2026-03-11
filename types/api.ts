/**
 * Supported HTTP methods for API requests.
 *
 * Use this type to constrain allowable HTTP verbs when performing requests.
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Standard shape for a successful API response.
 *
 * @template T - The data payload type.
 * @property status - Always 'success' for successful responses.
 * @property message - Human-readable message describing the outcome.
 * @property data - The main response payload.
 * @property meta - Optional metadata (e.g., pagination, extra info).
 */
export type ApiSuccess<T> = {
  status: 'success';
  message: string;
  data: T;
  meta?: Record<string, unknown>;
};

/**
 * Standard shape for an API error response.
 *
 * @property status - Always 'error' for error responses.
 * @property message - Human-readable error message.
 * @property errors - Optional field-level or object-scoped errors.
 * @property data - Optional additional context or details.
 */
export type ApiError = {
  status: 'error';
  message: string;
  errors?: Record<string, unknown>;
  data?: unknown;
};

/**
 * Generic API response union for success or error cases.
 *
 * Use this type to type API response values, enabling type narrowing based on the status field.
 *
 * @template T - The expected 'data' payload type for successful responses.
 */
export type ApiResponse<T> = ApiSuccess<T> | ApiError;
