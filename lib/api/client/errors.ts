import type { ApiError as ApiErrorPayload } from './types';

/**
 * Structured error thrown by the API client when a request fails and `throwOnError` is true.
 *
 * Encapsulates HTTP status, backend or network error details, and optional metadata
 * (request ID, raw payload) so callers can branch on error type without parsing responses.
 *
 * Use the getters (`isUnauthorized`, `isValidationError`, etc.) for type-safe handling
 * (e.g. redirect to login on 401/419, show field errors on 422).
 *
 * @extends Error
 */
export class ApiClientError extends Error {
  readonly status: number;
  readonly errors: Record<string, unknown> | undefined;
  readonly requestId: string | undefined;
  readonly payload: ApiErrorPayload | undefined;

  /**
   * @param message - User-facing error message.
   * @param status - HTTP status code (0 for network failures).
   * @param errors - Optional field or context errors from the backend.
   * @param requestId - Optional request ID from response header `x-request-id`.
   * @param payload - Optional raw API error payload for logging or inspection.
   */
  constructor(
    message: string,
    status: number,
    errors?: Record<string, unknown>,
    requestId?: string,
    payload?: ApiErrorPayload,
  ) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.errors = errors;
    this.requestId = requestId;
    this.payload = payload;
    Object.setPrototypeOf(this, ApiClientError.prototype);
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get isServerError(): boolean {
    return this.status >= 500;
  }

  get isValidationError(): boolean {
    return this.status === 422;
  }

  get isUnauthorized(): boolean {
    return this.status === 401 || this.status === 419;
  }
}
