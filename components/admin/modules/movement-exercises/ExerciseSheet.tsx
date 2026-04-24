'use client';

import { PlusIcon } from 'lucide-react';
import { useState } from 'react';

import ExerciseForm from '@/components/admin/modules/movement-exercises/ExerciseForm';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import type { MovementExercise } from '@/domains/movement-exercises/types';

type CreateProps = {
  mode: 'create';
  exercise?: never;
  open?: never;
  onOpenChange?: never;
};

type EditProps = {
  mode: 'edit';
  exercise: MovementExercise;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type Props = CreateProps | EditProps;

export default function ExerciseSheet({
  mode,
  exercise,
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
            Add exercise
          </Button>
        </SheetTrigger>
      )}
      <SheetContent className='overflow-y-auto px-6 sm:max-w-xl [&>button]:cursor-pointer'>
        <SheetHeader className='px-0'>
          <SheetTitle className='text-foreground text-[15.5px] font-bold capitalize'>
            {isEdit ? 'Edit exercise' : 'Create exercise'}
          </SheetTitle>
          <SheetDescription className='text-muted-foreground text-[13.5px] font-medium'>
            {isEdit
              ? 'Update this exercise’s details, category, difficulty, equipment, or media so movement programming stays accurate and dependable.'
              : 'Add a new exercise with category and difficulty, then include equipment or media details to support clear coaching and planning.'}
          </SheetDescription>
        </SheetHeader>
        {isEdit ? (
          <ExerciseForm
            key={exercise.id}
            mode='edit'
            exercise={exercise}
            onSuccess={() => setOpen(false)}
          />
        ) : (
          <ExerciseForm mode='create' onSuccess={() => setOpen(false)} />
        )}
      </SheetContent>
    </Sheet>
  );
}
