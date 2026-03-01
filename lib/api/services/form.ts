import { http } from '@/lib/api/client';
import type { ApiResponse, HttpMethod } from '@/types/api';

export type { HttpMethod };

export type FormSubmitOptions = {
  signal?: AbortSignal;
  throwOnError?: boolean;
};

/**
 * Application-layer form submission. Performs an HTTP request so that the form
 * hook does not depend on the HTTP client directly.
 *
 * @param method - HTTP method.
 * @param url - Endpoint URL or path.
 * @param body - Optional body for POST, PUT, PATCH.
 * @param options - Optional signal (cancellation) and throwOnError.
 * @returns The API response. Caller handles success/error and field errors.
 */
export async function submitRequest<T>(
  method: HttpMethod,
  url: string,
  body?: BodyInit | Record<string, unknown> | unknown[],
  options?: FormSubmitOptions,
): Promise<ApiResponse<T>> {
  const requestOptions = {
    throwOnError: options?.throwOnError ?? false,
    ...(options?.signal != null && { signal: options.signal }),
  };

  switch (method) {
    case 'GET':
      return http.get<T>(url, requestOptions);
    case 'POST':
      return http.post<T>(url, body, requestOptions);
    case 'PUT':
      return http.put<T>(url, body, requestOptions);
    case 'PATCH':
      return http.patch<T>(url, body, requestOptions);
    case 'DELETE':
      return http.delete<T>(url, requestOptions);
  }
}
