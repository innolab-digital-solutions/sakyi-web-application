'use client';

import { cn } from '@/lib/utils/styles';

type TableCellEmptyProps = {
  label: string;
  className?: string;
};

/**
 * Compact placeholder badge for empty table values.
 * Reuse across admin tables for consistent empty-state presentation.
 */
export default function TableCellEmpty({
  label,
  className,
}: TableCellEmptyProps) {
  return (
    <span
      className={cn(
        'border-foreground/20 bg-muted-foreground/8 text-foreground/70 wrap-break-word. inline-flex max-w-full items-center gap-1.5 rounded-md border border-dashed px-2.5 py-1 text-xs leading-tight font-semibold capitalize',
        className,
      )}
    >
      {label}
    </span>
  );
}
