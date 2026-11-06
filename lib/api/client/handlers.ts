import { base } from '@/config/api/base';

import { MESSAGES } from './constants';
import { ApiClientError } from './errors';
import { dispatchApiUnauthorized } from './events';
import type {
  ApiError as ApiErrorPayload,
  ApiResponse,
  ThrowOrReturnOptions,
} from './types';

/**
 * Either throws an ApiClientError or returns an error response,
 * depending on the value of throwOnError and an optional fallbackResponse.
 *
 * @template T The expected response data type.
 * @param {string} message - Error message describing the failure.
 * @param {number} status - HTTP status code associated with the error.
 * @param {ThrowOrReturnOptions<T>} options - Additional options controlling error handling and fallback response.
 * @returns {ApiResponse<T>} An error response object, unless throwOnError is true (then throws an exception).
 *
 * @throws {ApiClientError} If throwOnError is true.
 */
const throwOrReturnApiClientError = <T>(
  message: string,
  status: number,
  options: ThrowOrReturnOptions<T>,
): ApiResponse<T> => {
  const { throwOnError, errors, requestId, payload, fallbackResponse } =
    options;

  if (throwOnError) {
    throw new ApiClientError(message, status, errors, requestId, payload);
  }

  if (fallbackResponse !== undefined) {
    return fallbackResponse;
  }

  return {
    status: 'error',
    message,
    meta: { version: base.apiVersion },
    ...(errors !== undefined && { errors }),
  };
};

/**
 * Handles network errors during fetch requests. Converts network failures to a uniform error response,
 * or throws an ApiClientError depending on throwOnError.
 *
 * @template T The expected response data type.
 * @param {unknown} error - The error object thrown by fetch (usually a network or CORS issue).
 * @param {boolean} throwOnError - Whether to throw an ApiClientError or return an error response.
 * @returns {Promise<ApiResponse<T>>} Promise resolving to an ApiResponse<T> error structure.
 */
export const handleNetworkError = async <T>(
  error: unknown,
  throwOnError: boolean,
): Promise<ApiResponse<T>> => {
  const errors = { network: [String(error)] };
  return throwOrReturnApiClientError<T>(MESSAGES.NETWORK_ERROR, 0, {
    throwOnError,
    errors,
  });
};

/**
 * Handles responses where the content is not JSON (e.g., plain text or HTML).
 * Returns the raw text as the response data with appropriate success/error status.
 *
 * @template T The expected response data type.
 * @param {Response} response - The fetch response object.
 * @param {string} text - The raw response body as text.
 * @returns {ApiResponse<T>} The API response object with the raw text coerced to T.
 */
export const handleNonJsonResponse = <T>(
  response: Response,
  text: string,
): ApiResponse<T> => {
  const ok = response.ok;
  return {
    status: ok ? 'success' : 'error',
    message: ok ? MESSAGES.SUCCESS : response.statusText,
    data: text as unknown as T,
    meta: { version: base.apiVersion },
  };
};

/**
 * Handles HTTP 204 No Content responses.
 * Returns a standardized "success" ApiResponse with data as undefined.
 *
 * @template T The expected response data type.
 * @returns {ApiResponse<T>} The API response object with data set to undefined.
 */
export const handleNoContentResponse = <T>(): ApiResponse<T> => {
  return {
    status: 'success',
    message: MESSAGES.SUCCESS,
    data: undefined as unknown as T,
    meta: { version: base.apiVersion },
  };
};

/**
 * Handles failures to parse a response as JSON.
 * Returns an error ApiResponse or throws, depending on throwOnError.
 *
 * @template T The expected response data type.
 * @param {Response} response - The fetch response object that failed parsing.
 * @param {boolean} throwOnError - Whether to throw on error or return an error response.
 * @returns {Promise<ApiResponse<T>>} Promise resolving to the error response.
 *
 * @throws {ApiClientError} If throwOnError is true.
 */
export const handleInvalidJson = async <T>(
  response: Response,
  throwOnError: boolean,
): Promise<ApiResponse<T>> =>
  throwOrReturnApiClientError<T>(MESSAGES.INVALID_JSON, response.status, {
    throwOnError,
  });

/**
 * Handles error responses returned by the backend (i.e., parsed JSON object with status "error").
 * Wraps the error payload and HTTP response metadata for downstream consumption or error throwing.
 *
 * @template T The expected response data type.
 * @param {Response} response - The fetch response object with error status.
 * @param {ApiErrorPayload} payload - The API error payload returned by the backend.
 * @param {boolean} throwOnError - Whether to throw on error or return an error response.
 * @returns {ApiResponse<T>} The structured error response, or throws ApiClientError if throwOnError is true.
 *
 * @throws {ApiClientError} If throwOnError is true.
 */
export const handleBackendApiError = <T>(
  response: Response,
  payload: ApiErrorPayload,
  throwOnError: boolean,
): ApiResponse<T> => {
  if (response.status === 401 && typeof window !== 'undefined') {
    dispatchApiUnauthorized(payload.message);
  }

  const requestId = response.headers.get('x-request-id') ?? undefined;

  const errorResponse: ApiResponse<T> = {
    status: 'error',
    message: payload.message ?? response.statusText,
    meta: payload.meta ?? { version: base.apiVersion },
    errors: payload.errors,
    data: payload.data,
  };

  const message =
    (errorResponse.message?.trim() && errorResponse.message) ||
    MESSAGES.DEFAULT_ERROR;

  return throwOrReturnApiClientError<T>(message, response.status, {
    throwOnError,
    errors: errorResponse.errors as Record<string, unknown> | undefined,
    requestId,
    payload,
    fallbackResponse: errorResponse,
  });
};
