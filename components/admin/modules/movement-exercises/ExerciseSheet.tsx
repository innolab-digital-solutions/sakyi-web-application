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
            className='h-10 shrink-0 gap-1.5 rounded-md px-2.5 text-[13px]! font-semibold'
          >
            <PlusIcon className='size-3.5' />
            Add Exercise
          </Button>
        </SheetTrigger>
      )}
      <SheetContent className='overflow-y-auto px-6 sm:max-w-md [&>button]:cursor-pointer'>
        <SheetHeader className='px-0'>
          <SheetTitle className='text-foreground text-md font-bold'>
            {isEdit ? 'Edit Exercise' : 'Add Exercise'}
          </SheetTitle>
          <SheetDescription className='text-muted-foreground text-sm font-medium'>
            {isEdit
              ? 'Update name, description, category, difficulty, equipment, and optional video link so this exercise stays accurate in the movement library.'
              : 'Add an exercise to the movement library. Choose category and difficulty, then optionally add description, equipment, and a YouTube link.'}
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
