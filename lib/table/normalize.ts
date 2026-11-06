import type {
  TablePageData,
  TablePaginationMeta,
  TableQueryResponse,
} from './types';

/**
 * Normalizes table query responses into a consistent structure with rows and pagination meta.
 *
 * Handles the following cases:
 * - If the response is not successful, returns an empty rows array and null meta.
 * - If the response data is an array, returns the array as rows and includes pagination meta if present.
 * - If the response data is an object with a `data` array, extracts pagination and metadata details.
 * - Otherwise, returns empty rows and null meta.
 *
 * @template TItem - The type of the row items.
 * @param {TableQueryResponse<TItem>} response - The response object from the table query.
 * @returns {{ rows: TItem[]; meta: TablePaginationMeta | null }} The normalized rows and meta information.
 */
export const normalizeTableResponse = <TItem>(
  response: TableQueryResponse<TItem>,
): { rows: TItem[]; meta: TablePaginationMeta | null } => {
  if (response.status !== 'success') {
    return { rows: [], meta: null };
  }

  const payload = response.data as unknown;

  if (Array.isArray(payload)) {
    const pagination = response.meta?.pagination;
    if (pagination && typeof pagination === 'object') {
      return { rows: payload, meta: pagination as TablePaginationMeta };
    }
    return { rows: payload, meta: null };
  }

  if (
    payload &&
    typeof payload === 'object' &&
    'data' in payload &&
    Array.isArray((payload as TablePageData<TItem>).data)
  ) {
    const pageData = payload as TablePageData<TItem>;
    const { data: rows } = pageData;

    const meta: TablePaginationMeta = {
      current_page: pageData.current_page,
      per_page: pageData.per_page,
      total: pageData.total,
      last_page: pageData.last_page,
      from: pageData.from,
      to: pageData.to,
      has_more_pages: pageData.next_page_url != null,
      path: pageData.path,
      next_page_url: pageData.next_page_url,
      prev_page_url: pageData.prev_page_url,
    };

    return { rows, meta };
  }

  return { rows: [], meta: null };
};
