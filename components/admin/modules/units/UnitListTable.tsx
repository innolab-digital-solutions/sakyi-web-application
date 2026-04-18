'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PencilIcon, Scale, Trash2Icon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import TableListShell from '@/components/admin/layout/TableListShell';
import RemoveMeasurementConfirmation from '@/components/admin/modules/units/RemoveMeasurementConfirmation';
import UnitFilters from '@/components/admin/modules/units/UnitFilters';
import UnitSheet from '@/components/admin/modules/units/UnitSheet';
import TableEmptyStateRow from '@/components/shared/table/TableEmptyStateRow';
import TableSkeletonRows from '@/components/shared/table/TableSkeletonRows';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import TableCellEmpty from '@/components/ui/table-cell-empty';
import { ENDPOINTS } from '@/config/api/endpoints';
import { getUnitTypeFromRecord } from '@/domains/units/coerce-unit-type';
import { deleteUnit as deleteUnitService } from '@/domains/units/services';
import type { Unit } from '@/domains/units/types';
import { useTable } from '@/lib/table';

const COLUMN_COUNT = 4;

const SKELETON_WIDTHS = ['w-40', 'w-24', 'w-28', 'w-44'] as const;

function formatTypeLabel(raw: string | undefined): string {
  if (!raw?.trim()) return '—';
  const t = raw.trim().toLowerCase();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export default function UnitListTable() {
  const queryClient = useQueryClient();
  const [editUnit, setEditUnit] = useState<Unit | null>(null);
  const [deleteUnit, setDeleteUnit] = useState<Unit | null>(null);

  const { mutateAsync: confirmDelete, isPending: isDeleting } = useMutation({
    mutationFn: async (id: number) => {
      const response = await deleteUnitService(id);
      if (response.status === 'error') {
        throw new Error(response.message || 'Failed to remove measurement.');
      }
    },
    onSuccess: () => {
      toast.success('The measurement was removed from the reference catalog.');
      queryClient.invalidateQueries({
        queryKey: ['table', ENDPOINTS.ADMIN.MODULES.UNITS.LIST],
      });
    },
    onError: (error) => {
      toast.error(error.message ?? 'Failed to remove measurement.');
    },
  });

  const handleDelete = async () => {
    if (!deleteUnit) return;
    try {
      await confirmDelete(deleteUnit.id);
      setDeleteUnit(null);
    } catch {
      // onError already toasts
    }
  };

  const { rows, controls } = useTable<Unit>(
    ENDPOINTS.ADMIN.MODULES.UNITS.LIST,
    {
      params: {
        sync: true,
        writeInitialToUrl: true,
      },
    },
  );

  const typeFilterParam = controls.params.values.type;

  const { query } = controls;
  const showSkeleton = query.isPending && !query.data;
  const errorMessage =
    query.isError && query.error instanceof Error
      ? query.error.message
      : 'Could not load measurements.';

  return (
    <>
      <TableListShell
        controls={controls}
        searchPlaceholder='Search name or abbreviation'
        filters={
          <UnitFilters
            typeFilter={typeFilterParam}
            onClearType={() => controls.params.clear(['type'])}
            onSetType={(type) => controls.params.set({ type })}
          />
        }
      >
        <Table className='w-full min-w-5xl'>
          <TableHeader className='bg-muted/50 [&_tr]:border-border'>
            <TableRow className='border-border hover:bg-transparent'>
              <TableHead>Name</TableHead>
              <TableHead>Abbreviation</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {showSkeleton && (
              <TableSkeletonRows
                rowCount={3}
                columnCount={COLUMN_COUNT}
                cellWidths={[...SKELETON_WIDTHS]}
              />
            )}

            {!showSkeleton && query.isError && (
              <TableRow>
                <TableCell
                  colSpan={COLUMN_COUNT}
                  className='text-destructive py-8 text-center text-sm'
                >
                  {errorMessage}
                </TableCell>
              </TableRow>
            )}

            {!showSkeleton &&
              !query.isError &&
              query.data?.status === 'success' &&
              rows.length === 0 && (
                <TableEmptyStateRow
                  colSpan={COLUMN_COUNT}
                  icon={Scale}
                  title='No Measurements Available'
                  description='Definitions you add will appear here for search and filtering. Use Add in the header to define mass, volume, time, and other scales your team relies on.'
                />
              )}

            {!showSkeleton &&
              !query.isError &&
              query.data?.status === 'success' &&
              rows.map((unit) => {
                const resolvedType = getUnitTypeFromRecord(unit);

                return (
                  <TableRow key={unit.id}>
                    <TableCell className='align-center whitespace-normal'>
                      <p className='text-foreground text-[13px] font-semibold'>
                        {unit.name?.trim() ? (
                          unit.name.trim()
                        ) : (
                          <TableCellEmpty label='Name not set' />
                        )}
                      </p>
                    </TableCell>

                    <TableCell className='text-foreground/80 align-center tabular-nums'>
                      {unit.abbreviation?.trim() ? (
                        unit.abbreviation.trim()
                      ) : (
                        <TableCellEmpty label='Not set' />
                      )}
                    </TableCell>

                    <TableCell className='text-foreground/80 align-center capitalize'>
                      {resolvedType ? (
                        formatTypeLabel(resolvedType)
                      ) : (
                        <TableCellEmpty label='Type not set' />
                      )}
                    </TableCell>

                    <TableCell className='align-center whitespace-nowrap'>
                      <div className='flex flex-nowrap items-center justify-start gap-2'>
                        <Button
                          type='button'
                          className='h-10 shrink-0 gap-1.5 rounded-md px-2.5 text-[13px]! font-semibold'
                          onClick={() => setEditUnit(unit)}
                        >
                          <PencilIcon className='size-3.5' />
                          Edit
                        </Button>
                        <Button
                          type='button'
                          variant='outline'
                          className='text-destructive hover:text-destructive border-destructive/35 bg-background hover:bg-destructive/10 h-10 shrink-0 cursor-pointer gap-1.5 rounded-md px-2.5 text-[13px]! font-semibold'
                          onClick={() => setDeleteUnit(unit)}
                        >
                          <Trash2Icon className='size-3.5' />
                          Remove
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableListShell>

      {editUnit && (
        <UnitSheet
          mode='edit'
          unit={editUnit}
          open={!!editUnit}
          onOpenChange={(o) => {
            if (!o) setEditUnit(null);
          }}
        />
      )}

      <RemoveMeasurementConfirmation
        open={!!deleteUnit}
        onOpenChange={(o) => {
          if (!o) setDeleteUnit(null);
        }}
        measurementName={deleteUnit?.name}
        isRemoving={isDeleting}
        onConfirm={handleDelete}
      />
    </>
  );
}
