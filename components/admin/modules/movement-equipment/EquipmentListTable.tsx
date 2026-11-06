'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SquarePenIcon, Trash2Icon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import TableListShell from '@/components/admin/layout/TableListShell';
import MovementEquipmentSheet from '@/components/admin/modules/movement-equipment/EquipmentSheet';
import MovementEquipmentRemovalBlockedAlert from '@/components/admin/modules/movement-equipment/MovementEquipmentRemovalBlockedAlert';
import RemoveEquipmentConfirmation from '@/components/admin/modules/movement-equipment/RemoveEquipmentConfirmation';
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
import { LOOKUP_ENDPOINTS } from '@/config/api/endpoints/lookup';
import { deleteMovementEquipment } from '@/domains/movement-equipment/services';
import type { MovementEquipment } from '@/domains/movement-equipment/types';
import { useTable } from '@/lib/table';

const COLUMN_COUNT = 4;

const SKELETON_WIDTHS = ['w-72', 'w-40', 'w-40', 'w-44'] as const;

export default function MovementEquipmentListTable() {
  const queryClient = useQueryClient();
  const [editEquipment, setEditEquipment] = useState<MovementEquipment | null>(
    null,
  );
  const [deleteEquipment, setDeleteEquipment] =
    useState<MovementEquipment | null>(null);
  const [blockedDeleteEquipment, setBlockedDeleteEquipment] =
    useState<MovementEquipment | null>(null);

  const { mutateAsync: confirmDelete, isPending: isDeleting } = useMutation({
    mutationFn: async (id: number) => {
      const response = await deleteMovementEquipment(id);
      if (response.status === 'error') {
        throw new Error(response.message || 'Failed to remove equipment.');
      }
    },
    onSuccess: () => {
      toast.success('The equipment has been removed successfully.');
      queryClient.invalidateQueries({
        queryKey: ['table', ENDPOINTS.ADMIN.MODULES.MOVEMENT_EQUIPMENT.LIST],
      });
      queryClient.invalidateQueries({
        queryKey: ['lookup', LOOKUP_ENDPOINTS.MOVEMENT_EQUIPMENT],
      });
    },
    onError: (error) => {
      toast.error(error.message ?? 'Failed to remove equipment.');
    },
  });

  const handleDelete = async () => {
    if (!deleteEquipment) return;
    try {
      await confirmDelete(deleteEquipment.id);
      setDeleteEquipment(null);
    } catch {
      // onError already toasts
    }
  };

  const handleDeleteClick = (item: MovementEquipment) => {
    if (item.actions.deletable) {
      setDeleteEquipment(item);
      return;
    }
    setBlockedDeleteEquipment(item);
  };

  const { rows, controls } = useTable<MovementEquipment>(
    ENDPOINTS.ADMIN.MODULES.MOVEMENT_EQUIPMENT.LIST,
    {
      params: {
        sync: true,
        writeInitialToUrl: true,
      },
    },
  );

  const { query } = controls;
  const showSkeleton = query.isPending && !query.data;
  const errorMessage =
    query.isError && query.error instanceof Error
      ? query.error.message
      : 'Could not load equipment.';

  return (
    <>
      <TableListShell controls={controls} searchPlaceholder='Search ...'>
        <Table className='w-full min-w-2xl'>
          <TableHeader className='bg-muted/50 [&_tr]:border-border'>
            <TableRow className='border-border hover:bg-transparent'>
              <TableHead>Equipment</TableHead>
              <TableHead>Equipment Type</TableHead>
              <TableHead>Training Section</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {showSkeleton && (
              <TableSkeletonRows
                rowCount={15}
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
                  title='No Equipment Found'
                  description='No equipment found. It’s possible none exist yet, or your filters may be hiding results. Adjust your filters or check back later.'
                />
              )}

            {!showSkeleton &&
              !query.isError &&
              query.data?.status === 'success' &&
              rows.map((item) => (
                <TableRow key={item.id} className='border-border'>
                  <TableCell className='align-center whitespace-normal'>
                    <p className='text-foreground text-[13px] font-semibold'>
                      {item.name?.trim() ? (
                        item.name.trim()
                      ) : (
                        <TableCellEmpty label='Name not set' />
                      )}
                    </p>
                  </TableCell>
                  <TableCell className='align-center whitespace-normal'>
                    <p className='text-foreground text-[13px] font-medium'>
                      {item.equipment_type?.trim() ? (
                        item.equipment_type.trim()
                      ) : (
                        <TableCellEmpty label='Type not set' />
                      )}
                    </p>
                  </TableCell>
                  <TableCell className='align-center whitespace-normal'>
                    <p className='text-foreground text-[13px] font-medium'>
                      {item.training_section?.trim() ? (
                        item.training_section.trim()
                      ) : (
                        <TableCellEmpty label='Section not set' />
                      )}
                    </p>
                  </TableCell>
                  <TableCell className='align-center whitespace-nowrap'>
                    <div className='flex flex-nowrap items-center justify-start gap-2'>
                      <Button
                        type='button'
                        variant='outline'
                        className='text-foreground bg-background hover:bg-muted h-9 shrink-0 gap-1.5 rounded-md border-neutral-300 px-2.5 text-[13px]! font-semibold'
                        onClick={() => setEditEquipment(item)}
                      >
                        <SquarePenIcon className='size-3.5' />
                        Edit
                      </Button>
                      <Button
                        type='button'
                        variant='outline'
                        className='text-destructive hover:text-destructive border-destructive/35 bg-background hover:bg-destructive/10 h-9 shrink-0 cursor-pointer gap-1.5 rounded-md px-2.5 text-[13px]! font-semibold'
                        onClick={() => handleDeleteClick(item)}
                      >
                        <Trash2Icon className='size-3.5' />
                        Remove
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableListShell>

      {editEquipment && (
        <MovementEquipmentSheet
          mode='edit'
          equipment={editEquipment}
          open={!!editEquipment}
          onOpenChange={(o) => {
            if (!o) setEditEquipment(null);
          }}
        />
      )}

      <RemoveEquipmentConfirmation
        open={!!deleteEquipment}
        onOpenChange={(o) => {
          if (!o) setDeleteEquipment(null);
        }}
        equipmentName={deleteEquipment?.name}
        isRemoving={isDeleting}
        onConfirm={handleDelete}
      />
      <MovementEquipmentRemovalBlockedAlert
        open={!!blockedDeleteEquipment}
        onOpenChange={(o) => {
          if (!o) setBlockedDeleteEquipment(null);
        }}
        equipmentName={blockedDeleteEquipment?.name}
        reason={
          blockedDeleteEquipment?.actions.delete_block_reason ?? undefined
        }
      />
    </>
  );
}
