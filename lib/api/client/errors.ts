import type { ApiError as ApiErrorPayload } from './types';

/**
 * Represents a structured error thrown by API client requests.
 *
 * Encapsulates HTTP status, detailed error payload from the backend or network layer,
 * and auxiliary metadata such as request ID and server payload (if present).
 *
 * Provides type-safe introspection for common HTTP error categories via convenience getters.
 *
 * Typical use cases:
 *  - Thrown by the API client on network failures or when backend returns an error response.
 *  - Enables higher-level error handling logic (UI redirects, messaging, logging).
 *
 * @extends {Error}
 */
export class ApiClientError extends Error {
  readonly status: number;
  readonly errors: Record<string, unknown> | undefined;
  readonly requestId: string | undefined;
  readonly payload: ApiErrorPayload | undefined;

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
