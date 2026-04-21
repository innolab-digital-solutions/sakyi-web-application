'use client';

import { PlusIcon } from 'lucide-react';
import { useState } from 'react';

import NutritionItemForm from '@/components/admin/modules/nutrition-items/ItemForm';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import type { NutritionItem } from '@/domains/nutrition-items/types';

type CreateProps = {
  mode: 'create';
  item?: never;
  open?: never;
  onOpenChange?: never;
};

type EditProps = {
  mode: 'edit';
  item: NutritionItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type Props = CreateProps | EditProps;

export default function NutritionItemSheet({
  mode,
  item,
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
            className='h-10 shrink-0 gap-1.5 rounded-md px-3 text-[13px]! font-semibold'
          >
            <PlusIcon className='size-3.5' />
            Add food item
          </Button>
        </SheetTrigger>
      )}
      <SheetContent className='overflow-y-auto px-6 sm:max-w-md [&>button]:cursor-pointer'>
        <SheetHeader className='px-0'>
          <SheetTitle className='text-foreground text-[15.5px] font-bold capitalize'>
            {isEdit ? 'Edit food item' : 'Create food item'}
          </SheetTitle>
          <SheetDescription className='text-muted-foreground text-[13.5px] font-medium'>
            {isEdit
              ? 'Revise this food item, category assignment, or default measurement so entries stay accurate across nutrition planning and operational tracking.'
              : 'Add a standardized food item and optionally assign a default measurement so portions and documentation stay consistent.'}
          </SheetDescription>
        </SheetHeader>
        {isEdit ? (
          <NutritionItemForm
            key={item.id}
            mode='edit'
            item={item}
            onSuccess={() => setOpen(false)}
          />
        ) : (
          <NutritionItemForm mode='create' onSuccess={() => setOpen(false)} />
        )}
      </SheetContent>
    </Sheet>
  );
}
