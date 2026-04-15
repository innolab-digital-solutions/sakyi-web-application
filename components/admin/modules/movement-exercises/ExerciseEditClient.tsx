'use client';

import { useQuery } from '@tanstack/react-query';

import ExerciseForm from '@/components/admin/modules/movement-exercises/ExerciseForm';
import { ENDPOINTS } from '@/config/api/endpoints';
import { getMovementExerciseById } from '@/domains/movement-exercises/services';

type Props = {
  id: number;
};

export default function ExerciseEditClient({ id }: Props) {
  const {
    data: exercise,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [
      ENDPOINTS.ADMIN.MODULES.MOVEMENT_EXERCISES.DETAIL(String(id)),
      id,
    ],
    queryFn: async () => {
      const response = await getMovementExerciseById(id);
      if (response.status !== 'success') throw new Error(response.message);
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className='grid gap-6 lg:grid-cols-[2fr_1fr]'>
        <div className='space-y-5'>
          {[1, 2].map((i) => (
            <div
              key={i}
              className='bg-card border-border animate-pulse rounded-lg border p-6'
            >
              <div className='bg-muted mb-4 h-4 w-32 rounded' />
              <div className='space-y-3'>
                <div className='bg-muted h-9 rounded' />
                <div className='bg-muted h-9 rounded' />
                <div className='bg-muted h-20 rounded' />
              </div>
            </div>
          ))}
        </div>
        <div className='space-y-4'>
          {[1, 2].map((i) => (
            <div
              key={i}
              className='bg-card border-border animate-pulse rounded-lg border p-6'
            >
              <div className='bg-muted mb-4 h-4 w-24 rounded' />
              <div className='bg-muted h-9 rounded' />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !exercise) {
    return (
      <div className='text-muted-foreground py-12 text-center text-sm'>
        Failed to load exercise. Please go back and try again.
      </div>
    );
  }

  return <ExerciseForm mode='edit' exercise={exercise} />;
}
