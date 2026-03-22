import { API_UNAUTHORIZED_EVENT } from './constants';

/**
 * Dispatches a browser-only custom event indicating the API session is no longer valid (typically HTTP 401).
 *
 * Intended for use in API client/infrastructure code only—never import React.
 * The event can be listened for by any part of the application (e.g., AuthProvider) to trigger session logout flows.
 *
 * @param {string} [reason] - Optional reason or message explaining why authorization failed.
 * @returns {void}
 */
export const dispatchApiUnauthorized = (reason?: string): void => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent(API_UNAUTHORIZED_EVENT, { detail: { reason } }),
  );
};

export { API_UNAUTHORIZED_EVENT };
