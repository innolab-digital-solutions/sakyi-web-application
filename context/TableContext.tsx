'use client';

import { createContext, PropsWithChildren, useContext } from 'react';

import type { UseTableReturn } from '@/hooks/table';

type TableContextValue = UseTableReturn<unknown>;

const TableContext = createContext<TableContextValue | null>(null);

type TableProviderProps = PropsWithChildren<{
  value: TableContextValue;
}>;

/**
 * Provides table state and controls (rows, pagination, search, loading) to descendant components.
 *
 * Forwards the given `UseTableReturn` value into React context so that table layouts,
 * filters, and row cells can access shared state without prop drilling.
 *
 * @param props - `value`: result of `useTable()`; `children`: subtree that may call `useTableContext()`.
 * @returns Provider wrapping children.
 */
export const TableProvider = ({ value, children }: TableProviderProps) => {
  return <TableContext.Provider value={value}>{children}</TableContext.Provider>;
};

/**
 * Consumes the table context provided by the nearest `TableProvider`.
 *
 * Use within table modules (e.g. filters, layout, custom cells) to access rows,
 * controls (search, perPage, pagination), and loading state.
 *
 * @returns The current table context value (same shape as `UseTableReturn`).
 * @throws Error when used outside a `TableProvider`.
 */
export const useTableContext = (): TableContextValue => {
  const ctx = useContext(TableContext);

  if (!ctx) {
    throw new Error('useTableContext must be used within a TableProvider');
  }

  return ctx;
};

export default TableProvider;

