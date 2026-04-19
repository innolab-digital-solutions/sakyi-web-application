'use client';

import { PlusIcon } from 'lucide-react';
import { useState } from 'react';

import MovementCategoryForm from '@/components/admin/modules/movement-categories/CategoryForm';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import type { MovementCategory } from '@/domains/movement-categories/types';

type CreateProps = {
  mode: 'create';
  category?: never;
  open?: never;
  onOpenChange?: never;
};

type EditProps = {
  mode: 'edit';
  category: MovementCategory;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type Props = CreateProps | EditProps;

export default function MovementCategorySheet({
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
            Add Movement Category
          </Button>
        </SheetTrigger>
      )}
      <SheetContent className='overflow-y-auto px-6 sm:max-w-md [&>button]:cursor-pointer'>
        <SheetHeader className='px-0'>
          <SheetTitle className='text-foreground text-md font-bold'>
            {isEdit ? 'Edit Movement Category' : 'Add Movement Category'}
          </SheetTitle>
          <SheetDescription className='text-muted-foreground text-sm font-medium'>
            {isEdit
              ? 'Update name, description, and parent so exercises stay organized in the movement library.'
              : 'Add a movement category to group exercises. Optional parent links build a simple hierarchy in the movement library.'}
          </SheetDescription>
        </SheetHeader>
        {isEdit ? (
          <MovementCategoryForm
            key={category.id}
            mode='edit'
            category={category}
            onSuccess={() => setOpen(false)}
          />
        ) : (
          <MovementCategoryForm
            mode='create'
            onSuccess={() => setOpen(false)}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
