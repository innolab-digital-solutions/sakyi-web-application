import { fetchBlob } from './blob';
import type { BlobDownloadResult } from './blob';
import { client } from './core';
import type { ApiResponse, ReadOptions, WriteOptions } from './types';

/**
 * HTTP shorthand methods for performing API requests using the shared client.
 *
 * Provides strongly-typed helpers for common HTTP verbs (GET, POST, PUT, PATCH, DELETE),
 * enforcing appropriate request options and type safety on payloads and responses.
 *
 * All methods delegate to the shared `client` function, applying the correct HTTP verb and
 * handling body inclusion/exclusion as per method requirements.
 *
 * @property get     - Perform a GET request (no request body).
 * @property getBlob - Perform a GET that returns raw binary content (PDF, etc.).
 * @property post    - Perform a POST request (with optional request body).
 * @property put     - Perform a PUT request (with optional request body).
 * @property patch   - Perform a PATCH request (with optional request body).
 * @property delete  - Perform a DELETE request (no request body).
 */
export const http = {
  /**
   * Perform a GET request to the provided endpoint.
   *
   * @param endpoint - API route to query (relative to API base).
   * @param options - Optional read-only request options (no body allowed).
   * @returns Promise resolving to an API response of the expected type.
   *
   * @example
   *   const response = await http.get<User[]>('/users');
   */
  get<T>(endpoint: string, options?: ReadOptions): Promise<ApiResponse<T>> {
    return client<T>(endpoint, { ...options, method: 'GET' });
  },

  /**
   * Perform a GET that returns raw binary content (e.g. a PDF attachment).
   *
   * @param endpoint - API route to query (relative to API base).
   * @param options - Optional read-only request options (no body allowed).
   * @returns Promise resolving to the blob and optional server filename.
   */
  getBlob(
    endpoint: string,
    options?: ReadOptions,
  ): Promise<BlobDownloadResult> {
    return fetchBlob(endpoint, options);
  },

  /**
   * Perform a POST request to the provided endpoint with an optional request body.
   *
   * @param endpoint - API route to query (relative to API base).
   * @param body - Optional request payload (object, array, or native body).
   * @param options - Optional request options.
   * @returns Promise resolving to an API response of the expected type.
   *
   * @example
   *   const response = await http.post<User>('/users', { name: 'Alice' });
   */
  post<T>(
    endpoint: string,
    body?: WriteOptions['body'],
    options?: WriteOptions,
  ): Promise<ApiResponse<T>> {
    return client<T>(endpoint, { ...options, method: 'POST', body });
  },

  /**
   * Perform a PUT request to the provided endpoint with an optional request body.
   *
   * @param endpoint - API route to query (relative to API base).
   * @param body - Optional request payload (object, array, or native body).
   * @param options - Optional request options.
   * @returns Promise resolving to an API response of the expected type.
   *
   * @example
   *   const response = await http.put<User>('/users', { name: 'Alice' });
   */
  put<T>(
    endpoint: string,
    body?: WriteOptions['body'],
    options?: WriteOptions,
  ): Promise<ApiResponse<T>> {
    return client<T>(endpoint, { ...options, method: 'PUT', body });
  },

  /**
   * Perform a PATCH request to the provided endpoint with an optional request body.
   *
   * @param endpoint - API route to query (relative to API base).
   * @param body - Optional request payload (object, array, or native body).
   * @param options - Optional request options.
   * @returns Promise resolving to an API response of the expected type.
   *
   * @example
   *   const response = await http.patch<User>('/users', { name: 'Alice' });
   */
  patch<T>(
    endpoint: string,
    body?: WriteOptions['body'],
    options?: WriteOptions,
  ): Promise<ApiResponse<T>> {
    return client<T>(endpoint, { ...options, method: 'PATCH', body });
  },

  /**
   * Perform a DELETE request to the provided endpoint.
   *
   * @param endpoint - API route to query (relative to API base).
   * @param options - Optional read-only request options (no body allowed).
   * @returns Promise resolving to an API response of the expected type.
   *
   * @example
   *   const response = await http.delete<User>('/users');
   */
  delete<T>(endpoint: string, options?: ReadOptions): Promise<ApiResponse<T>> {
    return client<T>(endpoint, { ...options, method: 'DELETE' });
  },
};
