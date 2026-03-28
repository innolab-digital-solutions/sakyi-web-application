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
          <Button className='cursor-pointer' size='lg'>
            <PlusIcon className='size-4' />
            Create Unit
          </Button>
        </SheetTrigger>
      )}
      <SheetContent className='overflow-y-auto px-6 sm:max-w-md [&>button]:cursor-pointer'>
        <SheetHeader className='mb-6'>
          <SheetTitle>{isEdit ? 'Edit Unit' : 'Create Unit'}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? 'Update the details of this measurement unit.'
              : 'Add a new measurement unit for use in nutrition profiles and items.'}
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
