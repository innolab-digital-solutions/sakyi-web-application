import type { Metadata } from 'next';
import { Suspense } from 'react';

import PageHeader from '@/components/admin/layout/PageHeader';
import ExerciseListTable from '@/components/admin/modules/movement-exercises/ExerciseListTable';
import ExerciseSheet from '@/components/admin/modules/movement-exercises/ExerciseSheet';

export const metadata: Metadata = {
  title: 'Exercises | SaKyi Admin',
  description:
    'Browse and maintain exercises for the movement library: categories, difficulty, equipment, and optional media.',
};

export default function MovementExerciseListPage() {
  return (
    <div className='min-w-0 space-y-8'>
      <PageHeader
        title='Exercises'
        description='Review this list, search by name or description, filter by difficulty, and add or edit exercises so the movement library stays accurate for programming and care workflows.'
        actions={<ExerciseSheet mode='create' />}
      />

      <Suspense
        fallback={
          <div className='text-muted-foreground rounded-md border border-dashed p-8 text-center text-sm'>
            Loading…
          </div>
        }
      >
        <ExerciseListTable />
      </Suspense>
    </div>
  );
}
