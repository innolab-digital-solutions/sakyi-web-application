import { FileSearchIcon, type LucideIcon } from 'lucide-react';

import { TableCell, TableRow } from '@/components/ui/table';

type TableEmptyStateRowProps = {
  colSpan: number;
  icon?: LucideIcon;
  title: string;
  description: string;
};

export default function TableEmptyStateRow({
  colSpan,
  icon,
  title,
  description,
}: TableEmptyStateRowProps) {
  const Icon = icon ?? FileSearchIcon;
  return (
    <TableRow className='bg-muted/50! hover:bg-transparent'>
      <TableCell colSpan={colSpan} className='py-5 whitespace-normal'>
        <div className='mx-auto flex w-full max-w-2xl flex-col items-center justify-center overflow-hidden rounded-xl px-6 py-10 text-center'>
          <div className='bg-primary/12 text-primary ring-background border-primary/70 mb-4 inline-flex size-12 items-center justify-center rounded-md border border-dashed ring-4'>
            <Icon className='size-5' />
          </div>
          <p className='text-foreground text-sm font-semibold tracking-tight capitalize'>
            {title}
          </p>
          <p className='text-muted-foreground mt-2 max-w-xl text-[13px] leading-relaxed wrap-break-word whitespace-normal'>
            {description}
          </p>
        </div>
      </TableCell>
    </TableRow>
  );
}
