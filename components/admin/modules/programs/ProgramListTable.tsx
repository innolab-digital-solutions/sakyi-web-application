'use client';

import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { CalendarIcon, PencilIcon, UsersIcon } from 'lucide-react';
import Link from 'next/link';

import TableListWrapper from '@/components/admin/layout/TableListWrapper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ROUTES } from '@/config/routes';
import { STATUS } from '@/domains/programs/constants';
import { getPrograms } from '@/domains/programs/services/admin.service';
import type { Program } from '@/domains/programs/types/admin';

const PROGRAM_STATUS_LABEL: Record<Program['status'], string> = {
  [STATUS.DRAFT]: 'Draft',
  [STATUS.PUBLISHED]: 'Published',
  [STATUS.ARCHIVED]: 'Archived',
  [STATUS.HIDDEN]: 'Hidden',
};

function programStatusBadgeVariant(
  status: Program['status'],
): 'default' | 'secondary' | 'outline' {
  switch (status) {
    case STATUS.PUBLISHED:
      return 'default';
    case STATUS.DRAFT:
    case STATUS.HIDDEN:
      return 'secondary';
    case STATUS.ARCHIVED:
      return 'outline';
    default:
      return 'outline';
  }
}

function formatCreatedAt(iso: string): string {
  try {
    return format(parseISO(iso), 'MMM d, yyyy');
  } catch {
    try {
      return format(new Date(iso), 'MMM d, yyyy');
    } catch {
      return iso;
    }
  }
}

/** Track column: duration (wellness “track” length), else goal names, else em dash. */
function getTrackLabel(program: Program): string {
  const duration = program.duration?.trim();
  if (duration) return duration;

  const goals = program.goals;
  if (goals?.length) {
    return goals
      .slice(0, 2)
      .map((g) => g.name)
      .join(', ');
  }

  return '—';
}

function formatEnrollmentCount(count: number | undefined): string {
  if (count == null || Number.isNaN(count)) return '—';
  return count.toLocaleString();
}

export default function ProgramListTable() {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['programs'],
    queryFn: () => getPrograms(),
  });

  const programs = data?.status === 'success' ? data.data : undefined;
  const errorMessage =
    data?.status === 'error'
      ? data.message
      : isError && error instanceof Error
        ? error.message
        : 'Could not load programs.';

  return (
    <TableListWrapper>
      <Table className='min-w-180 table-fixed'>
        <TableHeader className='bg-muted/50 [&_tr]:border-border'>
          <TableRow className='border-border hover:bg-transparent'>
            <TableHead className='w-[28%]'>Program</TableHead>
            <TableHead className='w-[12%]'>Status</TableHead>
            <TableHead className='w-[18%]'>Track</TableHead>
            <TableHead className='w-[14%]'>Created</TableHead>
            <TableHead className='w-[12%] text-right'>Enrolled</TableHead>
            <TableHead className='w-[16%] text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isPending &&
            Array.from({ length: 3 }).map((_, row) => (
              <TableRow key={`skeleton-${row}`}>
                {Array.from({ length: 6 }).map((_, col) => (
                  <TableCell key={col} className='py-3'>
                    <Skeleton className='h-8 w-full' />
                  </TableCell>
                ))}
              </TableRow>
            ))}

          {!isPending && (data?.status === 'error' || isError) && (
            <TableRow>
              <TableCell
                colSpan={6}
                className='text-destructive py-8 text-center text-sm'
              >
                {errorMessage}
              </TableCell>
            </TableRow>
          )}

          {!isPending &&
            data?.status === 'success' &&
            programs?.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className='text-muted-foreground py-10 text-center text-sm'
                >
                  No programs yet. Create one to get started.
                </TableCell>
              </TableRow>
            )}

          {!isPending &&
            data?.status === 'success' &&
            programs?.map((program) => (
              <TableRow key={program.id} className='border-border/80'>
                <TableCell className='min-w-0 py-2.5 align-top'>
                  <div className='min-w-0 pr-2'>
                    <p className='text-foreground truncate text-sm font-medium'>
                      {program.title}
                    </p>
                    {program.tagline?.trim() ? (
                      <p className='text-muted-foreground mt-0.5 line-clamp-2 text-xs leading-snug'>
                        {program.tagline.trim()}
                      </p>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell className='py-2.5 align-top'>
                  <Badge
                    variant={programStatusBadgeVariant(program.status)}
                    className='font-normal'
                  >
                    {PROGRAM_STATUS_LABEL[program.status] ?? program.status}
                  </Badge>
                </TableCell>
                <TableCell className='min-w-0 py-2.5 align-top'>
                  <p className='truncate text-sm' title={getTrackLabel(program)}>
                    {getTrackLabel(program)}
                  </p>
                </TableCell>
                <TableCell className='py-2.5 align-top'>
                  <span className='text-muted-foreground inline-flex items-center gap-1 text-xs'>
                    <CalendarIcon className='size-3 shrink-0 opacity-70' />
                    <span className='tabular-nums'>
                      {formatCreatedAt(program.timestamps.created_at)}
                    </span>
                  </span>
                </TableCell>
                <TableCell className='py-2.5 text-right align-top tabular-nums'>
                  <span className='text-muted-foreground inline-flex items-center justify-end gap-1 text-sm'>
                    <UsersIcon className='size-3 shrink-0 opacity-70' />
                    {formatEnrollmentCount(program.enrolled_count)}
                  </span>
                </TableCell>
                <TableCell className='py-2.5 pr-2 text-right align-top'>
                  <Button variant='ghost' size='sm' className='h-8 gap-1' asChild>
                    <Link
                      href={ROUTES.ADMIN.MODULES.PROGRAMS.EDIT(
                        String(program.id),
                      )}
                    >
                      <PencilIcon className='size-3.5' />
                      Edit
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableListWrapper>
  );
}
