import type { Metadata } from 'next';
import { Suspense } from 'react';

import PageHeader from '@/components/admin/layout/PageHeader';
import ExerciseListTable from '@/components/admin/modules/movement-exercises/ExerciseListTable';
import ExerciseSheet from '@/components/admin/modules/movement-exercises/ExerciseSheet';

export const metadata: Metadata = {
  title: 'Exercises | SaKyi Admin',
  description:
    'Manage standardized exercises with category, difficulty, equipment, and optional media for movement programming.',
};

export default function MovementExerciseListPage() {
  return (
    <div className='min-w-0 space-y-8'>
      <PageHeader
        title='Exercises'
        description='Manage shared exercises so movement programming remains accurate across category, difficulty, and equipment references.'
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
