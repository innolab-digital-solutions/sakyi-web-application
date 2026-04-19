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
            className='h-10 shrink-0 gap-1.5 rounded-md px-2.5 text-[13px]! font-semibold'
          >
            <PlusIcon className='size-3.5' />
            Add blog category
          </Button>
        </SheetTrigger>
      )}
      <SheetContent className='overflow-y-auto px-6 sm:max-w-md [&>button]:cursor-pointer'>
        <SheetHeader className='px-0'>
          <SheetTitle className='text-foreground text-md font-bold'>
            {isEdit ? 'Edit blog category' : 'Add blog category'}
          </SheetTitle>
          <SheetDescription className='text-muted-foreground text-sm font-medium'>
            {isEdit
              ? 'Update English and Myanmar names and descriptions so labels stay consistent wherever categories appear in the admin and on the site.'
              : 'Create a category to group blog posts. Provide both English and Myanmar translations so editors and readers see the right labels.'}
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
