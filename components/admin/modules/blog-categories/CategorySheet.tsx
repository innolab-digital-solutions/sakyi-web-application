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
          <Button className='cursor-pointer' size='lg'>
            <PlusIcon className='size-4' />
            Create Category
          </Button>
        </SheetTrigger>
      )}
      <SheetContent className='overflow-y-auto px-6 sm:max-w-md [&>button]:cursor-pointer'>
        <SheetHeader className='mb-6'>
          <SheetTitle>
            {isEdit ? 'Edit Category' : 'Create Category'}
          </SheetTitle>
          <SheetDescription>
            {isEdit
              ? 'Update the details of this blog category.'
              : 'Add a new category to organise blog posts. Fill in translations for both English and Myanmar.'}
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
