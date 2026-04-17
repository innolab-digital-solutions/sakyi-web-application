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
    <TableRow className='hover:bg-transparent bg-muted/50!'>
      <TableCell colSpan={colSpan} className='py-5 whitespace-normal'>
        <div className=' mx-auto flex w-full max-w-2xl flex-col items-center justify-center overflow-hidden rounded-xl px-6 py-10 text-center'>
          <div className='bg-primary/12 text-primary ring-background mb-4 inline-flex size-12 items-center justify-center rounded-md border border-dashed border-primary/70 ring-4'>
            <Icon className='size-5' />
          </div>
          <p className='text-foreground text-sm capitalize font-semibold tracking-tight'>
            {title}
          </p>
          <p className='text-muted-foreground mt-2 max-w-xl whitespace-normal text-[13px] leading-relaxed wrap-break-word'>
            {description}
          </p>
        </div>
      </TableCell>
    </TableRow>
  );
}
