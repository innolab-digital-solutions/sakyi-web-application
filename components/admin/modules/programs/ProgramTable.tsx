'use client';

import Image from 'next/image';
import Link from 'next/link';

import TableLayout from '@/components/admin/layouts/TableLayout';
import ProgramFilters from '@/components/admin/modules/programs/ProgramFilters';
import TableSkeleton from '@/components/shared/table/TableSkeleton';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import ENDPOINTS from '@/config/endpoints';
import PATHS from '@/config/paths';
import { useTable } from '@/hooks/table';
import type { Program } from '@/types/admin/program';

const formatPrice = (cents: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);

const statusBadgeClass = (status: string): string => {
  switch (status) {
    case 'active':
    case 'published':
      return 'rounded bg-green-100 px-2 py-1 text-xs font-bold text-green-800';
    case 'draft':
      return 'rounded bg-amber-100 px-2 py-1 text-xs font-bold text-amber-800';
    case 'archived':
      return 'rounded bg-gray-100 px-2 py-1 text-xs font-bold text-gray-600';
    default:
      return 'rounded bg-gray-100 px-2 py-1 text-xs font-bold text-gray-500';
  }
};

const getPrimaryGoalName = (program: Program): string => {
  if (!program.goals || program.goals.length === 0) {
    return '—';
  }

  return program.goals[0]?.name ?? '—';
};

const parsePriceCents = (price: string): number | null => {
  const numeric = Number.parseInt(price.replace(/[^\d]/g, ''), 10);
  return Number.isNaN(numeric) ? null : numeric;
};

/**
 * Admin programs list table with URL-synced pagination and search.
 *
 * Fetches program rows via useTable and the admin programs endpoint, and renders
 * columns for title, overview, goal, price, duration, status, and actions.
 */
const ProgramTable = () => {
  const { rows, controls } = useTable<Program>(ENDPOINTS.ADMIN.PROGRAMS.LIST, {
    syncWithUrl: true,
    params: {
      lang: 'en',
    },
  });

  const isTableLoading =
    controls.isLoading ||
    controls.query.isFetching ||
    !controls.pagination.meta;

  return (
    <TableLayout filters={<ProgramFilters />} controls={controls}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Program</TableHead>
            <TableHead>Overview</TableHead>
            <TableHead>Goal</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isTableLoading ? (
            <TableSkeleton rows={controls.perPage.value} columns={7} />
          ) : (
            rows.map((program) => (
              <TableRow key={program.id}>
                <TableCell>
                  <div className='flex items-center gap-2'>
                    {program.thumbnail ? (
                      <Image
                        src={program.thumbnail}
                        alt={program.title}
                        width={32}
                        height={32}
                        className='bg-muted shrink-0 rounded-md'
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <div className='bg-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-xs font-medium uppercase'>
                        {program.title.charAt(0) ?? '?'}
                      </div>
                    )}
                    <span>{program.title ?? 'Untitled program'}</span>
                  </div>
                </TableCell>
                <TableCell className='max-w-48 truncate'>
                  {program.excerpt ?? '—'}
                </TableCell>
                <TableCell>{getPrimaryGoalName(program)}</TableCell>
                <TableCell>
                  {program.price
                    ? (() => {
                        const cents = parsePriceCents(program.price);
                        return cents != null ? formatPrice(cents) : '—';
                      })()
                    : '—'}
                </TableCell>
                <TableCell>{program.duration}</TableCell>
                <TableCell>
                  <span className={statusBadgeClass(program.status)}>
                    {program.status}
                  </span>
                </TableCell>
                <TableCell>
                  <Button asChild size='sm' variant='outline'>
                    <Link href={`${PATHS.ADMIN.PROGRAMS}/${program.id}`}>
                      View
                    </Link>
                  </Button>
                  <Button asChild size='sm' variant='outline' className='ml-2'>
                    <Link href={`${PATHS.ADMIN.PROGRAMS}/${program.id}/edit`}>
                      Edit
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableLayout>
  );
};

export default ProgramTable;
