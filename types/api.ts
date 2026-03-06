/**
 * Supported HTTP methods for API requests.
 *
 * Constrains allowed HTTP method values to common RESTful actions.
 * Used to enforce method safety and clarity when building API calls.
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Represents the structure of a successful API response from the backend.
 *
 * @template T - The type of the payload returned in the response.
 * @property status - Indicates the response is successful ('success').
 * @property message - A human-readable message describing the outcome.
 * @property data - The payload of the response, typed as specified.
 * @property [meta] - Optional additional metadata, such as pagination info.
 *
 * This type is used for all successful API interactions to ensure marked consistency.
 */
export type ApiSuccess<T> = {
  status: 'success';
  message: string;
  data: T;
  meta?: Record<string, unknown>;
};

/**
 * Represents the structure of an error API response from the backend.
 *
 * @property status - Indicates the response is an error ('error').
 * @property message - A human-readable error message.
 * @property [errors] - Optional field for detailed error information, such as validation issues.
 * @property [data] - Optional additional data associated with the error.
 *
 * This type is used for failed API interactions to allow for predictable error handling.
 */
export type ApiError = {
  status: 'error';
  message: string;
  errors?: Record<string, unknown>;
  data?: unknown;
};

/**
 * Union of possible shapes for API responses.
 *
 * @template T - The type of payload expected for a successful response.
 * Can be either ApiSuccess<T> or ApiError, enabling strict handling of varied API results.
 */
export type ApiResponse<T> = ApiSuccess<T> | ApiError;
