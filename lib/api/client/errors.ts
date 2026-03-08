import type { ApiError as ApiErrorPayload } from './types';

/**
 * Represents an error thrown by the API client for HTTP failures,
 * network problems, or API-provided error responses.
 *
 * Encapsulates relevant metadata commonly needed for error handling
 * and debugging, such as HTTP status, detailed field errors,
 * an optional request ID, and error payload returned by the API (if any).
 *
 * @property {number} status - HTTP status code of the error response (e.g., 404, 422, 500).
 * @property {Record<string, unknown>} errors - Additional error messages keyed by field or error type, if provided by the API.
 * @property {string} requestId - Optional unique request identifier attached by the API for tracing/debugging.
 * @property {ApiErrorPayload} payload - The raw API payload for error details, if available.
 * 
 * @remarks
 * This error is thrown when the API client encounters an error while making a request.
 * It is used to handle errors and provide a consistent interface for error handling.
 *
 * @example
 * const error = new ApiClientError('Request failed', 404, { message: 'Resource not found' });
 *
 * if (error.isNotFound) {
 *   console.error('Resource not found');
 * }
 */
export class ApiClientError extends Error {
  readonly status: number;
  readonly errors?: Record<string, unknown>;
  readonly requestId?: string;
  readonly payload?: ApiErrorPayload;

  constructor(
    message: string,
    status: number,
    errors?: Record<string, unknown>,
    requestId?: string,
    payload?: ApiErrorPayload,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.errors = errors;
    this.requestId = requestId;
    this.payload = payload;
    // Ensures correct prototype chain, especially when compiling to ES5 or using transpilation.
    Object.setPrototypeOf(this, new.target.prototype);
  }

  /**
   * Indicates whether the error was due to forbidden access (HTTP 403).
   *
   * @returns {boolean} True if the status is 403 Forbidden.
   */
  get isForbidden(): boolean {
    return this.status === 403;
  }

  /**
   * Indicates whether the error was due to a missing resource (HTTP 404).
   *
   * @returns {boolean} True if the status is 404 Not Found.
   */
  get isNotFound(): boolean {
    return this.status === 404;
  }

  /**
   * Indicates whether the error was due to a server error (HTTP 5xx).
   *
   * @returns {boolean} True if the status is in the 500–599 range.
   */
  get isServerError(): boolean {
    return this.status >= 500 && this.status < 600;
  }

  /**
   * Indicates whether the error was due to a validation failure (HTTP 422).
   *
   * @returns {boolean} True if the status is 422 Unprocessable Entity.
   */
  get isValidationError(): boolean {
    return this.status === 422;
  }

  /**
   * Indicates whether the error was due to failed authentication (HTTP 401) or session expired (HTTP 419).
   *
   * @returns {boolean} True if the status is 401 Unauthorized or 419 (session timeout).
   */
  get isUnauthorized(): boolean {
    return this.status === 401 || this.status === 419;
  }

  /**
   * Indicates whether the error was due to a client error (HTTP 4xx).
   *
   * @returns {boolean} True if the status is in the 400–499 range.
   */
  get isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  /**
   * Indicates whether the error was due to a network error (HTTP 0).
   *
   * @returns {boolean} True if the status is 0 (network error).
   */
  get isNetworkError(): boolean {
    return this.status === 0;
  }
}

export default ApiClientError;
