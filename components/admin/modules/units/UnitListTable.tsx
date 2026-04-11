'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MoreHorizontalIcon,
  PencilIcon,
  RulerDimensionLineIcon,
  Trash2Icon,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import TableListShell from '@/components/admin/layout/TableListShell';
import UnitFilters from '@/components/admin/modules/units/UnitFilters';
import UnitSheet from '@/components/admin/modules/units/UnitSheet';
import DeleteAlertDialog from '@/components/shared/dialogs/DeleteAlertDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ENDPOINTS } from '@/config/api/endpoints';
import { getUnitTypeFromRecord } from '@/domains/units/coerce-unit-type';
import { deleteUnit as deleteUnitService } from '@/domains/units/services';
import type { Unit } from '@/domains/units/types';
import { useTable } from '@/lib/table';

function unitTypeBadgeVariant(
  type: string | undefined,
): 'default' | 'secondary' | 'outline' {
  switch (type) {
    case 'mass':
      return 'default';
    case 'volume':
      return 'secondary';
    default:
      return 'outline';
  }
}

export default function UnitListTable() {
  const queryClient = useQueryClient();
  const [editUnit, setEditUnit] = useState<Unit | null>(null);

  const [deleteUnit, setDeleteUnit] = useState<Unit | null>(null);
  const { mutateAsync: confirmDelete, isPending: isDeleting } = useMutation({
    mutationFn: async (id: number) => {
      const response = await deleteUnitService(id);
      if (response.status === 'error') {
        throw new Error(response.message || 'Failed to delete unit.');
      }
    },
    onSuccess: () => {
      toast.success('Unit deleted successfully.');
      queryClient.invalidateQueries({
        queryKey: ['table', ENDPOINTS.ADMIN.MODULES.UNITS.LIST],
      });
    },
    onError: (error) => {
      toast.error(error.message ?? 'Failed to delete unit.');
    },
  });

  const handleDelete = async () => {
    if (!deleteUnit) return;
    try {
      await confirmDelete(deleteUnit.id);
      setDeleteUnit(null);
    } catch {
      // onError already toasts; swallow rejection so the click handler does not surface an unhandled promise
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

  const statusFilter = useMemo(() => {
    const v = controls.params.values.is_active;
    if (v === '1') return 'active' as const;
    if (v === '0') return 'inactive' as const;
    return 'all' as const;
  }, [controls.params.values.is_active]);

  const { query } = controls;
  const showSkeleton = query.isPending && !query.data;
  const errorMessage =
    query.isError && query.error instanceof Error
      ? query.error.message
      : 'Could not load units.';

  return (
    <>
      <TableListShell
        controls={controls}
        filters={
          <UnitFilters
            status={statusFilter}
            onStatusChange={(next) => {
              if (next === 'all') {
                controls.params.clear(['is_active']);
                return;
              }
              controls.params.set({
                is_active: next === 'active' ? '1' : '0',
              });
            }}
          />
        }
      >
        <Table className='min-w-120 table-fixed'>
          <TableHeader className='bg-muted/50 [&_tr]:border-border'>
            <TableRow className='border-border hover:bg-transparent'>
              <TableHead className='w-[10%]'>Name</TableHead>
              <TableHead className='w-[5%]'>Type</TableHead>
              <TableHead className='w-[5%]'>Status</TableHead>
              <TableHead className='w-[10%] text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {showSkeleton &&
              Array.from({ length: 3 }).map((_, row) => (
                <TableRow key={`skeleton-${row}`}>
                  {Array.from({ length: 4 }).map((_, col) => (
                    <TableCell key={col} className='py-3'>
                      <Skeleton className='h-8 w-full' />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {!showSkeleton && query.isError && (
              <TableRow>
                <TableCell
                  colSpan={4}
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
                <TableRow>
                  <TableCell colSpan={4} className='py-14'>
                    <div className='mx-auto flex max-w-md flex-col items-center justify-center text-center'>
                      <div className='bg-primary/10 text-primary mb-4 inline-flex size-12 items-center justify-center rounded-full'>
                        <RulerDimensionLineIcon className='size-6' />
                      </div>
                      <p className='text-foreground text-base font-semibold'>
                        No measurement units yet
                      </p>
                      <p className='text-muted-foreground mt-1 text-sm leading-relaxed'>
                        Units will be listed here once your team defines
                        standards for nutrition and wellness tracking.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}

            {!showSkeleton &&
              !query.isError &&
              query.data?.status === 'success' &&
              rows.map((unit) => {
                const resolvedType = getUnitTypeFromRecord(unit);
                return (
                  <TableRow key={unit.id} className='border-border/80'>
                    <TableCell className='min-w-0 py-2.5 align-top'>
                      <div className='min-w-0 pr-2'>
                        <p className='text-foreground truncate text-sm font-medium'>
                          {unit.name}
                        </p>
                        <p className='text-muted-foreground mt-0.5 text-xs'>
                          {unit.abbreviation}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className='py-2.5 align-middle'>
                      <Badge
                        variant={unitTypeBadgeVariant(resolvedType)}
                        className='font-normal capitalize'
                      >
                        {resolvedType ?? '—'}
                      </Badge>
                    </TableCell>
                    <TableCell className='py-2.5 align-middle'>
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium ${unit.is_active ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}
                      >
                        <span
                          className={`size-1.5 rounded-full ${unit.is_active ? 'bg-emerald-500' : 'bg-muted-foreground/40'}`}
                        />
                        {unit.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell className='py-2.5 pr-2 text-right align-middle'>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='size-8 cursor-pointer'
                          >
                            <MoreHorizontalIcon className='size-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem
                            className='flex cursor-pointer items-center gap-2'
                            onClick={() => setEditUnit(unit)}
                          >
                            <PencilIcon className='size-3.5' />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className='text-destructive focus:text-destructive flex cursor-pointer items-center gap-2'
                            onClick={() => setDeleteUnit(unit)}
                          >
                            <Trash2Icon className='size-3.5' />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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

      <DeleteAlertDialog
        open={!!deleteUnit}
        onOpenChange={(o) => {
          if (!o) setDeleteUnit(null);
        }}
        title='Delete Unit'
        description={
          <>
            Are you sure you want to delete{' '}
            <span className='text-foreground font-medium'>
              {deleteUnit?.name}
            </span>
            ? This action cannot be undone.
          </>
        }
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </>
  );
}
