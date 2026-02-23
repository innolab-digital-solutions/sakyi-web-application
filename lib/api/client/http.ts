import { client } from './core';
import type { ApiResponse } from './types';
import type { ClientRequestInit } from './types';

type ReadOptions = Omit<ClientRequestInit, 'body'>;

type WriteOptions = ClientRequestInit;

/**
 * Convenience HTTP method helpers using the core API client.
 * All methods provide strongly-typed HTTP access and support full Next.js fetch options (cache, next, etc).
 * Designed for ease of use with modern API endpoints that follow RESTful conventions.
 */
export const http = {
  /**
   * Performs a GET request to the specified API endpoint.
   *
   * @template T - Expected response data type.
   * @param {string} endpoint - Path segment or URL of the resource to retrieve.
   * @param {ReadOptions} [options] - Optional request options (headers, cache, next, etc).
   * @returns {Promise<ApiResponse<T>>} Promise resolving to the typed API response.
   *
   * @example
   *   const { data } = await http.get<User[]>('users');
   */
  get<T>(endpoint: string, options?: ReadOptions): Promise<ApiResponse<T>> {
    return client<T>(endpoint, { ...options, method: 'GET' });
  },

  /**
   * Performs a POST request to the specified API endpoint.
   *
   * @template T - Expected response data type.
   * @param {string} endpoint - Path segment or URL for the resource.
   * @param {WriteOptions['body']} [body] - Data to send as the request body (JSON, FormData, etc).
   * @param {WriteOptions} [options] - Optional request options (headers, cache, next, etc).
   * @returns {Promise<ApiResponse<T>>} Promise resolving to the typed API response.
   *
   * @example
   *   const result = await http.post<User>('users', { name: 'Alice' });
   */
  post<T>(
    endpoint: string,
    body?: WriteOptions['body'],
    options?: WriteOptions,
  ): Promise<ApiResponse<T>> {
    return client<T>(endpoint, { ...options, method: 'POST', body });
  },

  /**
   * Performs a PUT request to update the specified API resource.
   *
   * @template T - Expected response data type.
   * @param {string} endpoint - Path segment or URL of the resource.
   * @param {WriteOptions['body']} [body] - Data to update the resource with.
   * @param {WriteOptions} [options] - Optional request options (headers, cache, next, etc).
   * @returns {Promise<ApiResponse<T>>} Promise resolving to the typed API response.
   *
   * @example
   *   const result = await http.put<User>('users/123', { name: 'Updated' });
   */
  put<T>(
    endpoint: string,
    body?: WriteOptions['body'],
    options?: WriteOptions,
  ): Promise<ApiResponse<T>> {
    return client<T>(endpoint, { ...options, method: 'PUT', body });
  },

  /**
   * Performs a PATCH request to partially update the specified API resource.
   *
   * @template T - Expected response data type.
   * @param {string} endpoint - Path segment or URL of the resource.
   * @param {WriteOptions['body']} [body] - Partial data to patch the resource.
   * @param {WriteOptions} [options] - Optional request options (headers, cache, next, etc).
   * @returns {Promise<ApiResponse<T>>} Promise resolving to the typed API response.
   *
   * @example
   *   const result = await http.patch<User>('users/123', { email: 'update@example.com' });
   */
  patch<T>(
    endpoint: string,
    body?: WriteOptions['body'],
    options?: WriteOptions,
  ): Promise<ApiResponse<T>> {
    return client<T>(endpoint, { ...options, method: 'PATCH', body });
  },

  /**
   * Performs a DELETE request to remove the specified API resource.
   *
   * @template T - Expected response data type.
   * @param {string} endpoint - Path segment or URL of the resource.
   * @param {ReadOptions} [options] - Optional request options (headers, cache, next, etc).
   * @returns {Promise<ApiResponse<T>>} Promise resolving to the typed API response.
   *
   * @example
   *   await http.delete<null>('users/123');
   */
  delete<T>(endpoint: string, options?: ReadOptions): Promise<ApiResponse<T>> {
    return client<T>(endpoint, { ...options, method: 'DELETE' });
  },
};
