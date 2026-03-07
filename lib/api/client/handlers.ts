import { MESSAGES } from './constants';
import { ApiClientError } from './errors';
import type { ApiError as ApiErrorPayload, ApiResponse } from './types';

/**
 * Response normalizers used by the core client only.
 * Each function converts a failure case (network error, non-JSON, parse failure, backend error)
 * into either a thrown {@link ApiClientError} or a returned {@link ApiResponse} with `status: 'error'`,
 * depending on `throwOnError`. The error type itself is defined in `errors.ts`.
 */

/**
 * Builds a normalized API error response object (no throw).
 *
 * @template T - The type of the expected response data.
 * @param message - User-facing error message.
 * @param errors - Optional detailed errors, keyed by field or context.
 * @returns ApiResponse with status 'error'.
 */
export const toErrorResponse = <T>(
  message: string,
  errors?: Record<string, unknown>,
): ApiResponse<T> => {
  return { status: 'error', message, errors: errors ?? undefined };
};

/**
 * Handles failures caused by network errors while making API requests.
 *
 * @template T - The type of the expected response data.
 * @param {unknown} error - The error object thrown by the network failure.
 * @param {boolean} throwOnError - If true, throws an {@link ApiClientError}, otherwise returns an error response.
 * @returns {Promise<ApiResponse<T>>} A rejected error or a failure response.
 * @throws {ApiClientError} If `throwOnError` is true.
 */
export const handleNetworkFailure = async <T>(
  error: unknown,
  throwOnError: boolean,
): Promise<ApiResponse<T>> => {
  const errors = { network: [String(error)] };
  if (throwOnError) {
    throw new ApiClientError(MESSAGES.NETWORK_ERROR, 0, errors);
  }
  return toErrorResponse<T>(MESSAGES.NETWORK_ERROR, errors);
};

/**
 * Handles responses that do not return JSON, such as plain text or other formats.
 *
 * @template T - The type of the expected response data.
 * @param {Response} response - The Fetch API response object.
 * @param {string} text - The raw response text.
 * @returns {ApiResponse<T>} A success or error response containing the raw data.
 */
export const handleNonJson = <T>(
  response: Response,
  text: string,
): ApiResponse<T> => {
  const ok = response.ok;
  return {
    status: ok ? 'success' : 'error',
    message: ok ? MESSAGES.SUCCESS : response.statusText,
    data: text as unknown as T,
  };
};

/**
 * Handles successful API responses that contain no content (e.g., HTTP 204).
 *
 * @template T - The type of the expected response data.
 * @returns {ApiResponse<T>} A success response with `undefined` as the data.
 */
export const handleNoContent = <T>(): ApiResponse<T> => {
  return {
    status: 'success',
    message: MESSAGES.SUCCESS,
    data: undefined as unknown as T,
  };
};

/**
 * Handles errors thrown when JSON response parsing fails.
 *
 * @template T - The type of the expected response data.
 * @param {Response} response - The Fetch API response object.
 * @param {boolean} throwOnError - If true, throws an {@link ApiClientError}, otherwise returns an error response.
 * @returns {Promise<ApiResponse<T>>} The error response object or throws.
 * @throws {ApiClientError} If `throwOnError` is true.
 */
export const handleJsonParseFailure = async <T>(
  response: Response,
  throwOnError: boolean,
): Promise<ApiResponse<T>> => {
  const errorResponse = toErrorResponse<T>(MESSAGES.INVALID_JSON);
  if (throwOnError) {
    throw new ApiClientError(MESSAGES.INVALID_JSON, response.status);
  }
  return errorResponse;
};

/**
 * Handles error responses returned from the backend server,
 * constructing a formatted error result or throwing as configured.
 *
 * - When `throwOnError` is true, wraps the payload in an {@link ApiClientError}.
 * - When `throwOnError` is false, returns a normalized {@link ApiResponse} with `status: 'error'`.
 *
 * @template T - The type of the expected response data.
 * @param {Response} response - The Fetch API response object.
 * @param {ApiErrorPayload} payload - The parsed error payload from the backend.
 * @param {boolean} throwOnError - If true, throws an {@link ApiClientError}, otherwise returns an error response.
 * @returns {ApiResponse<T>} The structured backend error response or throws.
 * @throws {ApiClientError} If `throwOnError` is true.
 */
export const handleBackendError = <T>(
  response: Response,
  payload: ApiErrorPayload,
  throwOnError: boolean,
): ApiResponse<T> => {
  const errorResponse: ApiResponse<T> = {
    status: 'error',
    message: payload.message ?? response.statusText,
    errors: payload.errors,
    data: payload.data,
  };

  if (throwOnError) {
    const message =
      (errorResponse.message?.trim() && errorResponse.message) ||
      MESSAGES.DEFAULT_ERROR;
    throw new ApiClientError(
      message,
      response.status,
      errorResponse.errors as Record<string, unknown> | undefined,
      response.headers.get('x-request-id') ?? undefined,
      payload,
    );
  }

  return errorResponse;
};
