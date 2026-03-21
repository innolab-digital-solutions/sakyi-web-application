export const API_UNAUTHORIZED_EVENT = 'sakyi:api-unauthorized';

/** The URL to fetch the CSRF cookie. */
export const CSRF_COOKIE_ENDPOINT = '/sanctum/csrf-cookie';

/** The name of the CSRF cookie. */
export const COOKIE_NAME = 'XSRF-TOKEN=';

/** The default HTTP method used by the API client when none is specified. */
export const DEFAULT_METHOD = 'GET' as const;

/** Standard user-facing messages for API client error and success scenarios. */
export const MESSAGES = {
  ABSOLUTE_URL_ERROR:
    'API client does not accept absolute URLs. Use a relative path.',
  DEFAULT_ERROR:
    'Sorry, something went wrong. Please try again or contact support if the issue persists.',
  NETWORK_ERROR:
    'A network error occurred while trying to contact the API. Please check your internet connection and try again.',
  CSRF_COOKIE_FAILED:
    'Unable to obtain a secure session cookie. Please check your connection or try again.',
  INVALID_JSON:
    'We were unable to process the server response due to invalid JSON. Please try again, or contact support if this persists.',
  SUCCESS: 'The request was successfully processed.',
} as const;
