'use client';

import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function ProgramListTable() {
  return (
    <Card className='border-border bg-card max-w-full min-w-0 border shadow-sm'>
      <CardContent className='min-w-0 space-y-5'>
        <div className='border-border bg-card min-w-0 overflow-hidden rounded-lg border shadow-xs'>
          <div className='min-w-0 overflow-x-auto'>
            <Table className='min-w-180 table-fixed'>
              <TableHeader className='bg-muted/50 [&_tr]:border-border'>
                <TableRow className='border-border hover:bg-transparent'>
                  <TableHead className='w-[34%] py-3 text-xs font-semibold normal-case'>
                    Program
                  </TableHead>
                  <TableHead className='w-[11%] py-3 text-xs font-semibold normal-case'>
                    Status
                  </TableHead>
                  <TableHead className='w-[18%] py-3 text-xs font-semibold normal-case'>
                    Track
                  </TableHead>
                  <TableHead className='w-[14%] py-3 text-xs font-semibold normal-case'>
                    Created
                  </TableHead>
                  <TableHead className='w-[11%] py-3 text-right text-xs font-semibold normal-case'>
                    Enrolled
                  </TableHead>
                  <TableHead className='w-[12%] py-3 pr-3 text-right text-xs font-semibold normal-case'>
                    <span className='sr-only'>Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody></TableBody>
            </Table>
          </div>
        </div>

        {/* Static pagination mock (not interactive) */}
        <div
          className='border-border pointer-events-none flex flex-col gap-4 border-t pt-4 select-none sm:flex-row sm:items-center sm:justify-between'
          aria-hidden
        >
          <div className='flex flex-wrap items-center gap-x-5 gap-y-2'>
            <div className='flex items-center gap-2.5'>
              <span className='text-foreground text-xs font-medium whitespace-nowrap'>
                Rows per page
              </span>
              <Select value='10' disabled>
                <SelectTrigger
                  size='sm'
                  className='border-border bg-background h-9 w-17 opacity-100 shadow-none'
                  aria-label='Rows per page (demo)'
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='10'>10</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <span className='text-muted-foreground text-xs tabular-nums'>
              1–8 of 8
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// function ProgramRow({ row }: { row: AdminProgramListRow }) {
//   return (
//     <TableRow className='border-border/80'>
//       <TableCell className='min-w-0 py-2.5 align-top'>
//         <div className='min-w-0 pr-2'>
//           <p className='text-foreground truncate text-sm font-medium'>
//             {row.nameEn}
//           </p>
//           <p
//             className='text-muted-foreground mt-0.5 line-clamp-2 text-xs leading-snug'
//             lang='my'
//             title={row.nameMy}
//           >
//             {row.nameMy.trim()}
//           </p>
//         </div>
//       </TableCell>
//       <TableCell className='py-2.5 align-top'>
//         <Badge variant={statusBadgeVariant(row.status)} className='font-normal'>
//           {STATUS_LABEL[row.status]}
//         </Badge>
//       </TableCell>
//       <TableCell className='min-w-0 py-2.5 align-top'>
//         <p className='truncate text-sm'>{row.trackEn}</p>
//         <p
//           className='text-muted-foreground mt-0.5 truncate text-xs'
//           lang='my'
//           title={row.trackMy}
//         >
//           {row.trackMy}
//         </p>
//       </TableCell>
//       <TableCell className='py-2.5 align-top'>
//         <span className='text-muted-foreground inline-flex items-center gap-1 text-xs'>
//           <CalendarIcon className='size-3 shrink-0 opacity-70' />
//           <span className='tabular-nums'>{formatCreatedAt(row.createdAt)}</span>
//         </span>
//       </TableCell>
//       <TableCell className='py-2.5 text-right align-top tabular-nums'>
//         <span className='text-muted-foreground inline-flex items-center justify-end gap-1 text-sm'>
//           <UsersIcon className='size-3 shrink-0 opacity-70' />
//           {row.enrolledCount}
//         </span>
//       </TableCell>
//       <TableCell className='py-2.5 pr-2 text-right align-top'>
//         <Button
//           type='button'
//           variant='ghost'
//           size='icon-sm'
//           tabIndex={-1}
//           className='text-muted-foreground pointer-events-none size-8'
//           aria-hidden
//         >
//           <MoreHorizontalIcon className='size-4' />
//         </Button>
//       </TableCell>
//     </TableRow>
//   );
// }
