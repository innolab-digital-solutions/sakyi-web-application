'use client';

import { PlusIcon } from 'lucide-react';
import { useState } from 'react';

import MovementEquipmentForm from '@/components/admin/modules/movement-equipment/EquipmentForm';
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
          <Button
            type='button'
            className='h-10 shrink-0 gap-1.5 rounded-md px-2.5 text-[13px]! font-semibold'
          >
            <PlusIcon className='size-3.5' />
            Add equipment
          </Button>
        </SheetTrigger>
      )}
      <SheetContent className='overflow-y-auto px-6 sm:max-w-md [&>button]:cursor-pointer'>
        <SheetHeader className='px-0'>
          <SheetTitle className='text-foreground text-md font-bold'>
            {isEdit ? 'Edit equipment' : 'Add equipment'}
          </SheetTitle>
          <SheetDescription className='text-muted-foreground text-sm font-medium'>
            {isEdit
              ? 'Update the display name so exercises and programs stay aligned with what clients and coaches expect in the movement library.'
              : 'Add a catalog entry for gear used in exercises (weights, mats, machines, and similar). New items are available immediately in exercise forms.'}
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
