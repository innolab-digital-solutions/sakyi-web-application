'use client';

import { createContext, PropsWithChildren, useContext } from 'react';

import type { UseTableReturn } from '@/hooks/table';

type TableContextValue = UseTableReturn<unknown>;

const TableContext = createContext<TableContextValue | null>(null);

type TableProviderProps = PropsWithChildren<{
  value: TableContextValue;
}>;

export const TableProvider = ({ value, children }: TableProviderProps) => {
  return <TableContext.Provider value={value}>{children}</TableContext.Provider>;
};

export const useTableContext = (): TableContextValue => {
  const ctx = useContext(TableContext);

  if (!ctx) {
    throw new Error('useTableContext must be used within a TableProvider');
  }

  return ctx;
};

export default TableProvider;

