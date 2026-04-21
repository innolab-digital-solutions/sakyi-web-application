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
import type { BlogCategory } from '@/domains/blog-categories/types';

import BlogCategoryForm from './CategoryForm';

type CreateProps = {
  mode: 'create';
  category?: never;
  open?: never;
  onOpenChange?: never;
};

type EditProps = {
  mode: 'edit';
  category: BlogCategory;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type Props = CreateProps | EditProps;

export default function BlogCategorySheet({
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
            Add blog category
          </Button>
        </SheetTrigger>
      )}
      <SheetContent className='overflow-y-auto px-6 sm:max-w-md [&>button]:cursor-pointer'>
        <SheetHeader className='px-0'>
          <SheetTitle className='text-foreground capitalize text-[15.5px] font-bold'>
            {isEdit ? 'Edit blog category' : 'Add blog category'}
          </SheetTitle>
          <SheetDescription className='text-muted-foreground text-[13.5px] font-medium'>
            {isEdit
              ? 'Revise English and Myanmar names or descriptions so category labels remain consistent in the admin library and public blog.'
              : 'Add a standardized blog category with English and Myanmar translations so posts can be grouped consistently.'}
          </SheetDescription>
        </SheetHeader>
        {isEdit ? (
          <BlogCategoryForm
            key={category.id}
            mode='edit'
            category={category}
            onSuccess={() => setOpen(false)}
          />
        ) : (
          <BlogCategoryForm mode='create' onSuccess={() => setOpen(false)} />
        )}
      </SheetContent>
    </Sheet>
  );
}
