'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BeakerIcon,
  Clock3Icon,
  FlameIcon,
  HashIcon,
  RulerIcon,
  SquarePenIcon,
  Trash2Icon,
  WeightIcon,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import TableListShell from '@/components/admin/layout/TableListShell';
import RemoveMeasurementConfirmation from '@/components/admin/modules/units/RemoveMeasurementConfirmation';
import UnitFilters from '@/components/admin/modules/units/UnitFilters';
import UnitRemovalBlockedAlert from '@/components/admin/modules/units/UnitRemovalBlockedAlert';
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
import { UNIT_TYPE } from '@/domains/units/constants';
import { deleteUnit as deleteUnitService } from '@/domains/units/services';
import type { Unit } from '@/domains/units/types';
import { useTable } from '@/lib/table';

const COLUMN_COUNT = 4;

const SKELETON_WIDTHS = ['w-40', 'w-24', 'w-28', 'w-44'] as const;
type UnitTypeValue = (typeof UNIT_TYPE)[keyof typeof UNIT_TYPE];
const UNIT_TYPE_VALUES = Object.values(UNIT_TYPE) as readonly UnitTypeValue[];

function formatTypeLabel(raw: string | undefined): string {
  if (!raw?.trim()) return '—';
  const t = raw.trim().toLowerCase();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function isUnitTypeValue(value: string): value is UnitTypeValue {
  return UNIT_TYPE_VALUES.includes(value as UnitTypeValue);
}

const UNIT_TYPE_BADGE_STYLES: Record<
  UnitTypeValue,
  {
    icon: React.ComponentType<{ className?: string }>;
    className: string;
  }
> = {
  [UNIT_TYPE.VOLUME]: {
    icon: BeakerIcon,
    className:
      'border-sky-300/80 bg-sky-50 text-sky-800 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-200',
  },
  [UNIT_TYPE.MASS]: {
    icon: WeightIcon,
    className:
      'border-purple-300/80 bg-purple-50 text-purple-800 dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-200',
  },
  [UNIT_TYPE.COUNT]: {
    icon: HashIcon,
    className:
      'border-indigo-300/80 bg-indigo-50 text-indigo-800 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-200',
  },
  [UNIT_TYPE.LENGTH]: {
    icon: RulerIcon,
    className:
      'border-emerald-300/80 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200',
  },
  [UNIT_TYPE.TIME]: {
    icon: Clock3Icon,
    className:
      'border-amber-300/80 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200',
  },
  [UNIT_TYPE.ENERGY]: {
    icon: FlameIcon,
    className:
      'border-rose-300/80 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200',
  },
};

export default function UnitListTable() {
  const queryClient = useQueryClient();
  const [editUnit, setEditUnit] = useState<Unit | null>(null);
  const [deleteUnit, setDeleteUnit] = useState<Unit | null>(null);
  const [blockedDeleteUnit, setBlockedDeleteUnit] = useState<Unit | null>(null);

  const { mutateAsync: confirmDelete, isPending: isDeleting } = useMutation({
    mutationFn: async (id: number) => {
      const response = await deleteUnitService(id);
      if (response.status === 'error') {
        throw new Error(response.message || 'Failed to remove measurement.');
      }
    },
    onSuccess: () => {
      toast.success('The measurement has been removed successfully.');
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

  const handleDeleteClick = (unit: Unit) => {
    if (unit.actions.deletable) {
      setDeleteUnit(unit);
      return;
    }

    setBlockedDeleteUnit(unit);
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
        searchPlaceholder='Search ...'
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
                  title='No Measurement Reference Found'
                  description='No measurement reference found. It’s possible none exist yet, or your filters may be hiding results. Adjust your filters or check back later.'
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
                      {resolvedType && isUnitTypeValue(resolvedType) ? (
                        (() => {
                          const badgeStyle =
                            UNIT_TYPE_BADGE_STYLES[resolvedType];
                          const TypeIcon = badgeStyle.icon;

                          return (
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold ${badgeStyle.className}`}
                            >
                              <TypeIcon className='size-3.5 shrink-0' />
                              {formatTypeLabel(resolvedType)}
                            </span>
                          );
                        })()
                      ) : (
                        <TableCellEmpty label='Type not set' />
                      )}
                    </TableCell>

                    <TableCell className='align-center whitespace-nowrap'>
                      <div className='flex flex-nowrap items-center justify-start gap-2'>
                        <Button
                          type='button'
                          variant='outline'
                          className='text-foreground bg-background hover:bg-muted h-9 shrink-0 gap-1.5 rounded-md border-neutral-300 px-2.5 text-[13px]! font-semibold'
                          onClick={() => setEditUnit(unit)}
                        >
                          <SquarePenIcon className='size-3.5' />
                          Edit
                        </Button>
                        <Button
                          type='button'
                          variant='outline'
                          className='text-destructive hover:text-destructive border-destructive/35 bg-background hover:bg-destructive/10 h-9 shrink-0 cursor-pointer gap-1.5 rounded-md px-2.5 text-[13px]! font-semibold'
                          onClick={() => handleDeleteClick(unit)}
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
      <UnitRemovalBlockedAlert
        open={!!blockedDeleteUnit}
        onOpenChange={(o) => {
          if (!o) setBlockedDeleteUnit(null);
        }}
        measurementName={blockedDeleteUnit?.name}
        reason={blockedDeleteUnit?.actions.delete_block_reason ?? undefined}
      />
    </>
  );
}
