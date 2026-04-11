import type { Metadata } from 'next';

import PageHeader from '@/components/admin/layout/PageHeader';
import ExerciseEditClient from '@/components/admin/modules/movement-exercises/ExerciseEditClient';

export const metadata: Metadata = {
  title: 'Edit Exercise | SaKyi Admin',
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function MovementExerciseEditPage({ params }: Props) {
  const { id: idParam } = await params;
  const id = Number.parseInt(idParam, 10);

  if (Number.isNaN(id)) {
    throw new Error('Invalid exercise id.');
  }

  return (
    <div className='space-y-8'>
      <PageHeader
        title='Edit Exercise'
        description='Update exercise details, media, and settings.'
      />

      <ExerciseEditClient id={id} />
    </div>
  );
}
