import type {
  TablePageData,
  TablePaginationMeta,
  TableQueryResponse,
} from './types';

/**
 * Normalizes Laravel-style list responses:
 * - `data: T[]` with `meta.pagination` (this project’s API)
 * - `data: { data: T[], current_page, ... }` (embedded paginator)
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
    const { data: rows, ...meta } = pageData;
    return { rows, meta: meta as unknown as TablePaginationMeta };
  }

  return { rows: [], meta: null };
};

