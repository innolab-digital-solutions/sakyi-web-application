import { Skeleton } from '@/components/ui/skeleton';
import { TableCell, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils/styles';

type TableSkeletonRowsProps = {
  rowCount?: number;
  columnCount: number;
  /** Width classes for each column skeleton, e.g. ['w-18', 'w-32', ...] */
  cellWidths?: readonly string[];
  cellClassName?: string;
  skeletonClassName?: string;
};

export default function TableSkeletonRows({
  rowCount = 3,
  columnCount,
  cellWidths,
  cellClassName,
  skeletonClassName,
}: TableSkeletonRowsProps) {
  return Array.from({ length: rowCount }).map((_, row) => (
    <TableRow key={`skeleton-${row}`}>
      {Array.from({ length: columnCount }).map((__, col) => (
        <TableCell key={col} className={cn('py-3.5', cellClassName)}>
          <Skeleton
            className={cn('h-8 w-full', cellWidths?.[col], skeletonClassName)}
          />
        </TableCell>
      ))}
    </TableRow>
  ));
}
