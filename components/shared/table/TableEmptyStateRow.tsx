import type { LucideIcon } from 'lucide-react';

import { TableCell, TableRow } from '@/components/ui/table';

type TableEmptyStateRowProps = {
  colSpan: number;
  icon: LucideIcon;
  title: string;
  description: string;
};

export default function TableEmptyStateRow({
  colSpan,
  icon: Icon,
  title,
  description,
}: TableEmptyStateRowProps) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className='py-14'>
        <div className='mx-auto flex max-w-md flex-col items-center justify-center text-center'>
          <div className='bg-primary/10 text-primary mb-4 inline-flex size-12 items-center justify-center rounded-full'>
            <Icon className='size-6' />
          </div>
          <p className='text-foreground text-base font-semibold'>{title}</p>
          <p className='text-muted-foreground mt-1 text-sm leading-relaxed'>
            {description}
          </p>
        </div>
      </TableCell>
    </TableRow>
  );
}
