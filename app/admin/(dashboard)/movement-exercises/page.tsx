import type { Metadata } from 'next';
import { Suspense } from 'react';

import { AdminTablePageSkeleton } from '@/components/admin/layout/AdminLoadingSkeletons';
import PageHeader from '@/components/admin/layout/PageHeader';
import ExerciseListTable from '@/components/admin/modules/movement-exercises/ExerciseListTable';
import ExerciseSheet from '@/components/admin/modules/movement-exercises/ExerciseSheet';

export const metadata: Metadata = {
  title: 'Exercises | SaKyi Admin',
  description:
    'Manage a standardized exercise library with category, difficulty, equipment, and optional media so movement programming remains accurate and reusable.',
};

export default function MovementExerciseListPage() {
  return (
    <div className='min-w-0 space-y-8'>
      <PageHeader
        title='Exercises'
        description='Manage a standardized exercise library with category, difficulty, equipment, and optional media so movement programming remains accurate and reusable.'
        actions={<ExerciseSheet mode='create' />}
      />

      <Suspense fallback={<AdminTablePageSkeleton />}>
        <ExerciseListTable />
      </Suspense>
    </div>
  );
}
