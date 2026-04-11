import { PlusIcon } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

import PageHeader from '@/components/admin/layout/PageHeader';
import ExerciseListTable from '@/components/admin/modules/movement-exercises/ExerciseListTable';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';

export const metadata: Metadata = {
  title: 'Exercises | SaKyi Admin',
  description: 'Browse and manage movement exercises across all categories.',
};

export default function MovementExerciseListPage() {
  return (
    <div className='min-w-0 space-y-8'>
      <PageHeader
        title='Exercises'
        description='Manage movement exercises across all categories. Filter by difficulty, category, or status to quickly find what you need.'
        actions={
          <Button asChild size='lg'>
            <Link href={ROUTES.ADMIN.MODULES.MOVEMENT_EXERCISES.CREATE}>
              <PlusIcon className='size-4' />
              Create exercise
            </Link>
          </Button>
        }
      />

      <Suspense
        fallback={
          <div className='text-muted-foreground rounded-md border border-dashed p-8 text-center text-sm'>
            Loading exercises…
          </div>
        }
      >
        <ExerciseListTable />
      </Suspense>
    </div>
  );
}
