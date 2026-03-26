import type { TableParamKeys } from './types';

/**
 * Defines URL parameter keys for table state management.
 *
 * @property {string} page - The query parameter for current page number.
 * @property {string} perPage - The query parameter for results per page.
 * @property {string} search - The query parameter for search input.
 */
export const TABLE_PARAM_KEYS: TableParamKeys = {
  page: 'page',
  perPage: 'per_page',
  search: 'search',
};

/**
 * The default debounce time (in milliseconds) used for table search input.
 * Used to reduce the rate of search-triggering requests as a user types.
 */
export const TABLE_DEFAULT_SEARCH_DEBOUNCE_MS = 300;
