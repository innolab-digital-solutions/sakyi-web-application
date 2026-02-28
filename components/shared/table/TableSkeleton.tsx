import { Skeleton } from '@/components/ui/skeleton';
import { TableCell, TableRow } from '@/components/ui/table';

type TableSkeletonProps = {
  rows: number;
  columns: number;
};

const TableSkeleton = ({ rows, columns }: TableSkeletonProps) => {
  const safeRows = Number.isFinite(rows) && rows > 0 ? rows : 1;
  const safeColumns = Number.isFinite(columns) && columns > 0 ? columns : 1;

  return (
    <>
      {Array.from({ length: safeRows }).map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {Array.from({ length: safeColumns }).map((_, colIndex) => (
            <TableCell key={colIndex}>
              <Skeleton className='h-4 bg-muted w-full' />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
};

export default TableSkeleton;
