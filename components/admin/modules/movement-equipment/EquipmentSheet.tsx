'use client';

import { PlusIcon } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import type { MovementEquipment } from '@/domains/movement-equipment/types';

import MovementEquipmentForm from './EquipmentForm';

type CreateProps = {
  mode: 'create';
  equipment?: never;
  open?: never;
  onOpenChange?: never;
};

type EditProps = {
  mode: 'edit';
  equipment: MovementEquipment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type Props = CreateProps | EditProps;

export default function MovementEquipmentSheet({
  mode,
  equipment,
  open,
  onOpenChange,
}: Props) {
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
            Create Equipment
          </Button>
        </SheetTrigger>
      )}
      <SheetContent className='overflow-y-auto px-6 sm:max-w-md [&>button]:cursor-pointer'>
        <SheetHeader className='mb-6'>
          <SheetTitle>
            {isEdit ? 'Edit Equipment' : 'Create Equipment'}
          </SheetTitle>
          <SheetDescription>
            {isEdit
              ? 'Update the details of this movement equipment.'
              : 'Add a new equipment item used in movement exercises.'}
          </SheetDescription>
        </SheetHeader>
        {isEdit ? (
          <MovementEquipmentForm
            key={equipment.id}
            mode='edit'
            equipment={equipment}
            onSuccess={() => setOpen(false)}
          />
        ) : (
          <MovementEquipmentForm
            mode='create'
            onSuccess={() => setOpen(false)}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
