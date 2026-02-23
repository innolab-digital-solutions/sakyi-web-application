export const ENDPOINTS = {
  VERSION: 'https://api.sakyihealthandwellness.com/v1',
  DOMAIN: 'https://api.sakyihealthandwellness.com',
} as const;

export const DEFAULT_METHOD = 'GET' as const;

export const MESSAGES = {
  NETWORK_ERROR:
    'A network error occurred while attempting to reach the API. Please verify your internet connection or try again later.',
  INVALID_JSON: 'The server returned an invalid JSON response.',
  SUCCESS: 'The request was successfully processed.',
} as const;
