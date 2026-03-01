'use client';

import Image from 'next/image';

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
import { useTable } from '@/hooks/table';
import type { Program } from '@/types/admin/programs';

/**
 * Admin programs list table with URL-synced pagination and search.
 *
 * Fetches program rows via useTable and the admin programs endpoint, and renders
 * columns for name, description, price, enrollments, duration, status, and actions.
 * Use on the admin programs page.
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
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Enrollments</TableHead>
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
                  <Image
                    src={program.picture}
                    alt={program.name}
                    width={32}
                    height={32}
                    className='bg-muted shrink-0 rounded-md'
                    style={{ objectFit: 'cover' }}
                  />
                  <span>{program.name}</span>
                </TableCell>
                <TableCell>{program.description}</TableCell>
                <TableCell>{program.price}</TableCell>
                <TableCell>{program.enrollments}</TableCell>
                <TableCell>{program.duration}</TableCell>
                <TableCell>
                  <span
                    className={
                      program.status === 'active'
                        ? 'rounded bg-green-100 px-2 py-1 text-xs font-bold text-green-800'
                        : 'rounded bg-gray-100 px-2 py-1 text-xs font-bold text-gray-500'
                    }
                  >
                    {program.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </TableCell>
                <TableCell>
                  <Button size='sm' variant='outline'>
                    View
                  </Button>
                  <Button size='sm' variant='outline' className='ml-2'>
                    Edit
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
