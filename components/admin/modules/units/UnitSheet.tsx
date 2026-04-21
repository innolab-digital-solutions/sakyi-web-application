'use client';

import { PlusIcon } from 'lucide-react';
import { useState } from 'react';

import UnitForm from '@/components/admin/modules/units/UnitForm';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import type { Unit } from '@/domains/units/types';

type CreateProps = {
  mode: 'create';
  unit?: never;
  open?: never;
  onOpenChange?: never;
};

type EditProps = {
  mode: 'edit';
  unit: Unit;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type Props = CreateProps | EditProps;

export default function UnitSheet({ mode, unit, open, onOpenChange }: Props) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isEdit = mode === 'edit';
  const isOpen = isEdit ? open : internalOpen;
  const setOpen = isEdit ? onOpenChange : setInternalOpen;

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      {!isEdit && (
        <SheetTrigger asChild>
          <Button
            type='button'
            className='h-10 shrink-0 gap-1.5 rounded-md px-3 text-[13px]! font-semibold'
          >
            <PlusIcon className='size-3.5' />
            Add measurement
          </Button>
        </SheetTrigger>
      )}
      <SheetContent className='overflow-y-auto px-6 sm:max-w-md [&>button]:cursor-pointer'>
        <SheetHeader className='px-0'>
          <SheetTitle className='text-foreground text-[15.5px] font-bold capitalize'>
            {isEdit
              ? 'Edit measurement reference'
              : 'Create measurement reference'}
          </SheetTitle>
          <SheetDescription className='text-muted-foreground text-[13.5px] font-medium'>
            {isEdit
              ? 'Update the measurement name, abbreviation, or type so quantity records stay clear and consistent across planning, operations, and reporting.'
              : 'Add a measurement reference so staff can capture quantities with clear, consistent units across planning, operations, and reporting.'}
          </SheetDescription>
        </SheetHeader>
        {isEdit ? (
          <UnitForm
            key={unit.id}
            mode='edit'
            unit={unit}
            onSuccess={() => setOpen(false)}
          />
        ) : (
          <UnitForm mode='create' onSuccess={() => setOpen(false)} />
        )}
      </SheetContent>
    </Sheet>
  );
}
