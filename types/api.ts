/**
 * Supported HTTP methods for API requests.
 *
 * Use this type to constrain allowable HTTP verbs when performing requests.
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Standard shape for a successful API response.
 *
 * @template TData - The data payload type.
 * @template TMeta - Additional metadata fields merged with the required `version`.
 * @property status - Always 'success' for successful responses.
 * @property message - Human-readable message describing the outcome.
 * @property data - The main response payload.
 * @property meta - Required metadata that always includes response version.
 */
export type ApiSuccess<
  TData,
  TMeta extends Record<string, unknown> = Record<string, unknown>,
> = {
  status: 'success';
  message: string;
  data: TData;
  meta: {
    version: string;
  } & TMeta;
};

/**
 * Standard shape for an API error response.
 *
 * @property status - Always 'error' for error responses.
 * @property message - Human-readable error message.
 * @property errors - Optional field-level or object-scoped errors.
 * @property data - Optional additional context or details.
 * @property meta - Required metadata containing response version.
 */
export type ApiError = {
  status: 'error';
  message: string;
  errors?: Record<string, unknown>;
  data?: unknown;
  meta: {
    version: string;
  };
};

/**
 * Generic API response union for success or error cases.
 *
 * Use this type to type API response values, enabling type narrowing based on the status field.
 *
 * @template T - The expected 'data' payload type for successful responses.
 */
export type ApiResponse<T> = ApiSuccess<T> | ApiError;
