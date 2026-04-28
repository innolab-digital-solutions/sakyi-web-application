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
            className='h-10 shrink-0 gap-1.5 rounded-md px-3 text-[13px]! font-semibold'
          >
            <PlusIcon className='size-3.5' />
            Add food category
          </Button>
        </SheetTrigger>
      )}
      <SheetContent className='overflow-y-auto px-6 sm:max-w-md [&>button]:cursor-pointer'>
        <SheetHeader className='px-0'>
          <SheetTitle className='text-foreground text-[15.5px] font-bold capitalize'>
            {isEdit ? 'Edit food category' : 'Create food category'}
          </SheetTitle>
          <SheetDescription className='text-muted-foreground text-[13.5px] font-medium'>
            {isEdit
              ? 'Update the category name, description, or parent link so food items remain organized across nutrition planning and tracking.'
              : 'Create a food category to group nutrition items clearly and keep planning and operational records consistent.'}
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
