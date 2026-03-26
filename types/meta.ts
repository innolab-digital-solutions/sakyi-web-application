/**
 * Standard pagination details returned by the backend API endpoints.
 *
 * Represents essential information for paginated resources, supporting
 * navigation between pages and UI display metadata.
 *
 * @property current_page - The currently returned page number (1-based).
 * @property per_page - Number of items returned per page.
 * @property total - Total number of items matching the query.
 * @property last_page - The last available page number.
 * @property from - The index of the first item in this page (1-based), or null if empty.
 * @property to - The index of the last item in this page (1-based), or null if empty.
 * @property has_more_pages - True if additional pages exist after this one.
 * @property path - Base URL path for the paginated resource.
 * @property next_page_url - URL for the next page, or null if at the last page.
 * @property prev_page_url - URL for the previous page, or null if at the first page.
 */
export type Pagination = {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number | null;
  to: number | null;
  has_more_pages: boolean;
  path: string;
  next_page_url: string | null;
  prev_page_url: string | null;
};

/**
 * Metadata included with most API responses.
 *
 * Always contains the response version for traceability. May include
 * pagination details for endpoints returning lists of resources.
 *
 * @property version - Semantic version of the API response shape.
 * @property pagination - Pagination details if the resource is paginated.
 */
export type Meta = {
  version: string;
  pagination?: Pagination;
};
