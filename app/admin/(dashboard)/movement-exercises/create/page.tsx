import type { Metadata } from 'next';

import PageHeader from '@/components/admin/layout/PageHeader';
import ExerciseForm from '@/components/admin/modules/movement-exercises/ExerciseForm';

export const metadata: Metadata = {
  title: 'Create Exercise | SaKyi Admin',
};

export default function MovementExerciseCreatePage() {
  return (
    <div className='space-y-8'>
      <PageHeader
        title='Create Exercise'
        description='Add a new movement exercise with media and difficulty settings.'
      />

      <ExerciseForm mode='create' />
    </div>
  );
}
