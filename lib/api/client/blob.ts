import { parseFilenameFromContentDisposition } from '@/lib/downloads/browserFileDownload';

import { buildRequestHeaders, buildVersionedEndpoint } from './builders';
import { MESSAGES } from './constants';
import { ApiClientError } from './errors';
import { dispatchApiUnauthorized } from './events';
import type { ApiError as ApiErrorPayload, ReadOptions } from './types';

export type BlobDownloadResult = {
  blob: Blob;
  filename: string | null;
  contentType: string | null;
};

/**
 * Resolves a user-facing error message for a failed binary download.
 *
 * Prefers the backend JSON `message` when present; otherwise maps common
 * HTTP statuses to stable admin copy (period-report PDF download, etc.).
 */
async function resolveDownloadErrorMessage(
  response: Response,
): Promise<string> {
  try {
    const payload = (await response.json()) as Partial<ApiErrorPayload>;
    const message = payload.message?.trim();
    if (message) return message;
  } catch {
    // Non-JSON error body — fall through to status-based copy.
  }

  if (response.status === 404) return 'Report not found.';
  if (response.status === 403) {
    return 'You do not have access to download this report.';
  }
  if (response.status === 401) {
    return 'Your session has expired. Please sign in again.';
  }
  if (response.status >= 500) {
    return 'Could not generate PDF. Try again.';
  }

  return response.statusText?.trim() || MESSAGES.DEFAULT_ERROR;
}

/**
 * Performs an authenticated GET that returns raw binary content (e.g. PDF).
 *
 * Uses the same Sanctum cookie session and header conventions as the JSON
 * API client. On failure, throws {@link ApiClientError} with a usable message.
 * Success does **not** use the JSON envelope — the body is the file bytes.
 *
 * @param endpoint - Relative API path (not an absolute URL).
 * @param options - Optional read options (cache, headers, etc.). Body is omitted.
 * @returns Blob plus optional filename from Content-Disposition.
 *
 * @throws {ApiClientError} On network failure or non-OK HTTP status.
 */
export async function fetchBlob(
  endpoint: string,
  options: ReadOptions = {},
): Promise<BlobDownloadResult> {
  const { cache = 'no-store', next, signal } = options;

  const url = buildVersionedEndpoint(endpoint);
  const headers = buildRequestHeaders('GET', options);

  let response: Response;

  try {
    response = await fetch(url, {
      method: 'GET',
      headers,
      credentials: 'include',
      cache,
      ...(next !== undefined && { next }),
      ...(signal !== undefined && { signal }),
    });
  } catch (error) {
    throw new ApiClientError(MESSAGES.NETWORK_ERROR, 0, {
      network: [String(error)],
    });
  }

  if (!response.ok) {
    const message = await resolveDownloadErrorMessage(response);
    if (response.status === 401 && typeof window !== 'undefined') {
      dispatchApiUnauthorized(message);
    }
    throw new ApiClientError(message, response.status);
  }

  const blob = await response.blob();
  const disposition = response.headers.get('Content-Disposition');
  const filename = parseFilenameFromContentDisposition(disposition);
  const contentType = response.headers.get('Content-Type');

  return { blob, filename, contentType };
}
