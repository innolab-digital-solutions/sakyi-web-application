'use client';

import { PlusIcon } from 'lucide-react';
import { useState } from 'react';

import NutritionCategoryForm from '@/components/admin/modules/nutrition-categories/CategoryForm';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import type { NutritionCategory } from '@/domains/nutrition-categories/types';

type CreateProps = {
  mode: 'create';
  category?: never;
  open?: never;
  onOpenChange?: never;
};

type EditProps = {
  mode: 'edit';
  category: NutritionCategory;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type Props = CreateProps | EditProps;

export default function NutritionCategorySheet({
  mode,
  category,
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
            Add Food Category
          </Button>
        </SheetTrigger>
      )}
      <SheetContent className='overflow-y-auto px-6 sm:max-w-md [&>button]:cursor-pointer'>
        <SheetHeader className='px-0'>
          <SheetTitle className='text-foreground text-md font-bold'>
            {isEdit ? 'Edit Food Category' : 'Add Food Category'}
          </SheetTitle>
          <SheetDescription className='text-muted-foreground text-sm font-medium'>
            {isEdit
              ? 'Update name, description, and parent so items stay organized in the nutrition library.'
              : 'Add a category to group food items. Optional parent links build a simple hierarchy.'}
          </SheetDescription>
        </SheetHeader>
        {isEdit ? (
          <NutritionCategoryForm
            key={category.id}
            mode='edit'
            category={category}
            onSuccess={() => setOpen(false)}
          />
        ) : (
          <NutritionCategoryForm
            mode='create'
            onSuccess={() => setOpen(false)}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
